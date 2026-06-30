import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import EmptyState from '@components/EmptyState';
import {
  Work, People, CheckCircle, Cancel, Star, TrendingUp,
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  EmojiEvents, Add, WorkOff, ThumbUp
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import apiClient from '../../services/api';

interface AnalyticsData {
  total_jobs: number;
  active_jobs: number;
  closed_jobs: number;
  total_applications: number;
  shortlisted: number;
  selected: number;
  rejected: number;
  avg_match_score: number;
  applications_per_job: JobAppCount[];
  top_5_jobs: JobAppCount[];
  status_distribution: StatusItem[];
}

interface JobAppCount {
  job_id: number;
  job_title: string;
  company_name: string;
  is_active: boolean;
  application_count: number;
}

interface StatusItem {
  name: string;
  value: number;
  color: string;
}

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{label}</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
          {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-bold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
          {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export const RecruiterAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/recruiter/analytics/');
        if (res.data.status) {
          setData(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Recruitment analytics and insights." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[5, 6, 7, 8].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 skeleton rounded-xl" />
          <div className="h-72 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Recruitment analytics and insights." />
        <EmptyState
          title="Failed to Load Analytics"
          description="Something went wrong while loading your analytics. Please try again."
        />
      </div>
    );
  }

  const hasJobs = data.total_jobs > 0;
  const hasApplications = data.total_applications > 0;

  // Truncate job titles for chart display
  const barChartData = data.applications_per_job.map(j => ({
    ...j,
    short_title: j.job_title.length > 22 ? j.job_title.slice(0, 20) + '…' : j.job_title,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Your recruitment analytics and insights — all data shown is specific to your account."
        action={
          !hasJobs ? (
            <button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary">
              <Add style={{ fontSize: 18 }} /> Post Your First Job
            </button>
          ) : undefined
        }
      />

      {/* ── Row 1: Job & Application Stats ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          title="Total Jobs Posted"
          value={data.total_jobs}
          icon={<Work style={{ fontSize: 22 }} />}
          color="blue"
          variant="gradient"
        />
        <StatsCard
          title="Active Jobs"
          value={data.active_jobs}
          icon={<CheckCircle style={{ fontSize: 22 }} />}
          color="emerald"
          variant="gradient"
        />
        <StatsCard
          title="Closed Jobs"
          value={data.closed_jobs}
          icon={<WorkOff style={{ fontSize: 22 }} />}
          color="orange"
          variant="gradient"
        />
        <StatsCard
          title="Total Applications"
          value={data.total_applications}
          icon={<People style={{ fontSize: 22 }} />}
          color="purple"
          variant="gradient"
        />
      </div>

      {/* ── Row 2: Candidate & Score Stats ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          title="Shortlisted"
          value={data.shortlisted}
          icon={<Star style={{ fontSize: 22 }} />}
          color="indigo"
          description="Candidates shortlisted"
        />
        <StatsCard
          title="Selected"
          value={data.selected}
          icon={<ThumbUp style={{ fontSize: 22 }} />}
          color="green"
          description="Candidates selected"
        />
        <StatsCard
          title="Rejected"
          value={data.rejected}
          icon={<Cancel style={{ fontSize: 22 }} />}
          color="red"
          description="Candidates rejected"
        />
        <StatsCard
          title="Avg Match Score"
          value={data.avg_match_score > 0 ? `${data.avg_match_score}%` : 'N/A'}
          icon={<TrendingUp style={{ fontSize: 22 }} />}
          color="pink"
          description="Across all applicants"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      {hasApplications ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Applications Per Job */}
          <div className="card-base p-6">
            <h3 className="section-header flex items-center gap-2 mb-4">
              <BarChartIcon style={{ fontSize: 20 }} className="text-blue-500" />
              Applications Per Job
            </h3>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(240, barChartData.length * 48)}>
                <BarChart data={barChartData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="short_title"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltipBar />} />
                  <Bar
                    dataKey="application_count"
                    name="Applications"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  >
                    {barChartData.map((_entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-zinc-400 py-8 text-center">No application data to chart.</p>
            )}
          </div>

          {/* Pie Chart: Status Distribution */}
          <div className="card-base p-6">
            <h3 className="section-header flex items-center gap-2 mb-4">
              <PieChartIcon style={{ fontSize: 20 }} className="text-purple-500" />
              Application Status Breakdown
            </h3>
            {data.status_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {data.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-600 dark:text-zinc-400">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-zinc-400 py-8 text-center">No status data available.</p>
            )}
          </div>
        </div>
      ) : hasJobs ? (
        <div className="card-base p-8 text-center">
          <People style={{ fontSize: 48 }} className="text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Applications Yet</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
            Your jobs haven't received any applications yet. Charts and detailed analytics will appear here once candidates start applying.
          </p>
        </div>
      ) : null}

      {/* ── Top 5 Jobs by Applications ──────────────────── */}
      {hasJobs && (
        <div className="card-base p-6">
          <h3 className="section-header flex items-center gap-2 mb-4">
            <EmojiEvents style={{ fontSize: 20 }} className="text-amber-500" />
            Top {Math.min(5, data.top_5_jobs.length)} Jobs by Applications
          </h3>
          {data.top_5_jobs.length > 0 && data.top_5_jobs.some(j => j.application_count > 0) ? (
            <div className="space-y-3">
              {data.top_5_jobs.filter(j => j.application_count > 0).map((job, i) => {
                const maxApps = data.top_5_jobs[0].application_count || 1;
                const pct = Math.round((job.application_count / maxApps) * 100);
                return (
                  <div key={job.job_id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : i === 1 ? 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                          : i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                          : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {job.job_title}
                        </span>
                        {job.company_name && (
                          <span className="text-xs text-gray-400 dark:text-zinc-500 hidden sm:inline">
                            • {job.company_name}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          job.is_active
                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                        }`}>
                          {job.is_active ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 ml-3">
                        {job.application_count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden ml-8">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
              No applications received yet across your jobs.
            </p>
          )}
        </div>
      )}

      {/* ── All Jobs Table ──────────────────────────────── */}
      {hasJobs && data.applications_per_job.length > 5 && (
        <div className="card-base overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800">
            <h3 className="section-header">All Jobs — Application Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">
                  <th className="text-left p-3">Job Title</th>
                  <th className="text-left p-3 hidden sm:table-cell">Company</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Applications</th>
                </tr>
              </thead>
              <tbody>
                {data.applications_per_job.map(job => (
                  <tr key={job.job_id} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{job.job_title}</td>
                    <td className="p-3 text-gray-500 dark:text-zinc-400 hidden sm:table-cell">{job.company_name || '—'}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        job.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                      }`}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-gray-900 dark:text-white">{job.application_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty State: No Jobs ────────────────────────── */}
      {!hasJobs && (
        <div className="card-base p-10 text-center">
          <Work style={{ fontSize: 52 }} className="text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Jobs Posted Yet</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-lg mx-auto mb-6">
            Start by posting a job to begin receiving applications. Your recruitment analytics — including application trends, candidate scores, and status breakdowns — will appear here automatically.
          </p>
          <button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary">
            <Add style={{ fontSize: 18 }} /> Post a Job
          </button>
        </div>
      )}
    </div>
  );
};

export default RecruiterAnalytics;
