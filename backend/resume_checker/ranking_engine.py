"""
Candidate Ranking Engine — Multi-factor scoring and tier assignment.

Combines multiple signals to produce a composite ranking score:
- Skills match (30% weight)
- Experience match (25% weight)  
- Education match (15% weight)
- Semantic similarity (20% weight)
- Projects relevance (10% weight)

Assigns tier labels per Blueprint §7:
- Excellent Match: >= 90
- Good Match: >= 75
- Average Match: >= 50
- Poor Match: < 50
"""
import re
import logging

logger = logging.getLogger(__name__)


# Weight configuration
WEIGHTS = {
    'skills': 0.30,
    'experience': 0.25,
    'semantic': 0.20,
    'education': 0.15,
    'projects': 0.10,
}

# Tier thresholds
TIERS = [
    (90, 'excellent', 'Excellent Match'),
    (75, 'good', 'Good Match'),
    (50, 'average', 'Average Match'),
    (0, 'poor', 'Poor Match'),
]

# Education level hierarchy for matching
EDUCATION_LEVELS = {
    'phd': 6, 'ph.d': 6, 'doctorate': 6,
    'master': 5, 'm.tech': 5, 'm.sc': 5, 'mba': 5, 'mca': 5, 'm.e': 5, 'm.a': 5, 'm.com': 5,
    'bachelor': 4, 'b.tech': 4, 'b.sc': 4, 'bca': 4, 'b.e': 4, 'b.a': 4, 'b.com': 4,
    'associate': 3, 'diploma': 3,
    'high school': 2, 'secondary': 2, '12th': 2, 'hsc': 2,
    '10th': 1, 'ssc': 1, 'matriculation': 1,
}


def get_tier(score: float) -> tuple:
    """
    Get tier label for a score.
    
    Returns:
        (tier_key, tier_label) tuple
    """
    for threshold, key, label in TIERS:
        if score >= threshold:
            return key, label
    return 'poor', 'Poor Match'


def compute_skills_score(resume_skills: list, job_skills: list) -> float:
    """
    Compute skill match score (0-100).
    
    Measures what percentage of required job skills are present in the resume.
    """
    if not job_skills:
        return 50.0  # No requirements = neutral score

    resume_lower = {s.lower().strip() for s in resume_skills}
    job_lower = {s.lower().strip() for s in job_skills}

    if not job_lower:
        return 50.0

    matched = resume_lower & job_lower
    return (len(matched) / len(job_lower)) * 100


def compute_experience_score(resume_exp: str, required_exp: str = '') -> float:
    """
    Compute experience match score (0-100).
    
    Compares resume experience years against job requirements.
    """
    # Parse resume experience
    resume_years = 0
    if resume_exp:
        nums = re.findall(r'(\d+)', str(resume_exp))
        if nums:
            resume_years = int(nums[0])

    # Parse required experience
    required_years = 0
    if required_exp:
        nums = re.findall(r'(\d+)', str(required_exp))
        if nums:
            required_years = int(nums[0])

    if required_years == 0:
        # No specific requirement — give score based on having experience
        if resume_years >= 5:
            return 90.0
        elif resume_years >= 3:
            return 75.0
        elif resume_years >= 1:
            return 60.0
        else:
            return 40.0

    # Compare against requirement
    if resume_years >= required_years:
        return min(100.0, 80.0 + (resume_years - required_years) * 5)
    else:
        ratio = resume_years / required_years
        return max(20.0, ratio * 80)


def compute_education_score(resume_education: str, required_education: str = '') -> float:
    """
    Compute education match score (0-100).
    """
    resume_level = _get_education_level(resume_education)
    required_level = _get_education_level(required_education)

    if required_level == 0:
        # No specific requirement
        if resume_level >= 4:
            return 85.0
        elif resume_level >= 3:
            return 70.0
        else:
            return 50.0

    if resume_level >= required_level:
        return min(100.0, 85.0 + (resume_level - required_level) * 5)
    else:
        if required_level > 0:
            ratio = resume_level / required_level
            return max(20.0, ratio * 80)
        return 50.0


def compute_projects_score(projects: list, job_description: str = '') -> float:
    """
    Compute projects relevance score (0-100).
    """
    if not projects:
        return 30.0

    num_projects = len(projects)
    base_score = min(70.0, num_projects * 15)

    # Bonus for project descriptions
    has_descriptions = sum(1 for p in projects if isinstance(p, dict) and p.get('description'))
    desc_bonus = min(20.0, has_descriptions * 5)

    return min(100.0, base_score + desc_bonus)


def compute_composite_score(
    skills_score: float = 0,
    experience_score: float = 0,
    semantic_score: float = 0,
    education_score: float = 0,
    projects_score: float = 0,
) -> float:
    """
    Compute weighted composite score.
    
    Returns:
        Score 0-100
    """
    composite = (
        skills_score * WEIGHTS['skills'] +
        experience_score * WEIGHTS['experience'] +
        semantic_score * WEIGHTS['semantic'] +
        education_score * WEIGHTS['education'] +
        projects_score * WEIGHTS['projects']
    )
    return round(min(100.0, max(0.0, composite)), 1)


def rank_candidates(candidates: list) -> list:
    """
    Rank and tier a list of candidate score dicts.
    
    Args:
        candidates: List of dicts with 'id' and 'overall_score'
        
    Returns:
        Sorted list with tier assignments, rank position
    """
    # Sort by overall_score descending
    sorted_candidates = sorted(candidates, key=lambda c: c.get('overall_score', 0), reverse=True)

    for rank, candidate in enumerate(sorted_candidates, 1):
        score = candidate.get('overall_score', 0)
        tier_key, tier_label = get_tier(score)
        candidate['rank'] = rank
        candidate['tier'] = tier_key
        candidate['tier_label'] = tier_label

    return sorted_candidates


def _get_education_level(text: str) -> int:
    """Get numeric education level from text."""
    if not text:
        return 0
    text_lower = text.lower()
    best = 0
    for keyword, level in EDUCATION_LEVELS.items():
        if keyword in text_lower:
            best = max(best, level)
    return best
