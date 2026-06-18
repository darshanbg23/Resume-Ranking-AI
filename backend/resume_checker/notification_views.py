"""
Notification API views — In-app notification system.

Endpoints:
- GET  /api/notifications/              — List user's notifications
- PUT  /api/notifications/<id>/read/    — Mark notification as read
- PUT  /api/notifications/read-all/     — Mark all notifications as read
- GET  /api/notifications/unread-count/ — Get unread notification count
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .ai_models import Notification


def _serialize_notification(notif):
    """Serialize a Notification to a response dict."""
    return {
        'id': notif.id,
        'notification_type': notif.notification_type,
        'type_display': notif.get_notification_type_display(),
        'title': notif.title,
        'message': notif.message,
        'is_read': notif.is_read,
        'related_job_id': notif.related_job_id,
        'related_application_id': notif.related_application_id,
        'created_at': notif.created_at.isoformat(),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """List all notifications for the authenticated user."""
    notifications = Notification.objects.filter(
        user=request.user
    ).order_by('-created_at')[:50]  # Limit to 50 most recent

    data = [_serialize_notification(n) for n in notifications]
    unread = Notification.objects.filter(user=request.user, is_read=False).count()

    return Response({
        'status': True,
        'message': f'{len(data)} notification(s)',
        'data': data,
        'unread_count': unread,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, notification_id):
    """Mark a single notification as read."""
    try:
        notif = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)

    notif.is_read = True
    notif.save()

    return Response({
        'status': True,
        'message': 'Notification marked as read'
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """Mark all notifications as read for the authenticated user."""
    count = Notification.objects.filter(
        user=request.user, is_read=False
    ).update(is_read=True)

    return Response({
        'status': True,
        'message': f'{count} notification(s) marked as read'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    """Get unread notification count."""
    count = Notification.objects.filter(
        user=request.user, is_read=False
    ).count()

    return Response({
        'status': True,
        'data': {'unread_count': count}
    })
