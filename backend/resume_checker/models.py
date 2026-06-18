from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import os


# ============================================================
# USER PROFILE
# ============================================================

class UserProfile(models.Model):
    """Extended user profile for candidates and recruiters."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    experience_years = models.IntegerField(default=0)
    education = models.CharField(max_length=300, blank=True, default='')
    current_role = models.CharField(max_length=200, blank=True, default='')
    company_name = models.CharField(max_length=200, blank=True, default='')
    designation = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create a UserProfile when a User is created."""
    if created:
        UserProfile.objects.get_or_create(user=instance)


# ============================================================
# JOB DESCRIPTION (existing)
# ============================================================

class JobDescription(models.Model):
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]

    job_title = models.CharField(max_length=200)
    job_description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs_posted')
    company_name = models.CharField(max_length=200, blank=True, default='')
    required_skills = models.JSONField(default=list, blank=True)
    experience_required = models.CharField(max_length=50, blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full-time')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.job_title


# ============================================================
# RESUME (legacy — used by old template views)
# ============================================================

class Resume(models.Model):
    job_title = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    resume = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)


# ============================================================
# USER RESUME — user-owned resumes with analysis
# ============================================================

def user_resume_path(instance, filename):
    """Upload resumes to user-specific directories: resumes/user_<id>/<filename>"""
    return f"resumes/user_{instance.user.id}/{filename}"


class UserResume(models.Model):
    """Resume uploaded by a specific user. Supports AI analysis and screening."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to=user_resume_path)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0, help_text="Size in bytes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # AI analysis results (stored as JSON)
    analysis_result = models.JSONField(null=True, blank=True, default=None)
    match_score = models.FloatField(null=True, blank=True, default=None)
    skills_extracted = models.JSONField(default=list, blank=True)
    experience_extracted = models.CharField(max_length=100, blank=True, default='')
    education_extracted = models.CharField(max_length=300, blank=True, default='')

    # NER-parsed contact info
    name_extracted = models.CharField(max_length=200, blank=True, default='')
    email_extracted = models.EmailField(blank=True, default='')
    phone_extracted = models.CharField(max_length=30, blank=True, default='')

    # Enhanced extraction fields
    certifications_extracted = models.JSONField(default=list, blank=True)
    projects_extracted = models.JSONField(default=list, blank=True)

    # AI-generated summary
    resume_summary = models.TextField(blank=True, default='')

    # Extracted full text (cached for semantic matching)
    extracted_text = models.TextField(blank=True, default='')

    uploaded_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} ({self.user.username})"

    @property
    def file_size_display(self):
        """Return human-readable file size."""
        size = self.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.0f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"

    @property
    def file_type(self):
        """Return file extension."""
        _, ext = os.path.splitext(self.file_name)
        return ext.upper().lstrip('.') if ext else 'UNKNOWN'
