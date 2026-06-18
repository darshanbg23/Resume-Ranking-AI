from django.contrib import admin
from django.contrib.auth.models import Group

from resume_checker.models import JobDescription, Resume, UserProfile, UserResume
from resume_checker.ai_models import (
    JobApplication, ResumeJobMatch, SkillGapResult,
    InterviewQuestions, RoleRecommendation, Notification
)


# ============================================================
# EXISTING MODELS
# ============================================================

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume')
    search_fields = ('id', 'resume')


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'job_title', 'job_description')
    search_fields = ('id', 'job_title', 'job_description')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'location', 'experience_years')
    search_fields = ('user__username', 'user__email')


@admin.register(UserResume)
class UserResumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'file_name', 'status', 'match_score', 'uploaded_at', 'analyzed_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'file_name', 'name_extracted', 'email_extracted')
    readonly_fields = ('uploaded_at', 'analyzed_at')


# ============================================================
# AI MODELS
# ============================================================

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'job__job_title')


@admin.register(ResumeJobMatch)
class ResumeJobMatchAdmin(admin.ModelAdmin):
    list_display = ('resume', 'job', 'overall_score', 'tier', 'semantic_score', 'keyword_score')
    list_filter = ('tier',)
    search_fields = ('resume__file_name', 'job__job_title')


@admin.register(SkillGapResult)
class SkillGapResultAdmin(admin.ModelAdmin):
    list_display = ('resume', 'job', 'match_percentage', 'created_at')
    search_fields = ('resume__file_name', 'job__job_title')


@admin.register(InterviewQuestions)
class InterviewQuestionsAdmin(admin.ModelAdmin):
    list_display = ('resume', 'job', 'created_at')
    search_fields = ('resume__file_name',)


@admin.register(RoleRecommendation)
class RoleRecommendationAdmin(admin.ModelAdmin):
    list_display = ('resume', 'created_at')
    search_fields = ('resume__file_name',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('user__username', 'title', 'message')


admin.site.unregister(Group)