import React, { useEffect, useState } from 'react';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import { useAuth } from '@context/AuthContext';
import {
  People, Person, Work, TrendingUp, Description,
  Psychology, CheckCircle, Analytics, Code, EmojiEvents
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  total_resumes: number;
}

interface AIStats {
  total_resumes: number;
  analyzed_resumes: number;
  failed_analyses: number;
  success_rate: number;
  average_match_score: number;
  top_skills: { skill: string; count: number }[];
  tier_distribution: { excellent: number; good: number; average: number; poor: number };
  total_matches: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0, total_candidates: 0, total_recruiters: 0, total_jobs: 0, total_resumes: 0,
  });
  const [aiStats, setAIStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aiRes] = await Promise.all([
          apiClient.get('/dashboard/stats/'),
          apiClient.get('/ai/admin-stats/').catch(() => null),
        ]);
        if (statsRes.data.status && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
        if (aiRes?.data?.status) {
          setAIStats(aiRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
        setAILoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.first_name || 'Admin'}!`} description="Platform overview, AI analytics, and system management." />

      {/* Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <StatsCard title="Total Users" value={loading ? '—' : stats.total_users} icon={<People style={{ fontSize: 22 }} />} color="blue" />
        <StatsCard title="Candidates" value={loading ? '—' : stats.total_candidates} icon={<Person style={{ fontSize: 22 }} />} color="indigo" />
        <StatsCard title="Recruiters" value={loading ? '—' : stats.total_recruiters} icon={<People style={{ fontSize: 22 }} />} color="purple" />
        <StatsCard title="Total Jobs" value={loading ? '—' : stats.total_jobs} icon={<Work style={{ fontSize: 22 }} />} color="emerald" />
        <StatsCard title="Resumes" value={loading ? '—' : stats.total_resumes} icon={<Description style={{ fontSize: 22 }} />} color="orange" />
      </div>

      {/* AI Analytics Section */}
      {aiStats && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <Psychology style={{ fontSize: 22 }} className="text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Analytics</h2>
          </div>

          {/* AI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-2">
                <Analytics style={{ fontSize: 18 }} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">AI Analyses</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{aiStats.analyzed_resumes}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">of {aiStats.total_resumes} resumes</p>
            </div>

            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle style={{ fontSize: 18 }} className="text-emerald-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{aiStats.success_rate}%</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{aiStats.failed_analyses} failed</p>
            </div>

            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp style={{ fontSize: 18 }} className="text-purple-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">Avg Match Score</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{aiStats.average_match_score}%</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">across all analyses</p>
            </div>

            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-2">
                <EmojiEvents style={{ fontSize: 18 }} className="text-amber-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">Total Matches</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{aiStats.total_matches}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">resume-job pairs scored</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Tier Distribution */}
            <div className="card-base p-6">
              <h3 className="section-header mb-4 flex items-center gap-2">
                <EmojiEvents style={{ fontSize: 18 }} className="text-amber-500" /> Match Tier Distribution
              </h3>
              {aiStats.total_matches > 0 ? (
                <div className="space-y-3">
                  {[
                    { tier: 'Excellent', count: aiStats.tier_distribution.excellent, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                    { tier: 'Good', count: aiStats.tier_distribution.good, color: 'bg-blue-500', textColor: 'text-blue-600' },
                    { tier: 'Average', count: aiStats.tier_distribution.average, color: 'bg-amber-500', textColor: 'text-amber-600' },
                    { tier: 'Poor', count: aiStats.tier_distribution.poor, color: 'bg-red-500', textColor: 'text-red-600' },
                  ].map(item => (
                    <div key={item.tier}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-zinc-400">{item.tier}</span>
                        <span className={`font-bold ${item.textColor}`}>{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${aiStats.total_matches > 0 ? (item.count / aiStats.total_matches) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No match data yet</p>
              )}
            </div>

            {/* Top Skills */}
            <div className="card-base p-6">
              <h3 className="section-header mb-4 flex items-center gap-2">
                <Code style={{ fontSize: 18 }} className="text-blue-500" /> Top Skills (Platform-wide)
              </h3>
              {aiStats.top_skills.length > 0 ? (
                <div className="space-y-2">
                  {aiStats.top_skills.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-700 dark:text-zinc-300 capitalize">{item.skill}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No skill data yet</p>
              )}
            </div>

            {/* System Health */}
            <div className="card-base p-6">
              <h2 className="section-header mb-4">System Health</h2>
              <div className="space-y-3">
                {[
                  { name: 'Database', status: 'Connected', color: 'bg-emerald-500' },
                  { name: 'API Server', status: 'Running', color: 'bg-emerald-500' },
                  { name: 'AI Engine (Groq)', status: 'Ready', color: 'bg-emerald-500' },
                  { name: 'Semantic Engine', status: 'Ready', color: 'bg-emerald-500' },
                  { name: 'SpaCy NER', status: 'Loaded', color: 'bg-emerald-500' },
                  { name: 'File Storage', status: 'Available', color: 'bg-emerald-500' },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{item.name}</span>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{item.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Platform Summary (when no AI stats) */}
      {!aiStats && !aiLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-base p-6">
            <h2 className="section-header mb-4">System Health</h2>
            <div className="space-y-3">
              {[
                { name: 'Database', status: 'Connected', color: 'bg-emerald-500' },
                { name: 'API Server', status: 'Running', color: 'bg-emerald-500' },
                { name: 'AI Engine', status: 'Ready', color: 'bg-emerald-500' },
                { name: 'File Storage', status: 'Available', color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-zinc-400">{item.name}</span>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{item.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-base p-6">
            <h2 className="section-header mb-4">Platform Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-zinc-400">Total Users</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.total_users}</span>
                </div>
                <div className="progress-bar"><div className="progress-bar-fill bg-blue-500" style={{ width: `${Math.min(stats.total_users * 10, 100)}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-zinc-400">Total Jobs</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.total_jobs}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-zinc-400">Total Resumes</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.total_resumes}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <h2 className="section-header mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
              <TrendingUp style={{ fontSize: 44 }} className="text-gray-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs mt-1">Activity will appear here as users interact with the platform.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
