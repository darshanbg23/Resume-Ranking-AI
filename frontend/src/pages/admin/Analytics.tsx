import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import {
  TrendingUp, People, Work, Description,
  Analytics as AnalyticsIcon, Speed, Assessment
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface AnalyticsData {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  active_jobs: number;
  total_resumes: number;
  analyzed_resumes: number;
  recent_users_30d: number;
  recent_resumes_30d: number;
  top_skills: { skill: string; count: number }[];
  recent_activity: { type: string; description: string; timestamp: string }[];
}

const ACTIVITY_COLORS: Record<string, string> = {
  registration: 'bg-blue-500',
  upload: 'bg-emerald-500',
  analysis: 'bg-purple-500',
};

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/admin/analytics/');
        if (res.data.status) setData(res.data.data);
      } catch (err) { console.error('Failed:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Analytics" description="View platform-wide statistics and trends." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="card-base p-5 h-24 skeleton rounded-xl" />)}</div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>;

  const maxSkillCount = data.top_skills.length > 0 ? data.top_skills[0].count : 1;
  const analysisRate = data.total_resumes > 0 ? Math.round((data.analyzed_resumes / data.total_resumes) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Analytics" description="View platform-wide statistics and trends." />

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center"><People style={{ fontSize: 20 }} className="text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_users}</p><p className="text-xs text-gray-500">Total Users</p></div>
          </div>
          <p className="text-xs text-blue-600 mt-2">+{data.recent_users_30d} in last 30 days</p>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center"><Work style={{ fontSize: 20 }} className="text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_jobs}</p><p className="text-xs text-gray-500">Total Jobs</p></div>
          </div>
          <p className="text-xs text-emerald-600 mt-2">{data.active_jobs} active</p>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center"><Description style={{ fontSize: 20 }} className="text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_resumes}</p><p className="text-xs text-gray-500">Resumes</p></div>
          </div>
          <p className="text-xs text-purple-600 mt-2">+{data.recent_resumes_30d} in last 30 days</p>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center"><Speed style={{ fontSize: 20 }} className="text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisRate}%</p><p className="text-xs text-gray-500">Analysis Rate</p></div>
          </div>
          <p className="text-xs text-amber-600 mt-2">{data.analyzed_resumes} analyzed</p>
        </div>
      </div>

      {/* User Breakdown + Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Breakdown */}
        <div className="card-base p-5">
          <h3 className="section-header flex items-center gap-2"><Assessment style={{ fontSize: 18 }} /> User Breakdown</h3>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-zinc-300">Candidates</span><span className="text-sm font-bold text-emerald-600">{data.total_candidates}</span></div>
              <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(data.total_candidates / Math.max(data.total_users, 1)) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-zinc-300">Recruiters</span><span className="text-sm font-bold text-blue-600">{data.total_recruiters}</span></div>
              <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(data.total_recruiters / Math.max(data.total_users, 1)) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-600 dark:text-zinc-300">Admins</span><span className="text-sm font-bold text-purple-600">{data.total_users - data.total_candidates - data.total_recruiters}</span></div>
              <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((data.total_users - data.total_candidates - data.total_recruiters) / Math.max(data.total_users, 1)) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        <div className="card-base p-5">
          <h3 className="section-header flex items-center gap-2"><TrendingUp style={{ fontSize: 18 }} /> Top Skills (Platform-wide)</h3>
          {data.top_skills.length > 0 ? (
            <div className="space-y-2 mt-4">
              {data.top_skills.slice(0, 8).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-gray-600 dark:text-zinc-300 capitalize">{s.skill}</span>
                    <span className="text-xs font-medium text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${(s.count / maxSkillCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No skills data available yet.</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-base p-5">
        <h3 className="section-header flex items-center gap-2"><AnalyticsIcon style={{ fontSize: 18 }} /> Recent Activity</h3>
        {data.recent_activity.length > 0 ? (
          <div className="space-y-3 mt-4">
            {data.recent_activity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_COLORS[activity.type] || 'bg-gray-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 dark:text-zinc-300">{activity.description}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
