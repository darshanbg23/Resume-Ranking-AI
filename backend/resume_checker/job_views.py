"""
Job Management API Views.

Provides CRUD operations for job postings.
Recruiters can create/edit/delete their own jobs.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import JobDescription
from .ai_models import JobApplication
from .auth_serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    """
    GET: List only jobs created by the logged-in recruiter.
    Used by recruiter pages (Job Management, Screening, Rankings).
    """
    jobs = JobDescription.objects.filter(created_by=request.user).order_by('-created_at')
    data = []
    for job in jobs:
        data.append({
            'id': job.id,
            'job_title': job.job_title,
            'job_description': job.job_description,
            'company_name': job.company_name,
            'required_skills': job.required_skills or [],
            'experience_required': job.experience_required,
            'location': job.location,
            'salary_min': str(job.salary_min) if job.salary_min else None,
            'salary_max': str(job.salary_max) if job.salary_max else None,
            'job_type': job.job_type,
            'is_active': job.is_active,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'posted_by': job.created_by.get_full_name() if job.created_by else 'Unknown',
            'posted_by_id': job.created_by_id,
            'applicant_count': JobApplication.objects.filter(job=job).count(),
        })
    return Response({'status': 200, 'data': data})


@api_view(['GET', 'POST'])
def job_list(request):
    """
    GET: List all active jobs (public).
    POST: Create a new job (recruiter only).
    """
    if request.method == 'GET':
        jobs = JobDescription.objects.filter(is_active=True).order_by('-created_at')
        data = []
        for job in jobs:
            item = {
                'id': job.id,
                'job_title': job.job_title,
                'job_description': job.job_description,
                'company_name': job.company_name,
                'required_skills': job.required_skills or [],
                'experience_required': job.experience_required,
                'location': job.location,
                'salary_min': str(job.salary_min) if job.salary_min else None,
                'salary_max': str(job.salary_max) if job.salary_max else None,
                'job_type': job.job_type,
                'is_active': job.is_active,
                'created_at': job.created_at.isoformat() if job.created_at else None,
                'posted_by': job.created_by.get_full_name() if job.created_by else 'Unknown',
                'posted_by_id': job.created_by_id,
                'applicant_count': JobApplication.objects.filter(job=job).count(),
            }
            # Add has_applied flag for authenticated candidates
            if request.user.is_authenticated:
                item['has_applied'] = JobApplication.objects.filter(
                    user=request.user, job=job
                ).exists()
            data.append(item)
        return Response({'status': 200, 'data': data})

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'status': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        d = request.data
        if not d.get('job_title') or not d.get('job_description'):
            return Response({'status': False, 'message': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)

        job = JobDescription.objects.create(
            job_title=d['job_title'],
            job_description=d['job_description'],
            created_by=request.user,
            company_name=d.get('company_name', ''),
            required_skills=d.get('required_skills', []),
            experience_required=d.get('experience_required', ''),
            location=d.get('location', ''),
            salary_min=d.get('salary_min') or None,
            salary_max=d.get('salary_max') or None,
            job_type=d.get('job_type', 'full-time'),
        )

        return Response({
            'status': True,
            'message': 'Job created successfully',
            'data': {
                'id': job.id,
                'job_title': job.job_title,
                'job_description': job.job_description,
                'company_name': job.company_name,
                'required_skills': job.required_skills,
                'experience_required': job.experience_required,
                'location': job.location,
                'salary_min': str(job.salary_min) if job.salary_min else None,
                'salary_max': str(job.salary_max) if job.salary_max else None,
                'job_type': job.job_type,
                'created_at': job.created_at.isoformat(),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def job_detail(request, job_id):
    """
    GET: Get job detail.
    PUT: Update job (owner only).
    DELETE: Delete job (owner or admin).
    """
    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({'status': False, 'message': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = {
            'id': job.id,
            'job_title': job.job_title,
            'job_description': job.job_description,
            'company_name': job.company_name,
            'required_skills': job.required_skills or [],
            'experience_required': job.experience_required,
            'location': job.location,
            'salary_min': str(job.salary_min) if job.salary_min else None,
            'salary_max': str(job.salary_max) if job.salary_max else None,
            'job_type': job.job_type,
            'is_active': job.is_active,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'posted_by': job.created_by.get_full_name() if job.created_by else 'Unknown',
            'applicant_count': JobApplication.objects.filter(job=job).count(),
        }
        # Add has_applied flag for authenticated candidates
        if request.user.is_authenticated:
            data['has_applied'] = JobApplication.objects.filter(
                user=request.user, job=job
            ).exists()
        return Response({'status': True, 'data': data})

    elif request.method == 'PUT':
        # Only owner can edit
        if job.created_by != request.user:
            return Response({'status': False, 'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        d = request.data
        if 'job_title' in d:
            job.job_title = d['job_title']
        if 'job_description' in d:
            job.job_description = d['job_description']
        if 'company_name' in d:
            job.company_name = d['company_name']
        if 'required_skills' in d:
            job.required_skills = d['required_skills']
        if 'experience_required' in d:
            job.experience_required = d['experience_required']
        if 'location' in d:
            job.location = d['location']
        if 'salary_min' in d:
            job.salary_min = d['salary_min'] or None
        if 'salary_max' in d:
            job.salary_max = d['salary_max'] or None
        if 'job_type' in d:
            job.job_type = d['job_type']
        if 'is_active' in d:
            job.is_active = d['is_active']
        job.save()

        return Response({'status': True, 'message': 'Job updated successfully'})

    elif request.method == 'DELETE':
        # Owner or admin can delete
        user_ser = UserSerializer(request.user)
        role = user_ser.data.get('role', '')
        if job.created_by != request.user and role != 'admin':
            return Response({'status': False, 'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        job.delete()
        return Response({'status': True, 'message': 'Job deleted successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_analytics(request):
    """
    GET: Return analytics data scoped to the logged-in recruiter's jobs only.
    Includes job stats, application breakdowns, match scores, and top jobs.
    """
    user = request.user

    # ── Job Stats ────────────────────────────────────────────
    my_jobs = JobDescription.objects.filter(created_by=user)
    total_jobs = my_jobs.count()
    active_jobs = my_jobs.filter(is_active=True).count()
    closed_jobs = my_jobs.filter(is_active=False).count()

    # ── Application Stats ────────────────────────────────────
    my_applications = JobApplication.objects.filter(job__created_by=user)
    total_applications = my_applications.count()
    shortlisted = my_applications.filter(status='shortlisted').count()
    selected = my_applications.filter(status='selected').count()
    rejected = my_applications.filter(status='rejected').count()
    under_review = my_applications.filter(status='under_review').count()
    interview_scheduled = my_applications.filter(status='interview_scheduled').count()
    applied_count = my_applications.filter(status='applied').count()
    withdrawn = my_applications.filter(status='withdrawn').count()

    # ── Average Match Score ──────────────────────────────────
    from .ai_models import ResumeJobMatch
    from django.db.models import Avg, Count

    avg_match = ResumeJobMatch.objects.filter(
        job__created_by=user
    ).aggregate(avg_score=Avg('overall_score'))
    avg_match_score = round(avg_match['avg_score'], 1) if avg_match['avg_score'] else 0

    # ── Applications Per Job ─────────────────────────────────
    applications_per_job = []
    jobs_with_counts = my_jobs.annotate(
        app_count=Count('applications')
    ).order_by('-app_count')

    for job in jobs_with_counts:
        applications_per_job.append({
            'job_id': job.id,
            'job_title': job.job_title,
            'company_name': job.company_name,
            'is_active': job.is_active,
            'application_count': job.app_count,
        })

    # ── Top 5 Jobs by Applications ───────────────────────────
    top_5_jobs = applications_per_job[:5]

    # ── Status Distribution (for pie chart) ──────────────────
    status_distribution = [
        {'name': 'Applied', 'value': applied_count, 'color': '#3b82f6'},
        {'name': 'Under Review', 'value': under_review, 'color': '#f59e0b'},
        {'name': 'Shortlisted', 'value': shortlisted, 'color': '#8b5cf6'},
        {'name': 'Interview', 'value': interview_scheduled, 'color': '#06b6d4'},
        {'name': 'Selected', 'value': selected, 'color': '#10b981'},
        {'name': 'Rejected', 'value': rejected, 'color': '#ef4444'},
        {'name': 'Withdrawn', 'value': withdrawn, 'color': '#6b7280'},
    ]
    # Only include statuses with count > 0
    status_distribution = [s for s in status_distribution if s['value'] > 0]

    return Response({
        'status': True,
        'data': {
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'closed_jobs': closed_jobs,
            'total_applications': total_applications,
            'shortlisted': shortlisted,
            'selected': selected,
            'rejected': rejected,
            'avg_match_score': avg_match_score,
            'applications_per_job': applications_per_job,
            'top_5_jobs': top_5_jobs,
            'status_distribution': status_distribution,
        }
    })
