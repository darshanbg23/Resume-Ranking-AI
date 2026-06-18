"""
Application API views — Job application workflow.

Endpoints:
- GET/POST  /api/applications/              — List/create applications (candidate)
- GET       /api/applications/<id>/          — Application detail
- GET       /api/jobs/<job_id>/applicants/   — List applicants for a job (recruiter)
- PUT       /api/applications/<id>/status/   — Update application status (recruiter)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserResume, JobDescription
from .ai_models import JobApplication, Notification, ResumeJobMatch
from .auth_serializers import UserSerializer


def _serialize_application(app, include_resume_details=False):
    """Serialize a JobApplication to a response dict."""
    data = {
        'id': app.id,
        'job_id': app.job_id,
        'job_title': app.job.job_title,
        'company_name': app.job.company_name or '',
        'location': app.job.location or '',
        'job_type': app.job.job_type or '',
        'status': app.status,
        'status_display': app.get_status_display(),
        'applied_at': app.applied_at.isoformat(),
        'updated_at': app.updated_at.isoformat(),
    }

    if include_resume_details:
        resume = app.resume
        data['resume'] = {
            'id': resume.id,
            'file_name': resume.file_name,
            'skills_extracted': resume.skills_extracted or [],
            'experience_extracted': resume.experience_extracted,
            'education_extracted': resume.education_extracted,
            'resume_summary': resume.resume_summary,
            'match_score': resume.match_score,
        }
        data['candidate'] = {
            'id': app.user.id,
            'name': f"{app.user.first_name} {app.user.last_name}".strip() or app.user.username,
            'email': app.user.email,
        }

        # Include job match data if available
        try:
            match = ResumeJobMatch.objects.get(resume=resume, job=app.job)
            data['match'] = {
                'overall_score': match.overall_score,
                'semantic_score': match.semantic_score,
                'keyword_score': match.keyword_score,
                'tier': match.tier,
                'tier_label': match.get_tier_display(),
                'skills_matched': match.skills_matched,
                'skills_missing': match.skills_missing,
            }
        except ResumeJobMatch.DoesNotExist:
            data['match'] = None

    return data


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def applications(request):
    """
    GET: List all applications for the authenticated candidate.
    POST: Apply to a job.
    """
    if request.method == 'GET':
        apps = JobApplication.objects.filter(
            user=request.user
        ).select_related('job', 'resume')

        data = [_serialize_application(app) for app in apps]
        return Response({
            'status': True,
            'message': f'{len(data)} application(s) found',
            'data': data
        })

    elif request.method == 'POST':
        job_id = request.data.get('job_id')
        resume_id = request.data.get('resume_id')

        if not job_id or not resume_id:
            return Response({
                'status': False,
                'message': 'job_id and resume_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate job exists and is active
        try:
            job = JobDescription.objects.get(id=job_id, is_active=True)
        except JobDescription.DoesNotExist:
            return Response({
                'status': False,
                'message': 'Job not found or no longer active'
            }, status=status.HTTP_404_NOT_FOUND)

        # Validate resume belongs to user and is analyzed
        try:
            resume = UserResume.objects.get(id=resume_id, user=request.user)
        except UserResume.DoesNotExist:
            return Response({
                'status': False,
                'message': 'Resume not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if resume.status != 'processed':
            return Response({
                'status': False,
                'message': 'Please analyze your resume before applying'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if already applied
        if JobApplication.objects.filter(user=request.user, job=job).exists():
            return Response({
                'status': False,
                'message': 'You have already applied to this job'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create application
        application = JobApplication.objects.create(
            user=request.user,
            job=job,
            resume=resume,
            status='applied',
        )

        # Notify the recruiter who posted the job
        if job.created_by:
            candidate_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
            Notification.objects.create(
                user=job.created_by,
                notification_type='application_received',
                title='New Application Received',
                message=f'{candidate_name} has applied for {job.job_title}.',
                related_job=job,
                related_application=application,
            )

        return Response({
            'status': True,
            'message': 'Application submitted successfully',
            'data': _serialize_application(application)
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, application_id):
    """Get application detail."""
    try:
        app = JobApplication.objects.select_related(
            'job', 'resume', 'user'
        ).get(id=application_id)

        # Only allow access to own application or recruiter who owns the job
        if app.user != request.user and app.job.created_by != request.user:
            return Response({
                'status': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)

    except JobApplication.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Application not found'
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'status': True,
        'data': _serialize_application(app, include_resume_details=True)
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def withdraw_application(request, application_id):
    """Withdraw an application (candidate only)."""
    try:
        app = JobApplication.objects.get(id=application_id, user=request.user)
    except JobApplication.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Application not found or access denied'
        }, status=status.HTTP_404_NOT_FOUND)

    if app.status in ['selected', 'rejected']:
        return Response({
            'status': False,
            'message': f'Cannot withdraw application that is already {app.status}'
        }, status=status.HTTP_400_BAD_REQUEST)

    app.status = 'withdrawn'
    app.save()

    # Create a notification for the recruiter
    if app.job.created_by:
        candidate_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        Notification.objects.create(
            user=app.job.created_by,
            notification_type='status_changed',
            title='Application Withdrawn',
            message=f'{candidate_name} has withdrawn their application for {app.job.job_title}.',
            related_job=app.job,
            related_application=app,
        )

    return Response({
        'status': True,
        'message': 'Application withdrawn successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_applicants(request, job_id):
    """List all applicants for a specific job (recruiter only)."""
    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Job not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if the user is the job owner or admin
    user_ser = UserSerializer(request.user)
    role = user_ser.data.get('role', '')
    if job.created_by != request.user and role != 'admin':
        return Response({
            'status': False,
            'message': 'Access denied'
        }, status=status.HTTP_403_FORBIDDEN)

    apps = JobApplication.objects.filter(
        job=job
    ).select_related('user', 'resume').order_by('-applied_at')

    data = [_serialize_application(app, include_resume_details=True) for app in apps]

    return Response({
        'status': True,
        'message': f'{len(data)} applicant(s) found',
        'data': {
            'job_id': job.id,
            'job_title': job.job_title,
            'applicants': data,
        }
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def application_status_update(request, application_id):
    """
    Update application status (recruiter action).
    Triggers a notification to the candidate.
    """
    try:
        app = JobApplication.objects.select_related(
            'job', 'resume', 'user'
        ).get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Application not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check permission: only the job owner or admin can update status
    user_ser = UserSerializer(request.user)
    role = user_ser.data.get('role', '')
    if app.job.created_by != request.user and role != 'admin':
        return Response({
            'status': False,
            'message': 'Access denied'
        }, status=status.HTTP_403_FORBIDDEN)

    new_status = request.data.get('status')
    valid_statuses = [s[0] for s in JobApplication.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({
            'status': False,
            'message': f'Invalid status. Valid: {", ".join(valid_statuses)}'
        }, status=status.HTTP_400_BAD_REQUEST)

    old_status = app.status
    app.status = new_status
    app.save()

    # Create notification for the candidate
    status_labels = dict(JobApplication.STATUS_CHOICES)
    new_label = status_labels.get(new_status, new_status)

    notification_messages = {
        'under_review': f'Your application for {app.job.job_title} is now under review.',
        'shortlisted': f'Congratulations! You have been shortlisted for {app.job.job_title}.',
        'interview_scheduled': f'An interview has been scheduled for {app.job.job_title}.',
        'rejected': f'Your application for {app.job.job_title} was not selected. Keep applying!',
        'selected': f'Congratulations! You have been selected for {app.job.job_title}!',
    }

    message = notification_messages.get(
        new_status,
        f'Your application status for {app.job.job_title} has been updated to {new_label}.'
    )

    Notification.objects.create(
        user=app.user,
        notification_type='status_changed',
        title=f'Application {new_label}',
        message=message,
        related_job=app.job,
        related_application=app,
    )

    return Response({
        'status': True,
        'message': f'Status updated to {new_label}',
        'data': _serialize_application(app, include_resume_details=True)
    })
