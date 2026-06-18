import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import { useAuth } from '@context/AuthContext';
import { Work, People, TrendingUp, EventNote, Add, Notifications as NotifIcon } from '@mui/icons-material';
import apiClient from '../../services/api';

interface RecruiterStats {
  jobs_posted: number;
  applications_received: number;
  candidates_screened: number;
  interviews_scheduled: number;
  total_candidates: number;
  notification_count: number;
}

interface PipelineCounts {
  applied: number;
  under_review: number;
  shortlisted: number;
  interview_scheduled: number;
  selected: number;
}

interface RecentNotif {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<RecruiterStats>({
    jobs_posted: 0,
    applications_received: 0,
    candidates_screened: 0,
    interviews_scheduled: 0,
    total_candidates: 0,
    notification_count: 0,
  });
  const [pipeline, setPipeline] = useState<PipelineCounts>({
    applied: 0, under_review: 0, shortlisted: 0, interview_scheduled: 0, selected: 0,
  });
  const [recentNotifs, setRecentNotifs] = useState<RecentNotif[]>([]);
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

        // Fetch pipeline counts from all jobs' applicants
        try {
          const jobsRes = await apiClient.get('/jobs/');
          const jobs = jobsRes.data.data || [];
          const myJobs = jobs.filter((j: any) => j.posted_by_id === user?.id);

          let counts: PipelineCounts = { applied: 0, under_review: 0, shortlisted: 0, interview_scheduled: 0, selected: 0 };
          for (const job of myJobs) {
            try {
              const appRes = await apiClient.get(`/jobs/${job.id}/applicants/`);
              if (appRes.data.data?.applicants) {
                for (const app of appRes.data.data.applicants) {
                  if (app.status in counts) {
                    counts[app.status as keyof PipelineCounts]++;
                  }
                }
              }
            } catch { /* skip */ }
          }
          setPipeline(counts);
        } catch { /* skip pipeline */ }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.first_name || 'Recruiter'}!`}
        description="Manage your recruitment pipeline, screen candidates, and schedule interviews."
        action={<button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary"><Add style={{ fontSize: 18 }} /> Post a Job</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Jobs Posted" value={loading ? '—' : stats.jobs_posted} icon={<Work style={{ fontSize: 22 }} />} color="blue" variant="gradient" />
        <StatsCard title="Applications" value={loading ? '—' : stats.applications_received} icon={<People style={{ fontSize: 22 }} />} color="purple" variant="gradient" />
        <StatsCard title="Candidates" value={loading ? '—' : stats.total_candidates} icon={<TrendingUp style={{ fontSize: 22 }} />} color="emerald" variant="gradient" />
        <StatsCard title="Interviews" value={loading ? '—' : stats.interviews_scheduled} icon={<EventNote style={{ fontSize: 22 }} />} color="orange" variant="gradient" />
      </div>

      {/* Pipeline */}
      <div className="card-base p-6">
        <h2 className="section-header mb-4">Hiring Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: 'Applied', count: pipeline.applied, color: '#3b82f6' },
            { name: 'In Review', count: pipeline.under_review, color: '#f59e0b' },
            { name: 'Shortlisted', count: pipeline.shortlisted, color: '#8b5cf6' },
            { name: 'Interview', count: pipeline.interview_scheduled, color: '#10b981' },
            { name: 'Selected', count: pipeline.selected, color: '#059669' },
          ].map(stage => (
            <div key={stage.name} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-[#111111]">
              <p className="text-3xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">{stage.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Notifications */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-header">Recent Activity</h2>
              {stats.notification_count > 0 && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-full">
                  {stats.notification_count} new
                </span>
              )}
            </div>
            {recentNotifs.length > 0 ? (
              <div className="space-y-2">
                {recentNotifs.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg transition-all ${
                      !notif.is_read
                        ? 'bg-blue-50/50 dark:bg-blue-900/5 border-l-4 border-l-blue-500'
                        : 'bg-gray-50 dark:bg-[#111111]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!notif.is_read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{notif.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{getTimeAgo(notif.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-zinc-400">
                <NotifIcon style={{ fontSize: 44 }} className="text-gray-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs mt-1">Notifications will appear when candidates apply to your jobs.</p>
                <button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary text-sm mt-4">
                  <Add style={{ fontSize: 16 }} /> Post a Job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card-base p-6">
            <h2 className="section-header mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Screen Resumes', path: '/recruiter/screening', emoji: '📋' },
                { label: 'View Rankings', path: '/recruiter/rankings', emoji: '⭐' },
                { label: 'Schedule Interview', path: '/recruiter/interviews', emoji: '📅' },
                { label: 'View Analytics', path: '/recruiter/analytics', emoji: '📊' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors font-medium text-sm text-gray-700 dark:text-zinc-300"
                >
                  {item.emoji} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
