"""
AI Analyzer Module — Groq LLM integration + text extraction.

Handles:
- PDF text extraction (pdfplumber)
- DOCX text extraction (python-docx)
- Groq LLaMA 3.3 analysis (skills, experience, education, projects, certifications)
- AI-generated resume summaries
- Skill gap analysis
- Interview question generation
- Role recommendations
"""
import json
import os
import logging
from pathlib import Path

import pdfplumber
from groq import Groq
import environ

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
env_file = os.path.join(BASE_DIR, ".env")
environ.Env.read_env(env_file)

API_KEY = env("API_KEY", default="")


def _get_groq_client():
    """Get Groq client instance."""
    if not API_KEY or API_KEY == "your_groq_api_key_here":
        return None
    return Groq(api_key=API_KEY)


def extract_text(file_path: str) -> str:
    """
    Extract text from PDF or DOCX file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Extracted text string
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.pdf':
        return _extract_pdf_text(file_path)
    elif ext in ('.docx', '.doc'):
        return _extract_docx_text(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def _extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
    return text.strip()


def _extract_docx_text(file_path: str) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs).strip()
    except ImportError:
        logger.error("python-docx not installed. Run: pip install python-docx")
        return ""
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        return ""


def analyze_resume(text: str, job_description: str) -> dict:
    """
    Analyze resume text against a job description using Groq LLaMA.
    
    Enhanced prompt that extracts all blueprint-required fields:
    - skills, experience, education, certifications, projects, rank
    """
    client = _get_groq_client()
    if not client:
        logger.warning("Groq API key not configured. Using local-only analysis.")
        return _local_fallback_analysis(text)

    prompt = f"""You are an expert AI resume analyzer. Analyze the following resume against the job description and extract structured information.

Resume:
{text[:6000]}

Job Description:
{job_description[:2000]}

Extract and return a JSON object with these fields:
{{
    "rank": "<relevancy score as integer 0-100>",
    "skills": ["skill1", "skill2", ...],
    "experience": "<total years of experience as string>",
    "education": "<highest education degree and institution>",
    "certifications": ["cert1", "cert2", ...],
    "project_categories": ["category1", "category2", ...],
    "projects": [
        {{"title": "project name", "description": "brief description"}},
        ...
    ],
    "strengths": ["strength1", "strength2", ...],
    "areas_to_improve": ["area1", "area2", ...]
}}

Rules:
- rank must be an integer 0-100 based on resume-job fit
- skills should include ALL technical and soft skills found
- experience should be total years as a number string
- education should include degree level and field
- certifications should be actual certifications found (empty list if none)
- projects should list actual projects with descriptions
- Return ONLY valid JSON, no other text
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
            max_tokens=2000,
        )
        result = response.choices[0].message.content
        return json.loads(result)
    except Exception as e:
        logger.error(f"Groq analysis error: {e}")
        return _local_fallback_analysis(text)


def generate_resume_summary(text: str, skills: list = None, experience: str = '') -> str:
    """
    Generate a concise AI summary of a resume.
    
    Returns:
        2-3 sentence summary string
    """
    client = _get_groq_client()
    if not client:
        return _local_fallback_summary(text, skills, experience)

    skills_str = ', '.join(skills[:15]) if skills else 'Not specified'
    prompt = f"""Write a concise 2-3 sentence professional summary for this candidate based on their resume.

Resume text (excerpt):
{text[:4000]}

Key skills: {skills_str}
Experience: {experience or 'Not specified'}

Write in third person. Focus on their strongest qualifications, key technical skills, and experience level. Be specific and factual — do not make up information not in the resume.

Return ONLY the summary text, nothing else."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        return _local_fallback_summary(text, skills, experience)


def generate_skill_gap_analysis(
    resume_skills: list,
    job_skills: list,
    job_title: str = '',
    job_description: str = ''
) -> dict:
    """
    Generate AI-powered skill gap analysis.
    
    Returns:
        dict with present_skills, missing_skills, match_percentage, recommendations
    """
    resume_lower = {s.lower().strip() for s in resume_skills}
    job_lower = {s.lower().strip() for s in job_skills}

    present = sorted([s for s in job_skills if s.lower().strip() in resume_lower])
    missing = sorted([s for s in job_skills if s.lower().strip() not in resume_lower])
    match_pct = (len(present) / len(job_lower) * 100) if job_lower else 0

    # Try AI-generated recommendations
    recommendations = []
    client = _get_groq_client()
    if client and missing:
        prompt = f"""A candidate applying for "{job_title or 'a technical role'}" has these skills: {', '.join(resume_skills[:20])}.

