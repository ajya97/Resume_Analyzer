"""
AI Resume Analyzer & Interview Assistant
Flask Application — Main Entry Point
"""

import os
import json
import uuid
from pathlib import Path
from flask import Flask, request, jsonify, render_template, session
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from utils.parser import parse_resume
from utils.ats_score import calculate_ats_score, detect_missing_sections, detect_errors
from utils.analyzer import analyze_resume_with_gpt
from utils.interview import generate_interview_questions, evaluate_answer

# ─── App Setup ────────────────────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "resume-analyzer-secret-2024")

UPLOAD_FOLDER = Path("static/uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── Page Routes ──────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Landing page with upload section."""
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    """ATS analysis dashboard."""
    return render_template("dashboard.html")


@app.route("/interview")
def interview():
    """Interactive interview page."""
    return render_template("interview.html")


# ─── API: Upload & Analyze ────────────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload_resume():
    """
    Upload a PDF resume, parse it, run ATS scoring,
    and return structured analysis data.
    """
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    # Save file with unique name to avoid collisions
    unique_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    file_path = UPLOAD_FOLDER / unique_name
    file.save(str(file_path))

    try:
        # Step 1: Parse the resume
        parsed = parse_resume(str(file_path))

        # Step 2: ATS Score
        ats = calculate_ats_score(parsed)

        # Step 3: Detect missing sections & errors
        missing = detect_missing_sections(parsed)
        errors = detect_errors(parsed)

        # Step 4: GPT deep analysis
        gpt_analysis = analyze_resume_with_gpt(parsed)

        # Store in session for interview module
        session["parsed_resume"] = {k: v for k, v in parsed.items() if k != "raw_text"}
        session["candidate_name"] = parsed.get("name", "Candidate")

        # Clean up uploaded file after processing
        file_path.unlink(missing_ok=True)

        return jsonify({
            "success": True,
            "parsed": {k: v for k, v in parsed.items() if k != "raw_text"},
            "ats": ats,
            "missing_sections": missing,
            "errors": errors,
            "gpt_analysis": gpt_analysis,
        })

    except ValueError as e:
        file_path.unlink(missing_ok=True)
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        file_path.unlink(missing_ok=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


# ─── API: Interview ───────────────────────────────────────────────────────────

@app.route("/api/generate-questions", methods=["POST"])
def generate_questions():
    """
    Generate interview questions based on the uploaded resume.
    Requires resume to have been uploaded first (stored in session).
    """
    parsed = session.get("parsed_resume")
    if not parsed:
        # Allow passing resume data in request body as fallback
        data = request.get_json(silent=True)
        if data and "parsed" in data:
            parsed = data["parsed"]
        else:
            return jsonify({"error": "No resume data found. Please upload your resume first."}), 400

    try:
        questions_data = generate_interview_questions(parsed)
        session["interview_questions"] = questions_data.get("questions", [])
        session["current_question_index"] = 0
        session["interview_scores"] = []
        return jsonify({"success": True, **questions_data})
    except Exception as e:
        return jsonify({"error": f"Failed to generate questions: {str(e)}"}), 500


@app.route("/api/evaluate-answer", methods=["POST"])
def evaluate():
    """
    Evaluate a candidate's answer to an interview question.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400

    question = data.get("question", "")
    answer = data.get("answer", "").strip()
    category = data.get("category", "General")

    if not question or not answer:
        return jsonify({"error": "Question and answer are required"}), 400

    if len(answer) < 10:
        return jsonify({"error": "Answer is too short. Please provide a meaningful response."}), 400

    parsed = session.get("parsed_resume", {})

    try:
        evaluation = evaluate_answer(question, answer, category, parsed)

        # Track scores in session
        scores = session.get("interview_scores", [])
        scores.append(evaluation.get("score", 5))
        session["interview_scores"] = scores

        return jsonify({"success": True, "evaluation": evaluation})
    except Exception as e:
        return jsonify({"error": f"Evaluation failed: {str(e)}"}), 500


@app.route("/api/interview-summary", methods=["GET"])
def interview_summary():
    """Return the interview session summary with average score."""
    scores = session.get("interview_scores", [])
    questions = session.get("interview_questions", [])
    name = session.get("candidate_name", "Candidate")

    if not scores:
        return jsonify({"error": "No interview data found"}), 404

    avg = round(sum(scores) / len(scores), 1)
    label = "Excellent" if avg >= 8 else "Good" if avg >= 6 else "Average" if avg >= 4 else "Needs Work"

    return jsonify({
        "candidate_name": name,
        "total_questions_answered": len(scores),
        "total_questions": len(questions),
        "average_score": avg,
        "score_label": label,
        "individual_scores": scores,
    })


# ─── Error Handlers ───────────────────────────────────────────────────────────

@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"error": "File too large. Maximum size is 5MB."}), 413


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(debug=debug, host="0.0.0.0", port=5000)
