"""
Admin Management API Views.

Provides admin-only endpoints for user management, job oversight,
and platform analytics. All endpoints require admin role.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User, Group
from django.db.models import Q, Count
from .models import UserProfile, UserResume, JobDescription
from .auth_serializers import UserSerializer

try:
    from .ai_models import ResumeJobMatch, SkillGapResult, InterviewQuestions, RoleRecommendation
    HAS_AI_MODELS = True
except ImportError:
    HAS_AI_MODELS = False


def _is_admin(user):
    """Check if user belongs to admin group."""
    return user.groups.filter(name='admin').exists() or user.is_superuser


def _get_user_role(user):
    """Get user's role from groups."""
    for g in user.groups.all():
        if g.name in ('admin', 'recruiter', 'candidate'):
            return g.name
    if user.is_superuser:
        return 'admin'
    return 'candidate'


def _serialize_user(user):
    """Serialize a user with profile and stats."""
    role = _get_user_role(user)
    data = {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.get_full_name() or user.email,
        'role': role,
        'is_active': user.is_active,
        'date_joined': user.date_joined.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'resume_count': UserResume.objects.filter(user=user).count(),
        'jobs_posted': JobDescription.objects.filter(created_by=user).count(),
    }

    # Include profile data
    try:
        profile = user.profile
        data.update({
            'phone': profile.phone,
            'location': profile.location,
            'company_name': profile.company_name,
            'designation': profile.designation,
            'skills': profile.skills or [],
            'experience_years': profile.experience_years,
            'education': profile.education,
            'bio': profile.bio,
        })
    except UserProfile.DoesNotExist:
        pass

    return data


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """List all users with search and filter."""
    if not _is_admin(request.user):
        return Response({'status': False, 'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    search = request.GET.get('search', '')
    role_filter = request.GET.get('role', '')
    status_filter = request.GET.get('status', '')

    users = User.objects.all().select_related('profile').prefetch_related('groups').order_by('-date_joined')

    if search:
        users = users.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )

    if role_filter and role_filter != 'all':
        users = users.filter(groups__name=role_filter)

    if status_filter == 'active':
        users = users.filter(is_active=True)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)

    data = [_serialize_user(u) for u in users]

    return Response({
        'status': True,
        'data': data,
        'total': len(data),
    })


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """Get, update, or delete a specific user."""
    if not _is_admin(request.user):
        return Response({'status': False, 'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'status': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({'status': True, 'data': _serialize_user(target_user)})

    elif request.method == 'PUT':
        d = request.data

        if 'is_active' in d:
            target_user.is_active = d['is_active']
        if 'first_name' in d:
            target_user.first_name = d['first_name']
        if 'last_name' in d:
            target_user.last_name = d['last_name']
        target_user.save()

        # Update role if provided
        if 'role' in d and d['role'] in ('admin', 'recruiter', 'candidate'):
            target_user.groups.clear()
            group, _ = Group.objects.get_or_create(name=d['role'])
            target_user.groups.add(group)

        return Response({'status': True, 'message': 'User updated', 'data': _serialize_user(target_user)})

    elif request.method == 'DELETE':
        # Prevent self-deletion
        if target_user.id == request.user.id:
            return Response({'status': False, 'message': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)

        user_name = target_user.get_full_name() or target_user.email

        # Cascade: delete resumes files, AI records, profile, then user
        for resume in UserResume.objects.filter(user=target_user):
            if resume.file:
                try:
                    resume.file.delete(save=False)
                except Exception:
                    pass
            resume.delete()

        # Delete AI records if models exist
        if HAS_AI_MODELS:
            ResumeJobMatch.objects.filter(resume__user=target_user).delete()
            SkillGapResult.objects.filter(resume__user=target_user).delete()
            InterviewQuestions.objects.filter(resume__user=target_user).delete()
            RoleRecommendation.objects.filter(resume__user=target_user).delete()

        # Jobs created by this user — set created_by to null (soft delete)
        JobDescription.objects.filter(created_by=target_user).update(created_by=None)

        target_user.delete()

        return Response({'status': True, 'message': f'User "{user_name}" deleted successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_jobs(request):
    """List all jobs for admin management."""
    if not _is_admin(request.user):
        return Response({'status': False, 'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    jobs = JobDescription.objects.all().select_related('created_by').order_by('-created_at')
    data = []
    for job in jobs:
        data.append({
            'id': job.id,
            'job_title': job.job_title,
            'job_description': job.job_description[:200],
            'company_name': job.company_name,
            'required_skills': job.required_skills or [],
            'experience_required': job.experience_required,
            'location': job.location,
            'job_type': job.job_type,
            'is_active': job.is_active,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'posted_by': job.created_by.get_full_name() if job.created_by else 'Unknown',
            'posted_by_id': job.created_by_id,
        })

    return Response({'status': True, 'data': data})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_job_delete(request, job_id):
    """Delete a job (admin only)."""
    if not _is_admin(request.user):
        return Response({'status': False, 'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        job = JobDescription.objects.get(id=job_id)
    except JobDescription.DoesNotExist:
        return Response({'status': False, 'message': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    # Delete AI match records for this job
    if HAS_AI_MODELS:
        ResumeJobMatch.objects.filter(job=job).delete()

    title = job.job_title
    job.delete()

    return Response({'status': True, 'message': f'Job "{title}" deleted successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    """Platform-wide analytics data."""
    if not _is_admin(request.user):
        return Response({'status': False, 'message': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    total_users = User.objects.count()
    total_candidates = User.objects.filter(groups__name='candidate').count()
    total_recruiters = User.objects.filter(groups__name='recruiter').count()
    total_jobs = JobDescription.objects.count()
    active_jobs = JobDescription.objects.filter(is_active=True).count()
    total_resumes = UserResume.objects.count()
    analyzed_resumes = UserResume.objects.filter(status='processed').count()

    # Recent registrations (last 30 days)
    from django.utils import timezone
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    recent_resumes = UserResume.objects.filter(uploaded_at__gte=thirty_days_ago).count()

    # Top skills across all resumes
    top_skills = {}
    for resume in UserResume.objects.filter(skills_extracted__isnull=False):
        for skill in (resume.skills_extracted or []):
            s = skill.lower().strip()
            if s:
                top_skills[s] = top_skills.get(s, 0) + 1
    sorted_skills = sorted(top_skills.items(), key=lambda x: x[1], reverse=True)[:15]

    # Recent activity log (generated from timestamps)
    recent_activity = []

    recent_reg = User.objects.order_by('-date_joined')[:5]
    for u in recent_reg:
        recent_activity.append({
            'type': 'registration',
            'description': f'{u.get_full_name() or u.email} registered',
            'timestamp': u.date_joined.isoformat(),
        })

    recent_uploads = UserResume.objects.order_by('-uploaded_at')[:5]
    for r in recent_uploads:
        recent_activity.append({
            'type': 'upload',
            'description': f'{r.user.get_full_name() or r.user.email} uploaded {r.file_name}',
            'timestamp': r.uploaded_at.isoformat(),
        })

    recent_analyses = UserResume.objects.filter(analyzed_at__isnull=False).order_by('-analyzed_at')[:5]
    for r in recent_analyses:
        recent_activity.append({
            'type': 'analysis',
            'description': f'{r.file_name} analyzed (score: {r.match_score or "N/A"})',
            'timestamp': r.analyzed_at.isoformat(),
        })

    # Sort activity by timestamp descending
    recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)

    return Response({
        'status': True,
        'data': {
            'total_users': total_users,
            'total_candidates': total_candidates,
            'total_recruiters': total_recruiters,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_resumes': total_resumes,
            'analyzed_resumes': analyzed_resumes,
            'recent_users_30d': recent_users,
            'recent_resumes_30d': recent_resumes,
            'top_skills': [{'skill': s, 'count': c} for s, c in sorted_skills],
            'recent_activity': recent_activity[:15],
        }
    })
