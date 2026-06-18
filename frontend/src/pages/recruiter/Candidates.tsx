import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import {
  Search, Work, School, Description, AutoAwesome
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface CandidateResume {
  id: number;
  file_name: string;
  status: string;
  match_score: number | null;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  analyzed_at: string | null;
}

interface CandidateData {
  user_id: number;
  name: string;
  email: string;
  resume_count: number;
  latest_resume: CandidateResume | null;
}

export const RecruiterCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'analyzed' | 'pending'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await apiClient.get('/ai/candidates/');
        if (res.data.status) {
          setCandidates(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Filter & search
  const filtered = candidates.filter(c => {
    const matchesSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.latest_resume?.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filterBy === 'analyzed') matchesFilter = c.latest_resume?.status === 'processed';
    if (filterBy === 'pending') matchesFilter = !c.latest_resume || c.latest_resume.status !== 'processed';

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Candidates" description="Loading candidates..." />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card-base p-6 h-20 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Candidates" description="View and manage candidates who have registered on the platform." />
        <EmptyState
          title="No Candidates Yet"
          description="No candidates have registered on the platform yet. Share your job postings to attract candidates."
        />
      </div>
    );
  }

  const analyzedCount = candidates.filter(c => c.latest_resume?.status === 'processed').length;
  const totalResumes = candidates.reduce((sum, c) => sum + c.resume_count, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Candidates" description="View and manage all candidates with their AI analysis data." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-base p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{candidates.length}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Total Candidates</p>
        </div>
        <div className="card-base p-4">
          <p className="text-2xl font-bold text-emerald-600">{analyzedCount}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Analyzed</p>
        </div>
        <div className="card-base p-4">
          <p className="text-2xl font-bold text-blue-600">{totalResumes}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Total Resumes</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-base pl-9 text-sm w-full"
          />
        </div>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as any)}
          className="input-base text-sm w-44"
        >
          <option value="all">All Candidates</option>
          <option value="analyzed">Analyzed</option>
          <option value="pending">Pending Analysis</option>
        </select>
      </div>

      {/* Candidate List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(candidate => {
            const r = candidate.latest_resume;
            const isAnalyzed = r?.status === 'processed';

            return (
              <div key={candidate.user_id} className="card-base overflow-hidden">
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === candidate.user_id ? null : candidate.user_id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {candidate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Score Ring (if analyzed) */}
                  {isAnalyzed && r?.match_score != null && (
                    <ProgressRing value={Math.round(r.match_score)} size={44} strokeWidth={3} />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{candidate.name}</p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                        isAnalyzed 
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                      }`}>
                        {isAnalyzed ? 'Analyzed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{candidate.email}</p>
                    {isAnalyzed && r?.skills && r.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.skills.slice(0, 5).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">{s}</span>
                        ))}
                        {r.skills.length > 5 && <span className="text-[10px] text-gray-400">+{r.skills.length - 5}</span>}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{candidate.resume_count} resume(s)</p>
                    {isAnalyzed && r?.experience && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{r.experience} yrs exp</p>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === candidate.user_id && r && isAnalyzed && (
                  <div className="border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900/30 space-y-3">
                    {r.summary && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <AutoAwesome style={{ fontSize: 14 }} /> AI Summary
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-zinc-300">{r.summary}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-800">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Work style={{ fontSize: 14 }} className="text-emerald-500" />
                          <span className="text-xs text-gray-500">Experience</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{r.experience || 'N/A'} years</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-800">
                        <div className="flex items-center gap-1.5 mb-1">
                          <School style={{ fontSize: 14 }} className="text-indigo-500" />
                          <span className="text-xs text-gray-500">Education</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.education || 'N/A'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-800">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Description style={{ fontSize: 14 }} className="text-blue-500" />
                          <span className="text-xs text-gray-500">Resume</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.file_name}</p>
                      </div>
                    </div>

                    {/* All Skills */}
                    {r.skills && r.skills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">All Skills ({r.skills.length})</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {r.skills.map((s, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800/40">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Matching Candidates"
          description="No candidates match your current search or filter."
        />
      )}
    </div>
  );
};

export default RecruiterCandidates;
