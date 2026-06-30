
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    """Root health-check endpoint for Render and uptime monitors."""
    return JsonResponse({
        "status": "ok",
        "message": "Resume Ranking AI API is running",
    })


urlpatterns = [
    # Health check — Render pings GET / to verify the service is alive
    path('', health_check, name="root"),
    path('health/', health_check, name="health_check"),

    # Django admin
    path('admin/', admin.site.urls),

    # All app routes (api/auth/*, api/resumes/*, api/jobs/*, etc.)
    path('', include('resume_checker.urls')),
]

# Always serve media files (WhiteNoise handles static files in production)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# In development, also serve static files via Django
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)