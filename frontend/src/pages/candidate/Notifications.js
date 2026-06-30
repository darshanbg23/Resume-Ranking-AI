import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import { NotificationsNone, CheckCircle, Work, Send, Analytics, DoneAll, Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
const TYPE_ICONS = {
    application_received: _jsx(Send, { style: { fontSize: 18 }, className: "text-blue-500" }),
    status_changed: _jsx(CheckCircle, { style: { fontSize: 18 }, className: "text-emerald-500" }),
    application_submitted: _jsx(Work, { style: { fontSize: 18 }, className: "text-purple-500" }),
    resume_analyzed: _jsx(Analytics, { style: { fontSize: 18 }, className: "text-amber-500" }),
};
export const CandidateNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await apiClient.get('/notifications/');
                if (res.data.status) {
                    setNotifications(res.data.data);
                }
            }
            catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);
    const handleMarkRead = async (id) => {
        try {
            await apiClient.put(`/notifications/${id}/read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
        catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };
    const handleMarkAllRead = async () => {
        try {
            await apiClient.put('/notifications/read-all/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
        catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };
    const handleClick = (notif) => {
        if (!notif.is_read)
            handleMarkRead(notif.id);
        if (notif.related_job_id) {
            navigate(`/candidate/jobs/${notif.related_job_id}`);
        }
        else if (notif.related_application_id) {
            navigate('/candidate/applications');
        }
    };
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const getTimeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };
    return (_jsxs("div", { className: "space-y-6 animate-fadeIn", children: [_jsx(PageHeader, { title: "Notifications", description: `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`, action: unreadCount > 0 ? (_jsxs("button", { onClick: handleMarkAllRead, className: "btn-secondary text-sm", children: [_jsx(DoneAll, { style: { fontSize: 16 } }), " Mark All Read"] })) : undefined }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => (_jsx("div", { className: "card-base p-4 h-20 skeleton rounded-xl" }, i))) })) : notifications.length > 0 ? (_jsx("div", { className: "space-y-2 stagger-children", children: notifications.map(notif => (_jsx("div", { onClick: () => handleClick(notif), className: `card-base p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${!notif.is_read
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/5'
                        : 'card-hover'}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#111111] flex items-center justify-center flex-shrink-0", children: TYPE_ICONS[notif.notification_type] || _jsx(NotificationsNone, { style: { fontSize: 18 }, className: "text-gray-400" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: `text-sm ${!notif.is_read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`, children: notif.title }), _jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [_jsx("span", { className: "text-[10px] text-gray-400 dark:text-zinc-500", children: getTimeAgo(notif.created_at) }), !notif.is_read && (_jsx(Circle, { style: { fontSize: 8 }, className: "text-blue-500" }))] })] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2", children: notif.message })] })] }) }, notif.id))) })) : (_jsx(EmptyState, { title: "No Notifications", description: "You're all caught up! Notifications will appear here when there are updates on your applications." }))] }));
};
export default CandidateNotifications;
