"""
AI-related models for storing AI analysis results.
These models store job-specific AI outputs like match scores,
skill gaps, interview questions, and role recommendations.
"""
from django.contrib.auth.models import User
from django.db import models


# ============================================================
# JOB APPLICATION — Links candidates to jobs
# ============================================================

class JobApplication(models.Model):
    """Tracks candidate applications to specific jobs."""

    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('rejected', 'Rejected'),
        ('selected', 'Selected'),
        ('withdrawn', 'Withdrawn'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey('JobDescription', on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey('UserResume', on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    notes = models.TextField(blank=True, default='')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.username} → {self.job.job_title}"


# ============================================================
# RESUME-JOB MATCH — Semantic similarity scores
# ============================================================

class ResumeJobMatch(models.Model):
    """Stores semantic match score between a resume and a job description."""

    resume = models.ForeignKey('UserResume', on_delete=models.CASCADE, related_name='job_matches')
    job = models.ForeignKey('JobDescription', on_delete=models.CASCADE, related_name='resume_matches')
    semantic_score = models.FloatField(default=0, help_text="Cosine similarity score 0-100")
    keyword_score = models.FloatField(default=0, help_text="Keyword overlap score 0-100")
    overall_score = models.FloatField(default=0, help_text="Weighted composite score 0-100")

    TIER_CHOICES = [
        ('excellent', 'Excellent Match'),
        ('good', 'Good Match'),
        ('average', 'Average Match'),
        ('poor', 'Poor Match'),
    ]
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='poor')

    skills_matched = models.JSONField(default=list, blank=True)
    skills_missing = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-overall_score']
        unique_together = ['resume', 'job']

    def __str__(self):
        return f"{self.resume.file_name} ↔ {self.job.job_title}: {self.overall_score:.0f}%"

    def save(self, *args, **kwargs):
        # Auto-assign tier based on overall_score
        if self.overall_score >= 90:
            self.tier = 'excellent'
        elif self.overall_score >= 75:
            self.tier = 'good'
        elif self.overall_score >= 50:
            self.tier = 'average'
        else:
            self.tier = 'poor'
        super().save(*args, **kwargs)


# ============================================================
# SKILL GAP RESULT
# ============================================================

class SkillGapResult(models.Model):
    """Stores skill gap analysis between a resume and a job."""

    resume = models.ForeignKey('UserResume', on_delete=models.CASCADE, related_name='skill_gaps')
    job = models.ForeignKey('JobDescription', on_delete=models.CASCADE, related_name='skill_gaps')

    present_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    match_percentage = models.FloatField(default=0)
    recommendations = models.JSONField(default=list, blank=True, help_text="Improvement recommendations")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['resume', 'job']

    def __str__(self):
        return f"SkillGap: {self.resume.file_name} ↔ {self.job.job_title}: {self.match_percentage:.0f}%"


# ============================================================
# INTERVIEW QUESTIONS
# ============================================================

class InterviewQuestions(models.Model):
    """Stores AI-generated interview questions for a resume."""

    resume = models.ForeignKey('UserResume', on_delete=models.CASCADE, related_name='interview_questions')
    job = models.ForeignKey(
        'JobDescription', on_delete=models.CASCADE,
        related_name='interview_questions', null=True, blank=True
    )

    technical_questions = models.JSONField(default=list, blank=True)
    behavioral_questions = models.JSONField(default=list, blank=True)
    role_specific_questions = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Questions for {self.resume.file_name}"


# ============================================================
# ROLE RECOMMENDATION
# ============================================================

class RoleRecommendation(models.Model):
    """Stores AI-generated role recommendations for a candidate."""

    resume = models.ForeignKey('UserResume', on_delete=models.CASCADE, related_name='role_recommendations')

    recommended_roles = models.JSONField(
        default=list, blank=True,
        help_text="List of {role, confidence, reason} dicts"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Recommendations for {self.resume.file_name}"


# ============================================================
# NOTIFICATION — In-app notifications for users
# ============================================================

class Notification(models.Model):
    """In-app notification for candidates and recruiters."""

    NOTIFICATION_TYPES = [
        ('application_received', 'Application Received'),
        ('status_changed', 'Status Changed'),
        ('application_submitted', 'Application Submitted'),
        ('resume_analyzed', 'Resume Analyzed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_job = models.ForeignKey(
        'JobDescription', on_delete=models.CASCADE,
        null=True, blank=True, related_name='notifications'
    )
    related_application = models.ForeignKey(
        'JobApplication', on_delete=models.CASCADE,
        null=True, blank=True, related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
