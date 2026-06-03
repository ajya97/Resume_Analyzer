"""
Resume Parser Module
Extracts structured information from PDF resumes using pdfplumber + regex.
"""

import re
import pdfplumber
from pathlib import Path


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {str(e)}")
    return text.strip()


def extract_email(text: str) -> str:
    pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    pattern = r'(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}'
    match = re.search(pattern, text)
    return match.group(0).strip() if match else ""


def extract_linkedin(text: str) -> str:
    pattern = r'(linkedin\.com/in/[\w\-]+|linkedin\.com/[\w\-/]+)'
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(0) if match else ""


def extract_github(text: str) -> str:
    pattern = r'(github\.com/[\w\-]+)'
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(0) if match else ""


def extract_name(text: str) -> str:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        if re.search(r'[@/\d\(\)\+\-]{3,}', line):
            continue
        if len(line) > 60:
            continue
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
            return line
    return lines[0] if lines else "Unknown"


def extract_section(text: str, section_keywords: list, next_section_keywords: list) -> str:
    lines = text.split('\n')
    capturing = False
    section_lines = []
    section_pattern = re.compile(
        r'^\s*(' + '|'.join(re.escape(k) for k in section_keywords) + r')\s*[:\-]?\s*$',
        re.IGNORECASE
    )
    stop_pattern = re.compile(
        r'^\s*(' + '|'.join(re.escape(k) for k in next_section_keywords) + r')\s*[:\-]?\s*$',
        re.IGNORECASE
    )
    for line in lines:
        if section_pattern.match(line):
            capturing = True
            continue
        if capturing:
            if stop_pattern.match(line):
                break
            section_lines.append(line)
    return '\n'.join(section_lines).strip()


def extract_skills(text: str) -> list:
    all_sections = ['experience','education','projects','certifications','achievements','awards','summary','objective','interests','languages','hobbies','references']
    section_text = extract_section(text, ['skills','technical skills','core competencies','key skills'], all_sections)
    if not section_text:
        return []
    skills = re.split(r'[,|•\n\t]+', section_text)
    skills = [s.strip() for s in skills if 2 < len(s.strip()) < 50]
    return list(dict.fromkeys(skills))


def extract_education(text: str) -> list:
    all_sections = ['skills','experience','projects','certifications','achievements','awards','summary','interests']
    section_text = extract_section(text, ['education','academic background','qualifications'], all_sections)
    entries = []
    if section_text:
        parts = re.split(r'\n{2,}', section_text)
        for part in parts:
            part = part.strip()
            if part and len(part) > 10:
                entries.append(part)
    return entries


def extract_experience(text: str) -> list:
    all_sections = ['skills','education','projects','certifications','achievements','awards','summary','interests']
    section_text = extract_section(text, ['experience','work experience','professional experience','employment','internship'], all_sections)
    entries = []
    if section_text:
        parts = re.split(r'\n{2,}', section_text)
        for part in parts:
            part = part.strip()
            if part and len(part) > 10:
                entries.append(part)
    return entries


def extract_projects(text: str) -> list:
    all_sections = ['skills','education','experience','certifications','achievements','awards','summary','interests']
    section_text = extract_section(text, ['projects','personal projects','academic projects','key projects'], all_sections)
    entries = []
    if section_text:
        parts = re.split(r'\n{2,}', section_text)
        for part in parts:
            part = part.strip()
            if part and len(part) > 10:
                entries.append(part)
    return entries


def extract_certifications(text: str) -> list:
    all_sections = ['skills','education','experience','projects','achievements','awards','summary','interests']
    section_text = extract_section(text, ['certifications','certificates','licenses','credentials'], all_sections)
    items = []
    if section_text:
        lines = [l.strip() for l in section_text.split('\n') if l.strip()]
        items = [re.sub(r'^[•\-\*]\s*', '', l) for l in lines]
    return items


def extract_achievements(text: str) -> list:
    all_sections = ['skills','education','experience','projects','certifications','summary','interests','languages']
    section_text = extract_section(text, ['achievements','awards','honors','accomplishments'], all_sections)
    items = []
    if section_text:
        lines = [l.strip() for l in section_text.split('\n') if l.strip()]
        items = [re.sub(r'^[•\-\*]\s*', '', l) for l in lines]
    return items


def parse_resume(pdf_path: str) -> dict:
    """Main function: parse a PDF resume into a structured dictionary."""
    raw_text = extract_text_from_pdf(pdf_path)
    parsed = {
        "raw_text": raw_text,
        "name": extract_name(raw_text),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "linkedin": extract_linkedin(raw_text),
        "github": extract_github(raw_text),
        "skills": extract_skills(raw_text),
        "education": extract_education(raw_text),
        "experience": extract_experience(raw_text),
        "projects": extract_projects(raw_text),
        "certifications": extract_certifications(raw_text),
        "achievements": extract_achievements(raw_text),
    }
    return parsed
