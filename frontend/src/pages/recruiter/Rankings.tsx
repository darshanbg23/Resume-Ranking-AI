import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import {
  EmojiEvents, TrendingUp,
  Star, ArrowDownward
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface JobItem {
  id: number;
  job_title: string;
  job_description: string;
}

interface RankedCandidate {
  resume_id: number;
  user_id: number;
  candidate_name: string;
  email: string;
  file_name: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  semantic_score: number;
  keyword_score: number;
  overall_score: number;
  tier: string;
  tier_label: string;
  skills_matched: string[];
  skills_missing: string[];
  rank: number;
  analyzed_at: string | null;
}

const TIER_CONFIG: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
  excellent: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    icon: <EmojiEvents style={{ fontSize: 20 }} className="text-amber-500" />,
  },
  good: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: <Star style={{ fontSize: 20 }} className="text-blue-500" />,
  },
  average: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: <TrendingUp style={{ fontSize: 20 }} className="text-amber-500" />,
  },
  poor: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: <ArrowDownward style={{ fontSize: 20 }} className="text-red-500" />,
  },
};

export const RecruiterRankings: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/jobs/my/');
        const jobData = res.data?.data || res.data || [];
        setJobs(Array.isArray(jobData) ? jobData : []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFetchRankings = async (jobId: number) => {
    setRankingLoading(true);
    try {
      const res = await apiClient.get(`/ai/rankings/${jobId}/`);
      if (res.data.status) {
        setCandidates(res.data.data.candidates || []);
      }
    } catch (err) {
      console.error('Ranking failed:', err);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    handleFetchRankings(jobId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Candidate Rankings" description="Loading..." />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card-base p-6 h-20 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Candidate Rankings" description="View AI-powered candidate rankings for your job postings." />
        <EmptyState
          title="No Jobs Posted"
          description="Post a job first to generate candidate rankings."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Candidate Rankings" description="AI-powered candidate rankings sorted by composite match score." />

      {/* Job Selector */}
      <div className="card-base p-5">
        <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">Select Job to View Rankings</label>
        <select
          value={selectedJobId || ''}
          onChange={(e) => handleSelectJob(Number(e.target.value))}
          className="input-base text-sm w-full max-w-md"
        >
          <option value="">Choose a job posting...</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.job_title}</option>)}
        </select>
      </div>

      {selectedJobId && (
        <>
          {rankingLoading ? (
            <div className="card-base p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">Computing rankings...</p>
            </div>
          ) : candidates.length > 0 ? (
            <>
              {/* Tier Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['excellent', 'good', 'average', 'poor'] as const).map(tier => {
                  const count = candidates.filter(c => c.tier === tier).length;
                  const config = TIER_CONFIG[tier];
                  return (
                    <div key={tier} className={`p-4 rounded-xl border ${config.bg}`}>
                      <div className="flex items-center justify-between mb-1">
                        {config.icon}
                        <span className={`text-2xl font-bold ${config.color}`}>{count}</span>
                      </div>
                      <p className={`text-xs font-medium capitalize ${config.color}`}>{tier} Match</p>
                    </div>
                  );
                })}
              </div>

              {/* Ranked List */}
              <div className="card-base overflow-hidden">
                {/* Header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-3">Candidate</div>
                  <div className="col-span-2">Skills</div>
                  <div className="col-span-1 text-center">Exp</div>
                  <div className="col-span-1 text-center">Semantic</div>
                  <div className="col-span-1 text-center">Keyword</div>
                  <div className="col-span-2 text-center">Overall Score</div>
                  <div className="col-span-1 text-center">Tier</div>
                </div>

                {/* Rows */}
                {candidates.map((c, idx) => {
                  return (
                    <div
                      key={c.resume_id}
                      className={`grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors ${
                        idx === 0 ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 text-center hidden sm:block">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          idx === 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700' :
                          idx === 1 ? 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300' :
                          idx === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700' :
                          'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                        }`}>
                          {c.rank}
                        </span>
                      </div>

                      {/* Candidate Info */}
                      <div className="col-span-3">
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="sm:hidden text-xs text-gray-400">#{c.rank}</span>
                          {c.candidate_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{c.email}</p>
                      </div>

                      {/* Skills */}
                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">{s}</span>
                          ))}
                          {c.skills.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{c.skills.length - 3}</span>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="col-span-1 text-center text-sm text-gray-700 dark:text-zinc-300 hidden sm:block">
                        {c.experience || '—'} {c.experience ? 'yrs' : ''}
                      </div>

                      {/* Semantic Score */}
                      <div className="col-span-1 text-center text-sm font-medium text-blue-600 hidden sm:block">
                        {c.semantic_score.toFixed(0)}%
                      </div>

                      {/* Keyword Score */}
                      <div className="col-span-1 text-center text-sm font-medium text-purple-600 hidden sm:block">
                        {c.keyword_score.toFixed(0)}%
                      </div>

                      {/* Overall */}
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        <ProgressRing value={Math.round(c.overall_score)} size={40} strokeWidth={3} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{c.overall_score.toFixed(1)}%</span>
                      </div>

                      {/* Tier Badge */}
                      <div className="col-span-1 text-center">
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full border ${
                          c.tier === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300' :
                          c.tier === 'good' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300' :
                          c.tier === 'average' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300' :
                          'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300'
                        }`}>
                          {c.tier_label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              title="No Rankings Available"
              description="No analyzed resumes found. Candidates need to upload and analyze their resumes for rankings to appear."
            />
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterRankings;
