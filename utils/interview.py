"""
Interview Module
Generates interview questions and evaluates answers using OpenAI GPT.
"""

import json
import os
from openai import OpenAI


def get_openai_client():
    base_url = os.getenv("BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not base_url:
        raise ValueError("OPENAI_API_KEY or BASE_URL not set in environment")
    return OpenAI(api_key=api_key, base_url=base_url)


def generate_interview_questions(parsed: dict) -> dict:
    """
    Generate categorized interview questions from resume content.
    Returns technical, HR, project-based, and scenario questions.
    """
    client = get_openai_client()

    resume_summary = f"""
Name: {parsed.get('name', 'Candidate')}
Skills: {', '.join(parsed.get('skills', [])[:15])}
Experience: {chr(10).join(parsed.get('experience', [])[:3])}
Projects: {chr(10).join(parsed.get('projects', [])[:3])}
Education: {chr(10).join(parsed.get('education', [])[:2])}
Certifications: {', '.join(parsed.get('certifications', [])[:5])}
"""

    prompt = f"""
You are a senior technical interviewer and HR specialist.

Based on the following resume, generate exactly 16 interview questions (4 per category).
Make questions SPECIFIC to this candidate's resume — not generic.

RESUME:
{resume_summary}

Return ONLY a valid JSON object (no markdown):
{{
  "candidate_name": "name",
  "target_role": "detected role",
  "questions": [
    {{
      "id": 1,
      "category": "Technical",
      "difficulty": "Medium",
      "question": "Specific technical question based on their skills/projects",
      "what_to_look_for": "Key points the answer should cover",
      "follow_up": "One follow-up question"
    }},
    {{
      "id": 2,
      "category": "Technical",
      "difficulty": "Hard",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 3,
      "category": "Technical",
      "difficulty": "Easy",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 4,
      "category": "Technical",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 5,
      "category": "HR",
      "difficulty": "Easy",
      "question": "Tell me about yourself and your journey in tech",
      "what_to_look_for": "Clarity, confidence, relevance",
      "follow_up": "What motivates you to work in this field?"
    }},
    {{
      "id": 6,
      "category": "HR",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 7,
      "category": "HR",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 8,
      "category": "HR",
      "difficulty": "Easy",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 9,
      "category": "Project-Based",
      "difficulty": "Medium",
      "question": "Walk me through your most complex project in detail",
      "what_to_look_for": "Technical depth, problem-solving, ownership",
      "follow_up": "What would you do differently?"
    }},
    {{
      "id": 10,
      "category": "Project-Based",
      "difficulty": "Hard",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 11,
      "category": "Project-Based",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 12,
      "category": "Project-Based",
      "difficulty": "Easy",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 13,
      "category": "Scenario-Based",
      "difficulty": "Hard",
      "question": "You are given a broken production system with no logs. How do you debug it?",
      "what_to_look_for": "Systematic thinking, calmness under pressure",
      "follow_up": "How would you prevent this in future?"
    }},
    {{
      "id": 14,
      "category": "Scenario-Based",
      "difficulty": "Hard",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 15,
      "category": "Scenario-Based",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }},
    {{
      "id": 16,
      "category": "Scenario-Based",
      "difficulty": "Medium",
      "question": "...",
      "what_to_look_for": "...",
      "follow_up": "..."
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model= os.getenv("MODEL_NAME"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=3000
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Failed to parse questions", "questions": [], "raw": raw}


def evaluate_answer(question: str, answer: str, category: str, parsed_resume: dict) -> dict:
    """
    Evaluate a candidate's answer to an interview question.
    Returns score (0-10), feedback, and model answer.
    """
    client = get_openai_client()

    candidate_context = f"""
Skills: {', '.join(parsed_resume.get('skills', [])[:10])}
Experience snippets: {' | '.join(parsed_resume.get('experience', [])[:2])}
Projects: {' | '.join(parsed_resume.get('projects', [])[:2])}
"""

    prompt = f"""
You are an experienced interviewer evaluating a candidate's answer.

CANDIDATE BACKGROUND:
{candidate_context}

INTERVIEW QUESTION ({category}):
{question}

CANDIDATE'S ANSWER:
{answer}

Evaluate this answer and return ONLY a valid JSON object (no markdown):
{{
  "score": 7,
  "score_label": "Good",
  "strengths": ["What the candidate did well", "Another strength"],
  "weaknesses": ["What was missing", "What could be better"],
  "detailed_feedback": "2-3 sentences of constructive feedback",
  "model_answer": "A concise example of what an excellent answer would cover",
  "tips_for_improvement": "One specific actionable tip",
  "follow_up_suggested": true
}}

Score guide: 9-10=Excellent, 7-8=Good, 5-6=Average, 3-4=Below Average, 1-2=Poor
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 5,
            "score_label": "Average",
            "detailed_feedback": raw[:300],
            "model_answer": "Could not generate model answer.",
            "strengths": [],
            "weaknesses": [],
            "tips_for_improvement": "Review the question and try again."
        }
