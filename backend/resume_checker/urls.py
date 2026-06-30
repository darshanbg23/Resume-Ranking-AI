from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views
from resume_checker.views import AnalyzeResumeAPI
from resume_checker import auth_views
from resume_checker import resume_views
from resume_checker import ai_views
from resume_checker import job_views
from resume_checker import admin_views
from resume_checker import application_views
from resume_checker import notification_views


urlpatterns = [
    # Authentication endpoints
    path("api/auth/register/", auth_views.register, name="register"),
    path("api/auth/login/", auth_views.login, name="login"),
    path("api/auth/logout/", auth_views.logout, name="logout"),
    path("api/auth/user/", auth_views.get_user, name="get_user"),
    path("api/auth/refresh/", auth_views.refresh_token, name="refresh_token"),
    path("api/auth/profile/", auth_views.user_profile, name="user_profile"),
    
    # Dashboard endpoints
    path("api/dashboard/stats/", auth_views.dashboard_stats, name="dashboard_stats"),
    
    # Resume endpoints (user-owned)
    path("api/resumes/", resume_views.user_resumes, name="user_resumes"),
    path("api/resumes/<int:resume_id>/", resume_views.user_resume_detail, name="user_resume_detail"),
    path("api/resumes/<int:resume_id>/download/", resume_views.user_resume_download, name="user_resume_download"),
    path("api/resumes/<int:resume_id>/analyze/", resume_views.user_resume_analyze, name="user_resume_analyze"),

    # ── Job Management ──────────────────────────────────────
    path("api/jobs/my/", job_views.my_jobs, name="my_jobs"),
    path("api/jobs/", job_views.job_list, name="job_list"),
    path("api/jobs/<int:job_id>/", job_views.job_detail, name="job_detail"),
    path("api/jobs/<int:job_id>/applicants/", application_views.job_applicants, name="job_applicants"),
    path("api/recruiter/analytics/", job_views.recruiter_analytics, name="recruiter_analytics"),

    # ── Application Management ──────────────────────────────
    path("api/applications/", application_views.applications, name="applications"),
    path("api/applications/<int:application_id>/", application_views.application_detail, name="application_detail"),
    path("api/applications/<int:application_id>/withdraw/", application_views.withdraw_application, name="withdraw_application"),
    path("api/applications/<int:application_id>/status/", application_views.application_status_update, name="application_status_update"),

    # ── Notification Management ─────────────────────────────
    path("api/notifications/", notification_views.notification_list, name="notification_list"),
    path("api/notifications/<int:notification_id>/read/", notification_views.notification_mark_read, name="notification_mark_read"),
    path("api/notifications/read-all/", notification_views.notification_mark_all_read, name="notification_mark_all_read"),
    path("api/notifications/unread-count/", notification_views.notification_unread_count, name="notification_unread_count"),

    # ── AI API Endpoints ──────────────────────────────────────
    path("api/ai/parse-resume/<int:resume_id>/", ai_views.ai_parse_resume, name="ai_parse_resume"),
    path("api/ai/analyze-resume/<int:resume_id>/", ai_views.ai_analyze_resume, name="ai_analyze_resume"),
    path("api/ai/match-job/<int:resume_id>/<int:job_id>/", ai_views.ai_match_job, name="ai_match_job"),
    path("api/ai/generate-summary/<int:resume_id>/", ai_views.ai_generate_summary, name="ai_generate_summary"),
    path("api/ai/skill-gap/<int:resume_id>/<int:job_id>/", ai_views.ai_skill_gap, name="ai_skill_gap"),
    path("api/ai/interview-questions/<int:resume_id>/", ai_views.ai_interview_questions, name="ai_interview_questions"),
    path("api/ai/recommend-roles/<int:resume_id>/", ai_views.ai_recommend_roles, name="ai_recommend_roles"),
    path("api/ai/recommended-jobs/<int:resume_id>/", ai_views.ai_recommended_jobs, name="ai_recommended_jobs"),
    path("api/ai/rankings/<int:job_id>/", ai_views.ai_rankings, name="ai_rankings"),
    path("api/ai/candidates/", ai_views.ai_candidates, name="ai_candidates"),
    path("api/ai/admin-stats/", ai_views.ai_admin_stats, name="ai_admin_stats"),

    # ── Admin Management ──────────────────────────────────────
    path("api/admin/users/", admin_views.admin_users, name="admin_users"),
    path("api/admin/users/<int:user_id>/", admin_views.admin_user_detail, name="admin_user_detail"),
    path("api/admin/jobs/", admin_views.admin_jobs, name="admin_jobs"),
    path("api/admin/jobs/<int:job_id>/", admin_views.admin_job_delete, name="admin_job_delete"),
    path("api/admin/analytics/", admin_views.admin_analytics, name="admin_analytics"),
    
    # Existing legacy endpoints
    path("api/resume/", AnalyzeResumeAPI.as_view(), name="analyze_resume_api"),
    path("", views.index, name="index"),
    path("check_resume", csrf_exempt(views.check_resume), name="check_resume"),
]
