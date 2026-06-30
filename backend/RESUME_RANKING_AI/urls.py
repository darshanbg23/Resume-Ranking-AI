
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('resume_checker.urls')),
]

# Always serve media files (WhiteNoise handles static files in production)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# In development, also serve static files via Django
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)