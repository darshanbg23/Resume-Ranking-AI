import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import {
  NotificationsNone, CheckCircle, Work, Send, Analytics,
  DoneAll, Circle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

interface NotificationItem {
  id: number;
  notification_type: string;
  type_display: string;
  title: string;
  message: string;
  is_read: boolean;
  related_job_id: number | null;
  related_application_id: number | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  application_received: <Send style={{ fontSize: 18 }} className="text-blue-500" />,
  status_changed: <CheckCircle style={{ fontSize: 18 }} className="text-emerald-500" />,
  application_submitted: <Work style={{ fontSize: 18 }} className="text-purple-500" />,
  resume_analyzed: <Analytics style={{ fontSize: 18 }} className="text-amber-500" />,
};

export const CandidateNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('/notifications/');
        if (res.data.status) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClick = (notif: NotificationItem) => {
    if (!notif.is_read) handleMarkRead(notif.id);
    if (notif.related_job_id) {
      navigate(`/candidate/jobs/${notif.related_job_id}`);
    } else if (notif.related_application_id) {
      navigate('/candidate/applications');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={
          unreadCount > 0 ? (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
              <DoneAll style={{ fontSize: 16 }} /> Mark All Read
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-base p-4 h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2 stagger-children">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`card-base p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${
                !notif.is_read
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/5'
                  : 'card-hover'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#111111] flex items-center justify-center flex-shrink-0">
                  {TYPE_ICONS[notif.notification_type] || <NotificationsNone style={{ fontSize: 18 }} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${!notif.is_read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{getTimeAgo(notif.created_at)}</span>
                      {!notif.is_read && (
                        <Circle style={{ fontSize: 8 }} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{notif.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications"
          description="You're all caught up! Notifications will appear here when there are updates on your applications."
        />
      )}
    </div>
  );
};

export default CandidateNotifications;
