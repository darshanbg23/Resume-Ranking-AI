import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import {
  Search, Refresh, CheckCircle, Cancel, AutoAwesome,
  ThumbUp, ThumbDown, Star, EventNote,
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface JobItem {
  id: number;
  job_title: string;
  job_description: string;
}

interface CandidateMatch {
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

interface Applicant {
  id: number;
  status: string;
  status_display: string;
  candidate?: { id: number; name: string; email: string };
}

const TIER_COLORS: Record<string, string> = {
  excellent: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  good: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  average: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  poor: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

export const RecruiterScreening: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/jobs/');
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

  const handleScreenJob = async (jobId: number) => {
    setScreeningLoading(true);
    setCandidates([]);
    setApplicants([]);
    try {
      const [rankRes, appRes] = await Promise.all([
        apiClient.get(`/ai/rankings/${jobId}/`),
        apiClient.get(`/jobs/${jobId}/applicants/`).catch(() => ({ data: { data: { applicants: [] } } })),
      ]);
      if (rankRes.data.status) {
        setCandidates(rankRes.data.data.candidates || []);
      }
      if (appRes.data.data?.applicants) {
        setApplicants(appRes.data.data.applicants);
      }
    } catch (err) {
      console.error('Screening failed:', err);
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    handleScreenJob(jobId);
  };

  const handleStatusAction = async (candidateUserId: number, newStatus: string) => {
    const app = applicants.find(a => a.candidate?.id === candidateUserId);
    if (!app) {
      setActionMessage('This candidate has not applied for this job.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    setActionLoading(candidateUserId);
    try {
      const res = await apiClient.put(`/applications/${app.id}/status/`, { status: newStatus });
      if (res.data.status) {
        setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus, status_display: res.data.data.status_display } : a));
        setActionMessage('Candidate status updated. Notification sent.');
      }
    } catch (err: any) {
      setActionMessage(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const getApplicantStatus = (userId: number): Applicant | undefined => {
    return applicants.find(a => a.candidate?.id === userId);
  };

  const filtered = candidates.filter(c => {
    const matchesSearch = !searchTerm ||
      c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Resume Screening" description="Loading..." />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="card-base p-6 h-24 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Resume Screening" description="Screen and evaluate candidate resumes with AI-powered analysis." />
        <EmptyState title="No Jobs Posted" description="Post a job first to start screening candidate resumes against your requirements." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Resume Screening" description="Screen and evaluate candidate resumes with AI-powered analysis." />

      {actionMessage && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 animate-fadeIn">
          <p className="text-sm text-blue-700 dark:text-blue-400">{actionMessage}</p>
        </div>
      )}

      {/* Job Selector */}
      <div className="card-base p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">Select Job to Screen Against</label>
            <select value={selectedJobId || ''} onChange={(e) => handleSelectJob(Number(e.target.value))} className="input-base text-sm w-full">
              <option value="">Choose a job posting...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.job_title}</option>)}
            </select>
          </div>
          {selectedJobId && (
            <button onClick={() => handleScreenJob(selectedJobId)} disabled={screeningLoading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              <Refresh style={{ fontSize: 16 }} className={screeningLoading ? 'animate-spin' : ''} />
              {screeningLoading ? 'Screening...' : 'Re-Screen All'}
            </button>
          )}
        </div>
      </div>

      {selectedJobId && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-base pl-9 text-sm w-full" />
            </div>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="input-base text-sm w-48">
              <option value="all">All Tiers</option>
              <option value="excellent">Excellent (≥90)</option>
              <option value="good">Good (≥75)</option>
              <option value="average">Average (≥50)</option>
              <option value="poor">Poor (&lt;50)</option>
            </select>
          </div>

          {candidates.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['excellent', 'good', 'average', 'poor'] as const).map(tier => {
                const count = candidates.filter(c => c.tier === tier).length;
                return (
                  <div key={tier} className={`p-3 rounded-xl border ${TIER_COLORS[tier]}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs capitalize">{tier} Match</p>
                  </div>
                );
              })}
            </div>
          )}

          {screeningLoading ? (
            <div className="card-base p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">Screening candidates with AI...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(candidate => {
                const appStatus = getApplicantStatus(candidate.user_id);
                return (
                  <div key={candidate.resume_id} className="card-base overflow-hidden transition-all">
                    <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => setExpandedId(expandedId === candidate.resume_id ? null : candidate.resume_id)}>
                      <div className="flex-shrink-0">
                        <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-zinc-400">#{candidate.rank}</span>
                      </div>
                      <ProgressRing value={Math.round(candidate.overall_score)} size={48} strokeWidth={4} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{candidate.candidate_name}</p>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${TIER_COLORS[candidate.tier]}`}>{candidate.tier_label}</span>
                          {appStatus && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              {appStatus.status_display || appStatus.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {candidate.experience && `${candidate.experience} yrs exp · `}
                          {candidate.skills.slice(0, 4).join(', ')}{candidate.skills.length > 4 && ` +${candidate.skills.length - 4} more`}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                        <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{candidate.semantic_score.toFixed(0)}</p><p>Semantic</p></div>
                        <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{candidate.keyword_score.toFixed(0)}</p><p>Keyword</p></div>
                      </div>
                    </div>

                    {expandedId === candidate.resume_id && (
                      <div className="border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900/30 space-y-4 animate-fadeIn">
                        {candidate.summary && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1"><AutoAwesome style={{ fontSize: 14 }} /> AI Summary</h4>
                            <p className="text-sm text-gray-700 dark:text-zinc-300">{candidate.summary}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-white dark:bg-zinc-800"><p className="text-xs text-gray-500">Semantic</p><p className="text-lg font-bold text-blue-600">{candidate.semantic_score.toFixed(1)}%</p></div>
                          <div className="p-3 rounded-lg bg-white dark:bg-zinc-800"><p className="text-xs text-gray-500">Keyword</p><p className="text-lg font-bold text-purple-600">{candidate.keyword_score.toFixed(1)}%</p></div>
                          <div className="p-3 rounded-lg bg-white dark:bg-zinc-800"><p className="text-xs text-gray-500">Overall</p><p className="text-lg font-bold text-emerald-600">{candidate.overall_score.toFixed(1)}%</p></div>
                          <div className="p-3 rounded-lg bg-white dark:bg-zinc-800"><p className="text-xs text-gray-500">Education</p><p className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">{candidate.education || 'N/A'}</p></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-semibold text-emerald-600 uppercase mb-1.5 flex items-center gap-1"><CheckCircle style={{ fontSize: 14 }} /> Matched ({candidate.skills_matched.length})</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills_matched.map((s, i) => (<span key={i} className="px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded">{s}</span>))}
                              {candidate.skills_matched.length === 0 && <span className="text-xs text-gray-400">None</span>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-red-600 uppercase mb-1.5 flex items-center gap-1"><Cancel style={{ fontSize: 14 }} /> Missing ({candidate.skills_missing.length})</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills_missing.map((s, i) => (<span key={i} className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">{s}</span>))}
                              {candidate.skills_missing.length === 0 && <span className="text-xs text-emerald-500">All matched!</span>}
                            </div>
                          </div>
                        </div>

                        {/* Recruiter Actions */}
                        {appStatus ? (
                          <div className="pt-3 border-t border-gray-200 dark:border-zinc-700">
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                              Current: <span className="font-semibold text-gray-900 dark:text-white">{appStatus.status_display || appStatus.status}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {appStatus.status !== 'shortlisted' && appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (
                                <button onClick={(e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'shortlisted'); }} disabled={actionLoading === candidate.user_id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                                  <Star style={{ fontSize: 14 }} /> Shortlist
                                </button>
                              )}
                              {appStatus.status !== 'interview_scheduled' && appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (
                                <button onClick={(e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'interview_scheduled'); }} disabled={actionLoading === candidate.user_id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                                  <EventNote style={{ fontSize: 14 }} /> Interview
                                </button>
                              )}
                              {appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (
                                <button onClick={(e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'selected'); }} disabled={actionLoading === candidate.user_id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                                  <ThumbUp style={{ fontSize: 14 }} /> Accept
                                </button>
                              )}
                              {appStatus.status !== 'rejected' && appStatus.status !== 'selected' && (
                                <button onClick={(e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'rejected'); }} disabled={actionLoading === candidate.user_id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                                  <ThumbDown style={{ fontSize: 14 }} /> Reject
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-3 border-t border-gray-200 dark:border-zinc-700">
                            <p className="text-xs text-gray-400 dark:text-zinc-500 italic">This candidate has not applied. Actions are available after they apply.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : candidates.length > 0 ? (
            <EmptyState title="No Matching Candidates" description="No candidates match your current search or filter criteria." />
          ) : (
            <EmptyState title="No Candidates Screened Yet" description="No analyzed resumes found. Candidates need to upload and analyze their resumes first." />
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterScreening;
