"""
Resume Analyzer Module
Uses OpenAI GPT to generate deep analysis, keyword recommendations, and skill gap analysis.
"""

import json
import os
from openai import OpenAI


def get_openai_client():
    """Initialize and return the OpenAI client."""
    base_url = os.getenv("BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not base_url:
        raise ValueError("OPENAI_API_KEY or BASE_URL not set in environment variables")
    return OpenAI(api_key=api_key, base_url=base_url)


def analyze_resume_with_gpt(parsed: dict) -> dict:
    """
    Send resume data to GPT-4 for deep analysis.
    Returns keyword recommendations, skill gap analysis, and improvement suggestions.
    """
    client = get_openai_client()

    resume_summary = f"""
Name: {parsed.get('name', 'N/A')}
Email: {parsed.get('email', 'N/A')}
Phone: {parsed.get('phone', 'N/A')}
LinkedIn: {parsed.get('linkedin', 'N/A')}
GitHub: {parsed.get('github', 'N/A')}

Skills: {', '.join(parsed.get('skills', []))}

Education:
{chr(10).join(parsed.get('education', []))}

Experience:
{chr(10).join(parsed.get('experience', []))}

Projects:
{chr(10).join(parsed.get('projects', []))}

Certifications:
{', '.join(parsed.get('certifications', []))}

Achievements:
{', '.join(parsed.get('achievements', []))}
"""

    prompt = f"""
You are an expert ATS Resume Analyzer, HR recruiter, and career coach.

Analyze the following resume data and return a detailed JSON report:

RESUME DATA:
{resume_summary}

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{{
  "target_role": "Detected or most likely target role",
  "profile_summary": "2-3 sentence professional summary of this candidate",
  "skill_gap_analysis": {{
    "strong_skills": ["skill1", "skill2"],
    "weak_areas": ["area1", "area2"],
    "missing_critical_skills": ["skill1", "skill2"],
    "recommended_skills_to_learn": [
      {{"skill": "skill name", "reason": "why important", "resource": "platform to learn"}}
    ]
  }},
  "keyword_recommendations": {{
    "missing_ats_keywords": ["keyword1", "keyword2"],
    "recommended_technical_keywords": ["kw1", "kw2"],
    "industry_keywords": ["kw1", "kw2"],
    "role_specific_keywords": ["kw1", "kw2"]
  }},
  "improvement_suggestions": [
    {{"priority": "High", "category": "Content", "suggestion": "specific actionable tip"}},
    {{"priority": "High", "category": "Skills", "suggestion": "specific actionable tip"}},
    {{"priority": "Medium", "category": "Formatting", "suggestion": "specific actionable tip"}},
    {{"priority": "Medium", "category": "ATS", "suggestion": "specific actionable tip"}},
    {{"priority": "Low", "category": "Branding", "suggestion": "specific actionable tip"}}
  ],
  "interview_readiness": {{
    "score": 65,
    "strengths": ["strength1", "strength2"],
    "weak_points": ["weakness1", "weakness2"],
    "preparation_tips": ["tip1", "tip2"]
  }},
  "resume_strength_score": 70,
  "overall_feedback": "One paragraph of honest, constructive overall feedback"
}}
"""

    response = client.chat.completions.create(
        model= os.getenv("MODEL_NAME"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=2000
    )

    raw = response.choices[0].message.content.strip()
    # Clean any markdown fences if present
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse GPT analysis",
            "raw": raw,
            "profile_summary": "Analysis could not be parsed.",
            "overall_feedback": raw[:500]
        }
