"""
AI API Views — REST endpoints for all AI features.

Endpoints:
- POST /api/ai/parse-resume/<id>/         — Parse resume with SpaCy + regex
- POST /api/ai/analyze-resume/<id>/       — Full AI analysis (enhanced)
- POST /api/ai/match-job/<rid>/<jid>/     — Semantic match resume vs job
- POST /api/ai/generate-summary/<id>/     — Generate resume summary
- POST /api/ai/skill-gap/<rid>/<jid>/     — Skill gap analysis
- POST /api/ai/interview-questions/<id>/  — Generate interview questions
- POST /api/ai/recommend-roles/<id>/      — Generate role recommendations
- GET  /api/ai/rankings/<job_id>/         — Get ranked candidates for a job
- GET  /api/ai/candidates/                — Get all candidates with AI data (recruiter)
- GET  /api/ai/admin-stats/               — Get AI analytics (admin)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.models import User

from .models import UserResume, JobDescription
from .ai_models import (
    ResumeJobMatch, SkillGapResult, InterviewQuestions,
    RoleRecommendation, JobApplication
)
from .analyzer import (
    extract_text, analyze_resume, generate_resume_summary,
    generate_skill_gap_analysis, generate_interview_questions,
    generate_role_recommendations
)
from .resume_parser import ResumeParser
from .semantic_engine import SemanticEngine
from .ranking_engine import (
    compute_skills_score, compute_experience_score,
    compute_education_score, compute_projects_score,
    compute_composite_score, get_tier, rank_candidates
)

import os
import logging
import json
from django.db import transaction

logger = logging.getLogger(__name__)


# ============================================================
# PARSE RESUME
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_parse_resume(request, resume_id):
    """Parse resume using SpaCy NER + regex. Stores results in UserResume."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    if not resume.file or not os.path.isfile(resume.file.path):
        return Response({'status': False, 'message': 'Resume file not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Extract text
        resume_text = extract_text(resume.file.path)
        if not resume_text or len(resume_text.strip()) < 30:
            return Response({'status': False, 'message': 'Could not extract text from resume.'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse with SpaCy + regex
        parser = ResumeParser()
        parsed = parser.parse(resume_text)

        # Store results
        resume.name_extracted = parsed.get('name', '')
        resume.email_extracted = parsed.get('email', '')
        resume.phone_extracted = parsed.get('phone', '')
        resume.extracted_text = resume_text

        # Only update skills if we found more than what's already there
        parsed_skills = parsed.get('skills', [])
        if len(parsed_skills) > len(resume.skills_extracted or []):
            resume.skills_extracted = parsed_skills

        if parsed.get('education') and not resume.education_extracted:
            resume.education_extracted = parsed['education'][:300]

        if parsed.get('experience') and not resume.experience_extracted:
            resume.experience_extracted = parsed['experience']

        if parsed.get('certifications'):
            resume.certifications_extracted = parsed['certifications']

        if parsed.get('projects'):
            resume.projects_extracted = parsed['projects']

        resume.save()

        return Response({
            'status': True,
            'message': 'Resume parsed successfully',
            'data': {
                'name': resume.name_extracted,
                'email': resume.email_extracted,
                'phone': resume.phone_extracted,
                'skills': resume.skills_extracted,
                'education': resume.education_extracted,
                'experience': resume.experience_extracted,
                'certifications': resume.certifications_extracted,
                'projects': resume.projects_extracted,
            }
        })
    except Exception as e:
        logger.error(f"Parse error: {e}")
        return Response({'status': False, 'message': f'Parse error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# FULL AI ANALYSIS (Enhanced)
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_analyze_resume(request, resume_id):
    """
    Full AI analysis: SpaCy parsing + Groq LLM analysis + summary generation.
    This is the enhanced version that replaces the old analyze endpoint.
    """
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    if not resume.file or not os.path.isfile(resume.file.path):
        return Response({'status': False, 'message': 'Resume file not found'}, status=status.HTTP_404_NOT_FOUND)

    resume.status = 'processing'
    resume.save()

    try:
        # Step 1: Extract text (PDF or DOCX)
        resume_text = extract_text(resume.file.path)
        if not resume_text or len(resume_text.strip()) < 30:
            resume.status = 'failed'
            resume.save()
            return Response({'status': False, 'message': 'Could not extract text from resume.'}, status=status.HTTP_400_BAD_REQUEST)

        resume.extracted_text = resume_text

        # Step 2: SpaCy NER parsing
        parser = ResumeParser()
        parsed = parser.parse(resume_text)
        resume.name_extracted = parsed.get('name', '')
        resume.email_extracted = parsed.get('email', '')
        resume.phone_extracted = parsed.get('phone', '')

        # Step 3: Get job description (from request body or use generic)
        job_description = request.data.get('job_description', '')
        if not job_description:
            job_description = (
                "We are looking for a skilled professional with strong technical skills, "
                "relevant experience, good education background, and ability to work in a team. "
                "The ideal candidate should have programming skills, problem-solving abilities, "
                "and industry experience."
            )

        # Step 4: Groq LLM analysis
        analysis = analyze_resume(resume_text, job_description)

        if analysis:
            resume.analysis_result = analysis

            # Extract skills (merge SpaCy + LLM results)
            llm_skills = analysis.get('skills', [])
            ner_skills = parsed.get('skills', [])
            all_skills = list(set(llm_skills + ner_skills))
            resume.skills_extracted = all_skills

            # Experience
            if analysis.get('experience'):
                resume.experience_extracted = str(analysis['experience'])
            elif parsed.get('experience'):
                resume.experience_extracted = parsed['experience']

            # Education
            if analysis.get('education'):
                resume.education_extracted = str(analysis['education'])[:300]
            elif parsed.get('education'):
                resume.education_extracted = parsed['education'][:300]

            # Certifications
            if analysis.get('certifications'):
                resume.certifications_extracted = analysis['certifications']
            elif parsed.get('certifications'):
                resume.certifications_extracted = parsed['certifications']

            # Projects
            if analysis.get('projects'):
                resume.projects_extracted = analysis['projects']
            elif parsed.get('projects'):
                resume.projects_extracted = parsed['projects']

            # Match score
            rank_str = str(analysis.get('rank', '0')).replace('%', '').strip()
            try:
                score = float(rank_str)
                if 0 <= score <= 1:
                    score = score * 100
                resume.match_score = score
            except (ValueError, TypeError):
                resume.match_score = None

        # Step 5: Generate summary
        resume.resume_summary = generate_resume_summary(
            resume_text,
            skills=resume.skills_extracted,
            experience=resume.experience_extracted
        )

        resume.status = 'processed'
        resume.analyzed_at = timezone.now()
        resume.save()

        return Response({
            'status': True,
            'message': 'Resume analyzed successfully',
            'data': _serialize_resume(resume)
        })

    except Exception as e:
        resume.status = 'failed'
        resume.save()
        logger.error(f"Analysis error: {e}")
        return Response({'status': False, 'message': f'Analysis error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# SEMANTIC JOB MATCHING
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_match_job(request, resume_id, job_id):
    """Compute semantic match between a resume and a job description."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({'status': False, 'message': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get resume text
    resume_text = resume.extracted_text
    if not resume_text:
        if resume.file and os.path.isfile(resume.file.path):
            resume_text = extract_text(resume.file.path)
            resume.extracted_text = resume_text
            resume.save()
        else:
            return Response({'status': False, 'message': 'Resume text not available'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Semantic matching
        engine = SemanticEngine()
        semantic_score = 0
        if engine.is_available:
            semantic_score = engine.compute_similarity(resume_text, job.job_description)

        # Keyword matching
        job_skills = _extract_job_skills(job.job_description)
        keyword_result = engine.compute_keyword_score(
            resume.skills_extracted or [],
            job_skills
        )

        # Composite score
        skills_score = compute_skills_score(resume.skills_extracted or [], job_skills)
        experience_score = compute_experience_score(resume.experience_extracted)
        education_score = compute_education_score(resume.education_extracted)
        projects_score = compute_projects_score(resume.projects_extracted or [])

        overall_score = compute_composite_score(
            skills_score=skills_score,
            experience_score=experience_score,
            semantic_score=semantic_score,
            education_score=education_score,
            projects_score=projects_score,
        )

        tier_key, tier_label = get_tier(overall_score)

        # Save to database
        match, _ = ResumeJobMatch.objects.update_or_create(
            resume=resume,
            job=job,
            defaults={
                'semantic_score': round(semantic_score, 1),
                'keyword_score': round(keyword_result['score'], 1),
                'overall_score': overall_score,
                'skills_matched': keyword_result['matched'],
                'skills_missing': keyword_result['missing'],
            }
        )

        return Response({
            'status': True,
            'message': 'Match computed successfully',
            'data': {
                'resume_id': resume.id,
                'job_id': job.id,
                'job_title': job.job_title,
                'semantic_score': round(semantic_score, 1),
                'keyword_score': round(keyword_result['score'], 1),
                'skills_score': round(skills_score, 1),
                'experience_score': round(experience_score, 1),
                'education_score': round(education_score, 1),
                'projects_score': round(projects_score, 1),
                'overall_score': overall_score,
                'tier': tier_key,
                'tier_label': tier_label,
                'skills_matched': keyword_result['matched'],
                'skills_missing': keyword_result['missing'],
            }
        })
    except Exception as e:
        logger.error(f"Match error: {e}")
        return Response({'status': False, 'message': f'Match error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# GENERATE SUMMARY
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_summary(request, resume_id):
    """Generate AI summary for a resume."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    resume_text = resume.extracted_text
    if not resume_text:
        if resume.file and os.path.isfile(resume.file.path):
            resume_text = extract_text(resume.file.path)
        else:
            return Response({'status': False, 'message': 'Resume text not available'}, status=status.HTTP_400_BAD_REQUEST)

    summary = generate_resume_summary(
        resume_text,
        skills=resume.skills_extracted,
        experience=resume.experience_extracted
    )

    resume.resume_summary = summary
    resume.save()

    return Response({
        'status': True,
        'message': 'Summary generated',
        'data': {'summary': summary}
    })


# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_skill_gap(request, resume_id, job_id):
    """Generate skill gap analysis between resume and job."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({'status': False, 'message': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    job_skills = _extract_job_skills(job.job_description)

    result = generate_skill_gap_analysis(
        resume_skills=resume.skills_extracted or [],
        job_skills=job_skills,
        job_title=job.job_title,
        job_description=job.job_description
    )

    # Save to database
    SkillGapResult.objects.update_or_create(
        resume=resume,
        job=job,
        defaults={
            'present_skills': result['present_skills'],
            'missing_skills': result['missing_skills'],
            'match_percentage': result['match_percentage'],
            'recommendations': result['recommendations'],
        }
    )

    return Response({
        'status': True,
        'message': 'Skill gap analysis completed',
        'data': {
            'job_title': job.job_title,
            **result
        }
    })


# ============================================================
# INTERVIEW QUESTIONS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_interview_questions(request, resume_id):
    """Generate interview questions for a resume."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    job_id = request.data.get('job_id')
    job_title = request.data.get('job_title', '')
    job = None

    if job_id:
        try:
            job = JobDescription.objects.get(id=job_id)
            job_title = job.job_title
        except JobDescription.DoesNotExist:
            pass

    result = generate_interview_questions(
        skills=resume.skills_extracted or [],
        experience=resume.experience_extracted,
        projects=resume.projects_extracted,
        job_title=job_title
    )

    # Save to database
    iq = InterviewQuestions.objects.create(
        resume=resume,
        job=job,
        technical_questions=result.get('technical_questions', []),
        behavioral_questions=result.get('behavioral_questions', []),
        role_specific_questions=result.get('role_specific_questions', []),
    )

    return Response({
        'status': True,
        'message': 'Interview questions generated',
        'data': {
            'id': iq.id,
            **result
        }
    })


# ============================================================
# ROLE RECOMMENDATIONS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_recommend_roles(request, resume_id):
    """Generate role recommendations for a resume."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    roles = generate_role_recommendations(
        skills=resume.skills_extracted or [],
        experience=resume.experience_extracted,
        education=resume.education_extracted,
        projects=resume.projects_extracted,
    )

    # Save to database
    RoleRecommendation.objects.create(
        resume=resume,
        recommended_roles=roles,
    )

    return Response({
        'status': True,
        'message': 'Role recommendations generated',
        'data': {'roles': roles}
    })


# ============================================================
# CANDIDATE RANKINGS (Recruiter view)
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_rankings(request, job_id):
    """Get ranked candidates for a specific job."""
    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({'status': False, 'message': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    # Recruiter ownership check — recruiters can only rank their own jobs
    user_groups = [g.name for g in request.user.groups.all()]
    if 'recruiter' in user_groups and job.created_by != request.user:
        return Response({'status': False, 'message': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    # Restrict to only resumes that have applied for this job
    applied_resume_ids = JobApplication.objects.filter(job=job).values_list('resume_id', flat=True)
    
    # Get matches only for applied resumes
    matches = ResumeJobMatch.objects.filter(job=job, resume_id__in=applied_resume_ids).select_related('resume', 'resume__user')

    # Find which applied resumes don't have a match score yet
    matched_resume_ids = set(matches.values_list('resume_id', flat=True))
    missing_resume_ids = set(applied_resume_ids) - matched_resume_ids

    if missing_resume_ids:
        # Compute matches for applied resumes missing scores
        resumes_to_process = UserResume.objects.filter(
            id__in=missing_resume_ids, 
            status='processed'
        ).exclude(extracted_text='')
        
        engine = SemanticEngine()

        for resume in resumes_to_process:
            resume_text = resume.extracted_text
            if not resume_text:
                continue

            try:
                semantic_score = 0
                if engine.is_available:
                    semantic_score = engine.compute_similarity(resume_text, job.job_description)

                job_skills = _extract_job_skills(job.job_description)
                keyword_result = engine.compute_keyword_score(resume.skills_extracted or [], job_skills)

                skills_score = compute_skills_score(resume.skills_extracted or [], job_skills)
                experience_score = compute_experience_score(resume.experience_extracted)
                education_score = compute_education_score(resume.education_extracted)
                projects_score = compute_projects_score(resume.projects_extracted or [])

                overall_score = compute_composite_score(
                    skills_score=skills_score,
                    experience_score=experience_score,
                    semantic_score=semantic_score,
                    education_score=education_score,
                    projects_score=projects_score,
                )

                with transaction.atomic():
                    ResumeJobMatch.objects.update_or_create(
                        resume=resume,
                        job=job,
                        defaults={
                            'semantic_score': round(semantic_score, 1),
                            'keyword_score': round(keyword_result['score'], 1),
                            'overall_score': overall_score,
                            'skills_matched': keyword_result['matched'],
                            'skills_missing': keyword_result['missing'],
                        }
                    )
            except Exception as e:
                logger.error(f"Error computing match for resume {resume.id}: {e}")
                continue

        # Re-fetch matches after computation
        matches = ResumeJobMatch.objects.filter(job=job, resume_id__in=applied_resume_ids).select_related('resume', 'resume__user')

    # Build response
    candidates = []
    for match in matches:
        r = match.resume
        u = r.user
        candidates.append({
            'resume_id': r.id,
            'user_id': u.id,
            'candidate_name': r.name_extracted or f"{u.first_name} {u.last_name}".strip() or u.username,
            'email': r.email_extracted or u.email,
            'file_name': r.file_name,
            'skills': r.skills_extracted or [],
            'experience': r.experience_extracted,
            'education': r.education_extracted,
            'summary': r.resume_summary,
            'semantic_score': match.semantic_score,
            'keyword_score': match.keyword_score,
            'overall_score': match.overall_score,
            'tier': match.tier,
            'tier_label': match.get_tier_display(),
            'skills_matched': match.skills_matched,
            'skills_missing': match.skills_missing,
            'analyzed_at': r.analyzed_at.isoformat() if r.analyzed_at else None,
        })

    # Sort and add rank
    candidates.sort(key=lambda c: c['overall_score'], reverse=True)
    for i, c in enumerate(candidates, 1):
        c['rank'] = i

    return Response({
        'status': True,
        'message': f'{len(candidates)} candidate(s) ranked',
        'data': {
            'job_id': job.id,
            'job_title': job.job_title,
            'candidates': candidates,
        }
    })


# ============================================================
# ALL CANDIDATES (Recruiter view)
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_candidates(request):
    """Get all candidates with their AI analysis data (restricted by role)."""
    user_groups = [g.name for g in request.user.groups.all()]
    
    if 'admin' in user_groups:
        candidates_group = User.objects.filter(groups__name='candidate')
    elif 'recruiter' in user_groups:
        # Only candidates who applied to jobs posted by this recruiter
        candidates_group = User.objects.filter(
            groups__name='candidate',
            applications__job__created_by=request.user
        ).distinct()
    else:
        # Candidates can only see themselves (if needed)
        candidates_group = User.objects.filter(id=request.user.id)

    data = []
    for user in candidates_group:
        resumes = UserResume.objects.filter(user=user)
        latest_resume = resumes.first()  # ordered by -uploaded_at

        user_data = {
            'user_id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'resume_count': resumes.count(),
            'latest_resume': None,
        }

        if latest_resume:
            user_data['latest_resume'] = {
                'id': latest_resume.id,
                'file_name': latest_resume.file_name,
                'status': latest_resume.status,
                'match_score': latest_resume.match_score,
                'skills': latest_resume.skills_extracted or [],
                'experience': latest_resume.experience_extracted,
                'education': latest_resume.education_extracted,
                'summary': latest_resume.resume_summary,
                'analyzed_at': latest_resume.analyzed_at.isoformat() if latest_resume.analyzed_at else None,
            }

        data.append(user_data)

    return Response({
        'status': True,
        'message': f'{len(data)} candidate(s) found',
        'data': data
    })


# ============================================================
# ADMIN AI STATS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_admin_stats(request):
    """Get AI analytics for admin dashboard."""
    total_resumes = UserResume.objects.count()
    analyzed_resumes = UserResume.objects.filter(status='processed').count()
    failed_analyses = UserResume.objects.filter(status='failed').count()

    # Average match score
    from django.db.models import Avg
    avg_score = UserResume.objects.filter(
        status='processed', match_score__isnull=False
    ).aggregate(avg=Avg('match_score'))['avg'] or 0

    # Top skills (aggregate from all resumes)
    all_skills = {}
    for resume in UserResume.objects.filter(status='processed'):
        for skill in (resume.skills_extracted or []):
            skill_lower = skill.lower()
            all_skills[skill_lower] = all_skills.get(skill_lower, 0) + 1

    top_skills = sorted(all_skills.items(), key=lambda x: x[1], reverse=True)[:15]

    # Match tier distribution
    tier_dist = {
        'excellent': ResumeJobMatch.objects.filter(tier='excellent').count(),
        'good': ResumeJobMatch.objects.filter(tier='good').count(),
        'average': ResumeJobMatch.objects.filter(tier='average').count(),
        'poor': ResumeJobMatch.objects.filter(tier='poor').count(),
    }

    return Response({
        'status': True,
        'data': {
            'total_resumes': total_resumes,
            'analyzed_resumes': analyzed_resumes,
            'failed_analyses': failed_analyses,
            'success_rate': round((analyzed_resumes / total_resumes * 100) if total_resumes > 0 else 0, 1),
            'average_match_score': round(avg_score, 1),
            'top_skills': [{'skill': s, 'count': c} for s, c in top_skills],
            'tier_distribution': tier_dist,
            'total_matches': sum(tier_dist.values()),
        }
    })


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _extract_job_skills(job_description: str) -> list:
    """Extract skills from a job description using the parser."""
    parser = ResumeParser()
    return parser.extract_skills(job_description)


def _serialize_resume(resume: UserResume) -> dict:
    """Serialize a UserResume to a response dict."""
    return {
        'id': resume.id,
        'file_name': resume.file_name,
        'file_size': resume.file_size,
        'file_size_display': resume.file_size_display,
        'file_type': resume.file_type,
        'status': resume.status,
        'match_score': resume.match_score,
        'skills_extracted': resume.skills_extracted,
        'experience_extracted': resume.experience_extracted,
        'education_extracted': resume.education_extracted,
        'name_extracted': resume.name_extracted,
        'email_extracted': resume.email_extracted,
        'phone_extracted': resume.phone_extracted,
        'certifications_extracted': resume.certifications_extracted,
        'projects_extracted': resume.projects_extracted,
        'resume_summary': resume.resume_summary,
        'analysis_result': resume.analysis_result,
        'uploaded_at': resume.uploaded_at.isoformat(),
        'analyzed_at': resume.analyzed_at.isoformat() if resume.analyzed_at else None,
    }


# ============================================================
# CANDIDATE JOB RECOMMENDATIONS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_recommended_jobs(request, resume_id):
    """
    Match a candidate's resume against ALL active jobs.
    Returns recommended jobs sorted by match score with reasons and missing skills.
    """
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({'status': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)

    if resume.status != 'processed':
        return Response({'status': False, 'message': 'Resume must be analyzed first'}, status=status.HTTP_400_BAD_REQUEST)

    resume_text = resume.extracted_text
    if not resume_text:
        return Response({'status': False, 'message': 'Resume text not available'}, status=status.HTTP_400_BAD_REQUEST)

    jobs = JobDescription.objects.filter(is_active=True)
    if not jobs.exists():
        return Response({'status': True, 'data': {'recommendations': []}})

    engine = SemanticEngine()
    recommendations = []

    for job in jobs:
        try:
            # Semantic score
            semantic_score = 0
            if engine.is_available:
                semantic_score = engine.compute_similarity(resume_text, job.job_description)

            # Keyword matching
            job_skills = job.required_skills or _extract_job_skills(job.job_description)
            keyword_result = engine.compute_keyword_score(
                resume.skills_extracted or [],
                job_skills
            )

            # Composite score
            skills_score = compute_skills_score(resume.skills_extracted or [], job_skills)
            experience_score = compute_experience_score(resume.experience_extracted)
            education_score = compute_education_score(resume.education_extracted)
            projects_score = compute_projects_score(resume.projects_extracted or [])

            overall_score = compute_composite_score(
                skills_score=skills_score,
                experience_score=experience_score,
                semantic_score=semantic_score,
                education_score=education_score,
                projects_score=projects_score,
            )

            tier_key, tier_label = get_tier(overall_score)

            # Generate match reason
            reasons = []
            if skills_score >= 60:
                reasons.append(f"Strong skills match ({len(keyword_result['matched'])} skills)")
            if semantic_score >= 60:
                reasons.append("High resume-job relevance")
            if experience_score >= 60:
                reasons.append("Matching experience level")
            if not reasons:
                reasons.append("Potential career opportunity")

            recommendations.append({
                'job_id': job.id,
                'job_title': job.job_title,
                'job_description': job.job_description[:300],
                'company_name': job.company_name,
                'location': job.location,
                'job_type': job.job_type,
                'salary_min': str(job.salary_min) if job.salary_min else None,
                'salary_max': str(job.salary_max) if job.salary_max else None,
                'required_skills': job.required_skills or [],
                'overall_score': overall_score,
                'semantic_score': round(semantic_score, 1),
                'keyword_score': round(keyword_result['score'], 1),
                'tier': tier_key,
                'tier_label': tier_label,
                'skills_matched': keyword_result['matched'],
                'skills_missing': keyword_result['missing'],
                'match_reason': '. '.join(reasons),
                'has_applied': JobApplication.objects.filter(user=request.user, job=job).exists(),
            })

            # Save match to DB
            with transaction.atomic():
                ResumeJobMatch.objects.update_or_create(
                    resume=resume, job=job,
                    defaults={
                        'semantic_score': round(semantic_score, 1),
                        'keyword_score': round(keyword_result['score'], 1),
                        'overall_score': overall_score,
                        'skills_matched': keyword_result['matched'],
                        'skills_missing': keyword_result['missing'],
                    }
                )
        except Exception as e:
            logger.error(f"Error matching job {job.id}: {e}")
            continue

    # Sort by overall score descending
    recommendations.sort(key=lambda r: r['overall_score'], reverse=True)

    return Response({
        'status': True,
        'message': f'{len(recommendations)} job(s) matched',
        'data': {
            'resume_id': resume.id,
            'recommendations': recommendations,
        }
    })
