import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import { useAuth } from '@context/AuthContext';
import { Work, People, TrendingUp, EventNote, Add, Notifications as NotifIcon, FindInPage, EmojiEvents, BarChart } from '@mui/icons-material';
import apiClient from '../../services/api';
export const RecruiterDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        jobs_posted: 0,
        applications_received: 0,
        candidates_screened: 0,
        interviews_scheduled: 0,
        total_candidates: 0,
        notification_count: 0,
    });
    const [pipeline, setPipeline] = useState({
        applied: 0, under_review: 0, shortlisted: 0, interview_scheduled: 0, selected: 0,
    });
    const [recentNotifs, setRecentNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, notifsRes] = await Promise.all([
                    apiClient.get('/dashboard/stats/'),
                    apiClient.get('/notifications/').catch(() => ({ data: { data: [] } })),
                ]);
                if (statsRes.data.status && statsRes.data.data) {
                    setStats(statsRes.data.data);
                }
                if (notifsRes.data.data) {
                    setRecentNotifs(notifsRes.data.data.slice(0, 5));
                }
                // Fetch pipeline counts from recruiter's own jobs
                try {
                    const jobsRes = await apiClient.get('/jobs/my/');
                    const myJobs = jobsRes.data.data || [];
                    let counts = { applied: 0, under_review: 0, shortlisted: 0, interview_scheduled: 0, selected: 0 };
                    for (const job of myJobs) {
                        try {
                            const appRes = await apiClient.get(`/jobs/${job.id}/applicants/`);
                            if (appRes.data.data?.applicants) {
                                for (const app of appRes.data.data.applicants) {
                                    if (app.status in counts) {
                                        counts[app.status]++;
                                    }
                                }
                            }
                        }
                        catch { /* skip */ }
                    }
                    setPipeline(counts);
                }
                catch { /* skip pipeline */ }
            }
            catch (err) {
                console.error('Failed to load dashboard:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);
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
        return `${Math.floor(diffHours / 24)}d ago`;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: `Welcome, ${user?.first_name || 'Recruiter'}!`, description: "Manage your recruitment pipeline, screen candidates, and schedule interviews.", action: _jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary", children: [_jsx(Add, { style: { fontSize: 18 } }), " Post a Job"] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children", children: [_jsx(StatsCard, { title: "Jobs Posted", value: loading ? '—' : stats.jobs_posted, icon: _jsx(Work, { style: { fontSize: 22 } }), color: "blue", variant: "gradient" }), _jsx(StatsCard, { title: "Applications", value: loading ? '—' : stats.applications_received, icon: _jsx(People, { style: { fontSize: 22 } }), color: "purple", variant: "gradient" }), _jsx(StatsCard, { title: "Candidates", value: loading ? '—' : stats.total_candidates, icon: _jsx(TrendingUp, { style: { fontSize: 22 } }), color: "emerald", variant: "gradient" }), _jsx(StatsCard, { title: "Interviews", value: loading ? '—' : stats.interviews_scheduled, icon: _jsx(EventNote, { style: { fontSize: 22 } }), color: "orange", variant: "gradient" })] }), _jsxs("div", { className: "card-base p-6", children: [_jsx("h2", { className: "section-header mb-4", children: "Hiring Pipeline" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3", children: [
                            { name: 'Applied', count: pipeline.applied, color: '#3b82f6' },
                            { name: 'In Review', count: pipeline.under_review, color: '#f59e0b' },
                            { name: 'Shortlisted', count: pipeline.shortlisted, color: '#8b5cf6' },
                            { name: 'Interview', count: pipeline.interview_scheduled, color: '#10b981' },
                            { name: 'Selected', count: pipeline.selected, color: '#059669' },
                        ].map(stage => (_jsxs("div", { className: "text-center p-4 rounded-xl bg-gray-50 dark:bg-[#111111]", children: [_jsx("p", { className: "text-3xl font-bold", style: { color: stage.color }, children: stage.count }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium", children: stage.name })] }, stage.name))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 space-y-6", children: _jsxs("div", { className: "card-base p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "section-header", children: "Recent Activity" }), stats.notification_count > 0 && (_jsxs("span", { className: "px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-full", children: [stats.notification_count, " new"] }))] }), recentNotifs.length > 0 ? (_jsx("div", { className: "space-y-2", children: recentNotifs.map(notif => (_jsx("div", { className: `p-3 rounded-lg transition-all ${!notif.is_read
                                            ? 'bg-blue-50/50 dark:bg-blue-900/5 border-l-4 border-l-blue-500'
                                            : 'bg-gray-50 dark:bg-[#111111]'}`, children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm ${!notif.is_read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`, children: notif.title }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-0.5", children: notif.message })] }), _jsx("span", { className: "text-[10px] text-gray-400 flex-shrink-0", children: getTimeAgo(notif.created_at) })] }) }, notif.id))) })) : (_jsxs("div", { className: "text-center py-10 text-gray-500 dark:text-zinc-400", children: [_jsx(NotifIcon, { style: { fontSize: 44 }, className: "text-gray-300 dark:text-zinc-600 mb-3" }), _jsx("p", { className: "text-sm font-medium", children: "No activity yet" }), _jsx("p", { className: "text-xs mt-1", children: "Notifications will appear when candidates apply to your jobs." }), _jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary text-sm mt-4", children: [_jsx(Add, { style: { fontSize: 16 } }), " Post a Job"] })] }))] }) }), _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "card-base p-6", children: [_jsx("h2", { className: "section-header mb-4", children: "Quick Actions" }), _jsx("div", { className: "space-y-2", children: [
                                        { label: 'Screen Resumes', path: '/recruiter/screening', icon: _jsx(FindInPage, { style: { fontSize: 16 } }) },
                                        { label: 'View Rankings', path: '/recruiter/rankings', icon: _jsx(EmojiEvents, { style: { fontSize: 16 } }) },
                                        { label: 'View Analytics', path: '/recruiter/analytics', icon: _jsx(BarChart, { style: { fontSize: 16 } }) },
                                    ].map(item => (_jsxs("button", { onClick: () => navigate(item.path), className: "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors font-medium text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-2", children: [_jsx("span", { className: "text-gray-400 dark:text-zinc-500", children: item.icon }), " ", item.label] }, item.path))) })] }) })] })] }));
};
export default RecruiterDashboard;