They are MISSING these required skills: {', '.join(missing[:10])}.

Provide exactly 3-5 specific, actionable recommendations for the candidate to acquire the missing skills. Each recommendation should be 1-2 sentences.

Return as a JSON array of strings:
["recommendation 1", "recommendation 2", ...]"""

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                response_format={"type": "json_object"},
                max_tokens=500,
            )
            result = json.loads(response.choices[0].message.content)
            if isinstance(result, list):
                recommendations = result
            elif isinstance(result, dict):
                recommendations = result.get('recommendations', [])
        except Exception as e:
            logger.error(f"Skill gap recommendations error: {e}")

    if not recommendations:
        for skill in missing[:5]:
            recommendations.append(f"Consider learning {skill} through online courses or hands-on projects.")

    return {
        'present_skills': present,
        'missing_skills': missing,
        'match_percentage': round(match_pct, 1),
        'recommendations': recommendations,
    }


def generate_interview_questions(
    skills: list,
    experience: str = '',
    projects: list = None,
    job_title: str = ''
) -> dict:
    """
    Generate interview questions based on candidate profile.
    
    Returns:
        dict with technical_questions, behavioral_questions, role_specific_questions
    """
    client = _get_groq_client()
    if not client:
        return _local_fallback_questions(skills, experience)

    projects_str = ''
    if projects:
        project_titles = [p.get('title', p) if isinstance(p, dict) else str(p) for p in projects[:5]]
        projects_str = f"Projects: {', '.join(project_titles)}"

    prompt = f"""Generate interview questions for a candidate with the following profile:

Role: {job_title or 'Software Developer'}
Skills: {', '.join(skills[:15]) if skills else 'General'}
Experience: {experience or 'Not specified'}
{projects_str}

