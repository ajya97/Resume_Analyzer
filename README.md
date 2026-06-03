<div align="center">

<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>

<br/><br/>

# ⚡ ResumeAI
### AI-Powered Resume Analyzer & Interview Assistant

**Upload your PDF resume → Get an instant ATS score, error report, keyword analysis, skill-gap breakdown, and a full GPT-4 powered mock interview — in one place.**

<br/>

[🚀 Live Demo](#) &nbsp;·&nbsp; [📖 Documentation](#-api-reference) &nbsp;·&nbsp; [🐛 Report Bug](../../issues) &nbsp;·&nbsp; [✨ Request Feature](../../issues)

<br/>

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [ATS Scoring System](#-ats-scoring-system)
- [Interview Engine](#-interview-engine)
- [Security](#-security)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 About the Project

**ResumeAI** is a production-grade, full-stack web application built as a Final Year Project (FYP). It bridges the gap between job seekers and the modern hiring process by providing:

- **Instant ATS compatibility scoring** using a custom rule-based algorithm across 7 resume dimensions
- **AI-powered deep analysis** via OpenAI GPT-4o-mini for skill gap detection, keyword recommendations, and improvement suggestions
- **Interactive mock interviews** with resume-personalized questions across 4 categories, real-time answer evaluation, and detailed GPT feedback

The entire system runs on a **pure Python + Flask backend** with a **zero-framework Vanilla JS frontend** — making it lightweight, fast, and easy to understand, extend, and deploy.

> Built for: Final Year Projects · Hackathons · Software Engineering Portfolios · Career Prep Tools

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 📤 **PDF Resume Upload** | Drag-and-drop upload with file validation, progress indicator, and error handling |
| 2 | 🔍 **Resume Parsing** | Extracts name, email, phone, LinkedIn, GitHub, skills, education, experience, projects, certifications, and achievements into structured JSON |
| 3 | 📊 **ATS Score (0–100)** | Custom scoring across 7 dimensions with animated ring chart and section breakdown |
| 4 | 🚨 **Error Detection** | Finds missing contact info, weak action verbs, long paragraphs, missing quantification, and 10+ other issues with severity labels |
| 5 | ⚠️ **Missing Section Alerts** | Identifies absent resume sections, explains why they matter, and suggests content |
| 6 | 🎯 **Keyword Optimization** | GPT-4 generates missing ATS keywords, technical terms, industry keywords, and role-specific phrases |
| 7 | 🧠 **Skill Gap Analysis** | Detects strong skills, weak areas, missing critical skills, and recommends what to learn with resources |
| 8 | 💡 **Improvement Suggestions** | Prioritized (High / Medium / Low) actionable suggestions for content, skills, formatting, and ATS optimization |
| 9 | 🎤 **Interview Question Generator** | Creates 16 personalized questions across Technical, HR, Project-Based, and Scenario-Based categories |
| 10 | 🤖 **Interactive Mock Interview** | One-question-at-a-time session with AI scoring, strengths/weaknesses breakdown, model answers, and tips |

---

## 🧱 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              HTML5  ·  CSS3  ·  Vanilla JavaScript           │
├─────────────────────────────────────────────────────────────┤
│                         Backend                              │
│                   Python 3.10+  ·  Flask 3.0                 │
├─────────────────────────────────────────────────────────────┤
│                       AI Engine                              │
│                  OpenAI GPT-4o-mini API                      │
├─────────────────────────────────────────────────────────────┤
│                     PDF Processing                           │
│               pdfplumber  ·  PyPDF2  ·  regex                │
├─────────────────────────────────────────────────────────────┤
│                      Deployment                              │
│             Render  ·  Railway  ·  VPS + Nginx               │
└─────────────────────────────────────────────────────────────┘
```

**No React. No Node. No MongoDB. No TypeScript.** Pure, clean, production-ready Python + Vanilla JS.

---

## 📁 Project Structure

```
resume-analyzer/
│
├── app.py                    # Flask application — all routes & API endpoints
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── README.md
│
├── static/
│   ├── css/
│   │   ├── main.css          # Core styles — bold colorful gradient theme
│   │   └── interview.css     # Interview page specific styles
│   ├── js/
│   │   ├── main.js           # Landing page — upload, analysis, tab rendering
│   │   └── interview.js      # Interview session — questions, feedback, scoring
│   └── uploads/              # Temp upload directory (auto-created, auto-cleaned)
│
├── templates/
│   ├── index.html            # Landing page + full analysis dashboard
│   └── interview.html        # Interactive mock interview page
│
└── utils/
    ├── __init__.py
    ├── parser.py             # PDF extraction + regex-based resume parsing
    ├── ats_score.py          # ATS scoring algorithm, error detection, missing sections
    ├── analyzer.py           # OpenAI GPT-4 deep analysis integration
    └── interview.py          # GPT-4 question generation & answer evaluation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://python.org)
- **pip** — comes with Python
- **OpenAI API Key** — [Get yours here](https://platform.openai.com/api-keys)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer
```

**2. Create and activate a virtual environment**

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (CMD)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` in any text editor and set your values (see [Environment Variables](#-environment-variables) below).

**5. Run the development server**

```bash
python app.py
```

Open **http://localhost:5000** in your browser. Upload any PDF resume and start exploring.

---

## 🔑 Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Required — your OpenAI API key
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Required — any random string for Flask session encryption
FLASK_SECRET_KEY=my-super-secret-key-change-this

# Optional — set to False in production
FLASK_DEBUG=True
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key from [platform.openai.com](https://platform.openai.com) |
| `FLASK_SECRET_KEY` | ✅ Yes | Random string for signing session cookies |
| `FLASK_DEBUG` | ❌ No | `True` for development, `False` for production |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🌐 API Reference

### `POST /api/upload`

Upload a PDF resume and receive a full analysis.

**Request** — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `resume` | `File` | PDF file, max 5MB |

**Response — `200 OK`**

```json
{
  "success": true,
  "parsed": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+91-9876543210",
    "linkedin": "linkedin.com/in/janesmith",
    "github": "github.com/janesmith",
    "skills": ["Python", "Flask", "PostgreSQL", "Docker"],
    "education": ["B.Tech Computer Science — XYZ University, 2024 | CGPA: 8.6"],
    "experience": ["Backend Intern — ABC Tech, June–Aug 2023"],
    "projects": ["AI Chatbot using LangChain & OpenAI | github.com/..."],
    "certifications": ["AWS Cloud Practitioner", "Google Data Analytics"],
    "achievements": ["1st Place — National Hackathon 2023"]
  },
  "ats": {
    "total_score": 74,
    "rating": "Good",
    "sections": {
      "contact_info": { "score": 8, "max": 10 },
      "skills":       { "score": 16, "max": 20 },
      "experience":   { "score": 14, "max": 20 },
      "education":    { "score": 13, "max": 15 },
      "projects":     { "score": 12, "max": 15 },
      "certifications":{ "score": 6, "max": 10 },
      "keyword_density":{ "score": 5, "max": 10 }
    },
    "top_tips": ["Add GitHub profile URL", "Quantify achievements with numbers"]
  },
  "missing_sections": [
    {
      "section": "Professional Summary",
      "why_it_matters": "Recruiters read the summary first...",
      "suggestion": "Add a 3-4 line summary at the top of your resume."
    }
  ],
  "errors": [
    {
      "type": "No Quantified Results",
      "severity": "Medium",
      "fix": "Add numbers to achievements (e.g., 'Improved speed by 30%')"
    }
  ],
  "gpt_analysis": {
    "target_role": "Backend Python Developer",
    "profile_summary": "Jane is a final-year CS student with strong Python skills...",
    "skill_gap_analysis": {
      "strong_skills": ["Python", "Flask"],
      "weak_areas": ["System Design", "CI/CD"],
      "missing_critical_skills": ["Docker", "Kubernetes"],
      "recommended_skills_to_learn": [
        { "skill": "Docker", "reason": "Essential for modern backend roles", "resource": "Docker Official Docs" }
      ]
    },
    "keyword_recommendations": {
      "missing_ats_keywords": ["REST API", "Microservices", "CI/CD"],
      "recommended_technical_keywords": ["FastAPI", "Redis", "Celery"],
      "industry_keywords": ["Agile", "Version Control", "Code Review"],
      "role_specific_keywords": ["ORM", "SQLAlchemy", "Unit Testing"]
    },
    "improvement_suggestions": [
      { "priority": "High", "category": "Content", "suggestion": "Add quantified metrics to all experience bullets." }
    ],
    "interview_readiness": {
      "score": 68,
      "strengths": ["Strong project portfolio", "Relevant certifications"],
      "weak_points": ["Limited industry experience", "Missing system design knowledge"],
      "preparation_tips": ["Practice LeetCode medium problems", "Read about system design basics"]
    }
  }
}
```

---

### `POST /api/generate-questions`

Generate personalized interview questions from parsed resume data.

**Request** — `application/json`

```json
{ "parsed": { "...resume fields..." } }
```

**Response — `200 OK`**

```json
{
  "success": true,
  "candidate_name": "Jane Smith",
  "target_role": "Backend Python Developer",
  "questions": [
    {
      "id": 1,
      "category": "Technical",
      "difficulty": "Medium",
      "question": "You mentioned using Flask in your projects. How would you handle authentication and authorization in a production Flask API?",
      "what_to_look_for": "JWT tokens, Flask-Login, role-based access, session management",
      "follow_up": "How would you protect against CSRF attacks in your Flask app?"
    },
    {
      "id": 5,
      "category": "HR",
      "difficulty": "Easy",
      "question": "Tell me about yourself and your journey in software development.",
      "what_to_look_for": "Clarity, confidence, relevance to the role",
      "follow_up": "What motivates you to pursue a career in backend development?"
    }
  ]
}
```

---

### `POST /api/evaluate-answer`

Evaluate a candidate's answer and return AI feedback.

**Request** — `application/json`

```json
{
  "question": "How would you handle authentication in a Flask API?",
  "answer": "I would use JWT tokens with the Flask-JWT-Extended library. Each login generates a token stored client-side...",
  "category": "Technical"
}
```

**Response — `200 OK`**

```json
{
  "success": true,
  "evaluation": {
    "score": 8,
    "score_label": "Good",
    "strengths": [
      "Correctly identified JWT as the right tool",
      "Mentioned client-side token storage"
    ],
    "weaknesses": [
      "Did not mention token expiry and refresh token strategy",
      "No mention of HTTPS requirement for secure token transmission"
    ],
    "detailed_feedback": "Strong answer demonstrating practical knowledge of JWT-based auth. Adding details about refresh tokens and HTTPS enforcement would make it complete.",
    "model_answer": "For a Flask API, I'd use Flask-JWT-Extended for JWT-based auth. Access tokens (15-min expiry) + refresh tokens stored in HTTP-only cookies. All routes protected via @jwt_required decorator. HTTPS enforced at the infrastructure level.",
    "tips_for_improvement": "Study refresh token rotation patterns and secure cookie attributes (HttpOnly, SameSite, Secure)."
  }
}
```

---

### `GET /api/interview-summary`

Get the session summary after completing an interview.

**Response — `200 OK`**

```json
{
  "candidate_name": "Jane Smith",
  "total_questions_answered": 12,
  "total_questions": 16,
  "average_score": 7.2,
  "score_label": "Good",
  "individual_scores": [8, 6, 9, 7, 5, 8, 7, 6, 8, 7, 9, 7]
}
```

---

## 📊 ATS Scoring System

The ATS score is computed **entirely rule-based** (no API cost) across **7 weighted categories**:

```
Total Score = Contact(10) + Skills(20) + Experience(20) +
              Education(15) + Projects(15) + Certifications(10) + Keywords(10)
                                                                = 100 points
```

| Category | Max | Key Signals |
|----------|-----|-------------|
| **Contact Info** | 10 | Email (+3), Phone (+3), LinkedIn (+2), GitHub (+2) |
| **Skills** | 20 | Count ≥10 (+10), categorized (+5), tech keywords (+5) |
| **Experience** | 20 | Entry count, strong action verbs, quantified results |
| **Education** | 15 | Degree presence, GPA/CGPA mention, degree type |
| **Projects** | 15 | Count ≥3, GitHub/demo links, tech stack described |
| **Certifications** | 10 | Count-based scoring |
| **Keyword Density** | 10 | Match rate against 40+ ATS keyword database |

**Score Ratings:**

| Score | Rating |
|-------|--------|
| 85 – 100 | 🟢 Excellent |
| 70 – 84 | 🔵 Good |
| 55 – 69 | 🟡 Average |
| 40 – 54 | 🟠 Below Average |
| 0 – 39 | 🔴 Poor |

---

## 🎤 Interview Engine

### Question Categories

| Category | Count | Focus |
|----------|-------|-------|
| **Technical** | 4 | Skills, tools, frameworks from resume |
| **HR** | 4 | Behavioral, soft skills, motivation |
| **Project-Based** | 4 | Deep dive into listed projects |
| **Scenario-Based** | 4 | Real-world problem solving |

### Answer Scoring Scale

| Score | Label |
|-------|-------|
| 9 – 10 | Excellent |
| 7 – 8 | Good |
| 5 – 6 | Average |
| 3 – 4 | Below Average |
| 1 – 2 | Poor |

Each evaluated answer returns: numeric score, score label, strengths list, weaknesses list, detailed feedback paragraph, model answer, and one actionable improvement tip.

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| File Type Validation | Only `.pdf` extension accepted server-side |
| File Size Limit | Hard cap at 5MB via Flask `MAX_CONTENT_LENGTH` |
| Secure Filename | `werkzeug.utils.secure_filename` prevents path traversal |
| Auto File Cleanup | Uploaded PDFs deleted from disk immediately after processing |
| Secret Key | Flask session signed with configurable `FLASK_SECRET_KEY` |
| No Hardcoded Secrets | All sensitive values loaded from `.env` via `python-dotenv` |
| Error Sanitization | Exception details never exposed to the client |
| Input Validation | All API inputs validated before forwarding to OpenAI |

---

## 🚢 Deployment

### Option 1 — Render *(Recommended for FYP demos)*

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repository
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Add environment variables in the Render dashboard
6. Click **Deploy**

> Add `gunicorn==21.2.0` to `requirements.txt` before deploying.

---

### Option 2 — Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway variables set OPENAI_API_KEY=sk-...
railway variables set FLASK_SECRET_KEY=your-secret
railway up
```

---

### Option 3 — VPS + Nginx + Gunicorn

```bash
# Install & run
pip install -r requirements.txt gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app --daemon
```

**Nginx config (`/etc/nginx/sites-available/resumeai`):**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/resumeai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🗺️ Roadmap

- [x] PDF resume upload with drag-and-drop
- [x] Regex-based structured resume parsing
- [x] Rule-based ATS scoring (7 categories)
- [x] GPT-4 deep analysis — skill gap, keywords, suggestions
- [x] Interactive mock interview with answer evaluation
- [ ] LinkedIn job description import for targeted keyword matching
- [ ] Resume PDF export with AI-suggested edits applied
- [ ] User accounts & interview history (SQLite)
- [ ] Multi-language resume support
- [ ] Resume template generator based on ATS score gaps
- [ ] Browser extension for one-click job application analysis

---

## 🤝 Contributing

Contributions are welcome and appreciated.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to the branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow the existing code style and add comments for any new logic. Open an issue first for major changes.

---

## 📦 Dependencies

```
flask==3.0.3
openai==1.35.0
pdfplumber==0.11.1
PyPDF2==3.0.1
python-dotenv==1.0.1
Werkzeug==3.0.3
```

Install all at once:
```bash
pip install -r requirements.txt
```

---

## 🎓 Academic Info

| Field | Detail |
|-------|--------|
| Project Type | Final Year Project (FYP) |
| Domain | Artificial Intelligence · Full-Stack Web Development |
| AI Integration | OpenAI GPT-4o-mini via REST API |
| Architecture | MVC-inspired Flask App with modular `utils/` layer |
| Total Codebase | ~5,500 lines across 12 files |
| Core Features | 10 fully implemented |

---

## 📄 License

Distributed under the **MIT License**.  
See [`LICENSE`](LICENSE) for full text.

```
MIT License — free to use, modify, and distribute for educational and commercial purposes.
Attribution appreciated but not required.
```

---

<div align="center">

**Made with ⚡ using Python, Flask, and OpenAI GPT-4**

*If this project helped you, please consider giving it a ⭐ — it means a lot!*

</div>
