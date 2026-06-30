import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import ProgressRing from '@components/ProgressRing';
import { useAuth } from '@context/AuthContext';
import {
  Assignment, EventNote, Psychology, Work, Description,
  CloudUpload, Person, CheckCircle, ArrowForward, RocketLaunch,
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface DashboardStats {
  resume_count: number;
  application_count: number;
  interview_count: number;
  notification_count: number;
  profile_completion: number;
}

interface RecentApp {
  id: number;
  job_title: string;
  company_name: string;
  status: string;
  status_display: string;
  applied_at: string;
  job_id: number;
}

const STATUS_COLORS: Record<string, string> = {
  applied: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20',
  under_review: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/20',
  shortlisted: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/20',
  interview_scheduled: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/20',
  selected: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20',
  rejected: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20',
};

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    resume_count: 0,
    application_count: 0,
    interview_count: 0,
    notification_count: 0,
    profile_completion: 0,
  });
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          apiClient.get('/dashboard/stats/'),
          apiClient.get('/applications/').catch(() => ({ data: { data: [] } })),
        ]);
        if (statsRes.data.status && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
        if (appsRes.data.data) {
          setRecentApps(appsRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isNewUser = stats.resume_count === 0 && stats.application_count === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user?.first_name ? `, ${user.first_name}` : ''}!`}
        description="Track your applications, resume performance, and upcoming interviews."
      />

      {/* Onboarding Banner — shown to new users */}
      {!loading && isNewUser && (
        <div className="card-base p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/30">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><RocketLaunch style={{ fontSize: 20 }} className="text-blue-600" /> Get Started</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">Complete these steps to start using ResumeRank AI.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                step: 1,
                title: 'Complete Profile',
                description: 'Add your details for better matching',
                done: stats.profile_completion >= 75,
                action: () => navigate('/candidate/settings'),
                icon: <Person style={{ fontSize: 20 }} />,
              },
              {
                step: 2,
                title: 'Upload Resume',
                description: 'Upload your resume for AI analysis',
                done: stats.resume_count > 0,
                action: () => navigate('/candidate/resume'),
                icon: <CloudUpload style={{ fontSize: 20 }} />,
              },
              {
                step: 3,
                title: 'Browse Jobs',
                description: 'Find jobs that match your skills',
                done: false,
                action: () => navigate('/candidate/jobs'),
                icon: <Work style={{ fontSize: 20 }} />,
              },
            ].map(item => (
              <button
                key={item.step}
                onClick={item.action}
                className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  item.done
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-[#222222] hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.done ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                }`}>
                  {item.done ? <CheckCircle style={{ fontSize: 20 }} /> : item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Resumes" value={loading ? '—' : stats.resume_count} icon={<Description style={{ fontSize: 22 }} />} color="indigo" />
        <StatsCard title="Applications" value={loading ? '—' : stats.application_count} icon={<Assignment style={{ fontSize: 22 }} />} color="blue" />
        <StatsCard title="Interviews" value={loading ? '—' : stats.interview_count} icon={<EventNote style={{ fontSize: 22 }} />} color="emerald" />
        <StatsCard title="AI Insights" value={loading ? '—' : stats.resume_count > 0 ? 'Available' : '—'} icon={<Psychology style={{ fontSize: 22 }} />} color="purple" description={stats.resume_count > 0 ? 'View insights' : 'Upload resume first'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="card-base p-6">
            <h2 className="section-header mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Upload Resume', icon: <CloudUpload style={{ fontSize: 20 }} />, path: '/candidate/resume', color: 'from-blue-500 to-indigo-500' },
                { label: 'Browse Jobs', icon: <Work style={{ fontSize: 20 }} />, path: '/candidate/jobs', color: 'from-emerald-500 to-teal-500' },
                { label: 'AI Insights', icon: <Psychology style={{ fontSize: 20 }} />, path: '/candidate/insights', color: 'from-purple-500 to-pink-500' },
                { label: 'My Applications', icon: <Assignment style={{ fontSize: 20 }} />, path: '/candidate/applications', color: 'from-amber-500 to-orange-500' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all group text-left"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                  </div>
                  <ArrowForward style={{ fontSize: 16 }} className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-header">Recent Applications</h2>
              {recentApps.length > 0 && (
                <button onClick={() => navigate('/candidate/applications')} className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </button>
              )}
            </div>
            {recentApps.length > 0 ? (
              <div className="space-y-3">
                {recentApps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/candidate/jobs/${app.job_id}`)}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{app.job_title}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{app.company_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[app.status] || STATUS_COLORS['applied']}`}>
                      {app.status_display}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                <Assignment style={{ fontSize: 40 }} className="text-gray-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm font-medium">No applications yet</p>
                <p className="text-xs mt-1">Browse jobs and submit your first application.</p>
                <button onClick={() => navigate('/candidate/jobs')} className="btn-primary text-xs mt-3">
                  <Work style={{ fontSize: 14 }} /> Browse Jobs
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="card-base p-6">
            <h2 className="section-header mb-4">Profile Status</h2>
            <div className="flex flex-col items-center">
              <ProgressRing value={stats.profile_completion} label="Complete" />
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3 text-center">
                {stats.profile_completion < 75
                  ? 'Complete your profile to improve job matching.'
                  : 'Great! Your profile is well completed.'}
              </p>
              {stats.profile_completion < 100 && (
                <button onClick={() => navigate('/candidate/settings')} className="btn-secondary text-xs mt-3 w-full justify-center">
                  Complete Profile
                </button>
              )}
            </div>
          </div>

          {/* Resume Status */}
          <div className="card-base p-6">
            <h2 className="section-header mb-4">Resume Status</h2>
            {stats.resume_count > 0 ? (
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.resume_count}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">resume(s) uploaded</p>
                <button onClick={() => navigate('/candidate/resume')} className="btn-secondary text-xs mt-3 w-full justify-center">
                  Manage Resumes
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <CloudUpload style={{ fontSize: 32 }} className="text-gray-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-zinc-400">No resumes uploaded</p>
                <button onClick={() => navigate('/candidate/resume')} className="btn-primary text-xs mt-3 w-full justify-center">
                  <CloudUpload style={{ fontSize: 14 }} /> Upload Resume
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Interviews */}
          <div className="card-base p-6">
            <h2 className="section-header mb-4">Interviews</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-3">No upcoming interviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