Generate exactly:
- 5 technical questions (testing their technical knowledge)
- 3 behavioral questions (testing soft skills and work approach)  
- 3 role-specific questions (specific to the role they're applying for)

Return as JSON:
{{
    "technical_questions": ["q1", "q2", "q3", "q4", "q5"],
    "behavioral_questions": ["q1", "q2", "q3"],
    "role_specific_questions": ["q1", "q2", "q3"]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            response_format={"type": "json_object"},
            max_tokens=1000,
        )
        result = json.loads(response.choices[0].message.content)
        return {
            'technical_questions': result.get('technical_questions', [])[:5],
            'behavioral_questions': result.get('behavioral_questions', [])[:3],
            'role_specific_questions': result.get('role_specific_questions', [])[:3],
        }
    except Exception as e:
        logger.error(f"Interview questions error: {e}")
        return _local_fallback_questions(skills, experience)


def generate_role_recommendations(
    skills: list,
    experience: str = '',
    education: str = '',
    projects: list = None
) -> list:
    """
    Generate recommended roles for a candidate.
    
    Returns:
        List of {role, confidence, reason} dicts
    """
    client = _get_groq_client()
    if not client:
        return _local_fallback_recommendations(skills, experience)

    prompt = f"""Based on this candidate's profile, recommend suitable job roles with confidence scores.

Skills: {', '.join(skills[:20]) if skills else 'Not specified'}
Experience: {experience or 'Not specified'}
Education: {education or 'Not specified'}
Projects: {', '.join([p.get('title', str(p)) if isinstance(p, dict) else str(p) for p in (projects or [])[:5]])}

Recommend 3-5 suitable roles. For each role provide:
- The role title
- A confidence score (0-100) based on how well the candidate fits
- A brief reason (1 sentence)

Return as JSON:
{{
    "roles": [
        {{"role": "Backend Developer", "confidence": 85, "reason": "Strong Python and Django skills with relevant experience"}},
        ...
    ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            response_format={"type": "json_object"},
            max_tokens=500,
        )
        result = json.loads(response.choices[0].message.content)
        roles = result.get('roles', [])
        # Sort by confidence descending
        roles.sort(key=lambda r: r.get('confidence', 0), reverse=True)
        return roles[:5]
    except Exception as e:
        logger.error(f"Role recommendations error: {e}")
        return _local_fallback_recommendations(skills, experience)


# ============================================================
# LOCAL FALLBACK FUNCTIONS (when Groq API is unavailable)
# ============================================================

def _local_fallback_analysis(text: str) -> dict:
    """Basic local analysis when Groq is unavailable."""
    from .resume_parser import ResumeParser
    parser = ResumeParser()
    parsed = parser.parse(text)

    return {
        'rank': '50',
        'skills': parsed.get('skills', []),
        'experience': parsed.get('experience', '0'),
        'education': parsed.get('education', ''),
        'certifications': parsed.get('certifications', []),
        'project_categories': [],
        'projects': parsed.get('projects', []),
        'strengths': [],
        'areas_to_improve': [],
        '_note': 'Local fallback analysis (Groq API unavailable)',
    }


def _local_fallback_summary(text: str, skills: list = None, experience: str = '') -> str:
    """Generate a basic summary without AI."""
    skill_count = len(skills) if skills else 0
    skills_str = ', '.join(skills[:5]) if skills else 'various'
    exp_str = f"{experience} years of" if experience and experience != '0' else ''
    return (
        f"Candidate with {exp_str} professional experience and {skill_count} identified skills "
        f"including {skills_str}. Resume analysis performed using local extraction methods."
    )


def _local_fallback_questions(skills: list, experience: str) -> dict:
    """Generate basic questions without AI."""
    technical = []
    if skills:
        for skill in skills[:5]:
            technical.append(f"Can you explain your experience with {skill} and how you've used it in projects?")

    if len(technical) < 3:
        technical.extend([
            "Describe a challenging technical problem you solved recently.",
            "How do you approach debugging complex issues in production?",
            "What development tools and methodologies do you prefer?",
        ])

    return {
        'technical_questions': technical[:5],
        'behavioral_questions': [
            "Tell me about a time you had to work under a tight deadline.",
            "How do you handle disagreements with team members?",
            "Describe a situation where you had to learn a new technology quickly.",
        ],
        'role_specific_questions': [
            "What interests you about this role?",
            "Where do you see yourself in 3 years?",
            "What would you do in your first 90 days in this position?",
        ],
    }


def _local_fallback_recommendations(skills: list, experience: str) -> list:
    """Generate basic role recommendations without AI."""
    recommendations = []
    skills_lower = {s.lower() for s in (skills or [])}

    role_map = {
        'Backend Developer': {'python', 'django', 'flask', 'java', 'spring', 'node.js', 'express', 'sql', 'postgresql', 'mysql'},
        'Frontend Developer': {'react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css', 'tailwind'},
        'Full Stack Developer': {'react', 'node.js', 'python', 'django', 'javascript', 'mongodb', 'postgresql'},
        'Data Scientist': {'python', 'machine learning', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'data science'},
        'Data Engineer': {'python', 'sql', 'spark', 'hadoop', 'kafka', 'airflow', 'aws', 'data engineering'},
        'DevOps Engineer': {'docker', 'kubernetes', 'aws', 'azure', 'terraform', 'jenkins', 'ci/cd', 'linux'},
        'ML Engineer': {'python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp'},
        'Mobile Developer': {'react native', 'flutter', 'android', 'ios', 'swift', 'kotlin'},
        'Cloud Engineer': {'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'},
        'Software Engineer': {'python', 'java', 'javascript', 'c++', 'algorithms', 'data structures'},
    }

    for role, required_skills in role_map.items():
        matched = skills_lower & required_skills
        if matched:
            confidence = min(95, int((len(matched) / len(required_skills)) * 100))
            if confidence >= 20:
                recommendations.append({
                    'role': role,
                    'confidence': confidence,
                    'reason': f"Matches {len(matched)} key skills: {', '.join(sorted(matched)[:3])}",
                })

    recommendations.sort(key=lambda r: r['confidence'], reverse=True)
    return recommendations[:5]


def process_resume(pdf_path, job_description):
    """Process a single resume (legacy compatibility)."""
    try:
        resume_text = extract_text(pdf_path)
        return analyze_resume(resume_text, job_description)
    except Exception as e:
        logger.error(f"Resume processing error: {e}")
        return None


def process_multiple_resumes(resume_paths, job_description):
    """Process multiple resumes (legacy compatibility)."""
    results = []
    for idx, pdf_path in enumerate(resume_paths, 1):
        try:
            resume_text = extract_text(pdf_path)
            analysis = analyze_resume(resume_text, job_description)
            if analysis:
                analysis["resume_number"] = idx
                analysis["file_name"] = os.path.basename(pdf_path)
                results.append(analysis)
        except Exception as e:
            logger.error(f"Error processing {pdf_path}: {e}")
            results.append({
                "resume_number": idx,
                "file_name": os.path.basename(pdf_path),
                "error": str(e),
            })
    return results
