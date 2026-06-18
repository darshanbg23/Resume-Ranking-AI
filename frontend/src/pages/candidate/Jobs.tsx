import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import SearchBar from '@components/SearchBar';
import {
  Work, LocationOn, AutoAwesome, Star,
  ArrowForward, Close, Check, Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { JobDetailsModal } from './JobDetailsModal';

interface Job {
  id: number;
  job_title: string;
  job_description: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  required_skills?: string[];
  salary_min?: string | null;
  salary_max?: string | null;
  has_applied?: boolean;
}

interface JobRecommendation extends Job {
  job_id: number;
  overall_score: number;
  semantic_score: number;
  keyword_score: number;
  tier: string;
  tier_label: string;
  skills_matched: string[];
  skills_missing: string[];
  match_reason: string;
}

const TIER_COLORS: Record<string, string> = {
  excellent: 'from-emerald-500 to-green-600 text-white',
  good: 'from-blue-500 to-indigo-600 text-white',
  average: 'from-amber-500 to-orange-600 text-white',
  poor: 'from-gray-400 to-gray-500 text-white',
};

export const CandidateJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [search, setSearch] = useState('');

  // Modals & Application state
  const [resumes, setResumes] = useState<any[]>([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<Job | JobRecommendation | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch all jobs
      try {
        const response = await apiClient.get('/jobs/');
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else if (response.data.data) {
          setJobs(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }

      // Fetch AI recommendations & resumes
      try {
        const resumesRes = await apiClient.get('/resumes/');
        const fetchedResumes = resumesRes.data.data || resumesRes.data || [];
        const processedResumes = fetchedResumes.filter((r: any) => r.status === 'processed');
        setResumes(processedResumes);
        if (processedResumes.length > 0) {
            setSelectedResumeId(processedResumes[0].id);
        }

        const analyzedResume = processedResumes[0];

        if (analyzedResume) {
          const recsRes = await apiClient.get(`/ai/recommended-jobs/${analyzedResume.id}/`);
          if (recsRes.data.status && recsRes.data.data?.recommendations) {
            setRecommendations(recsRes.data.data.recommendations);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchAll();
  }, []);

  const filteredJobs = jobs.filter(j =>
    j.job_title.toLowerCase().includes(search.toLowerCase()) ||
    j.job_description.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async () => {
    if (!selectedJob || !selectedResumeId) return;
    setApplying(true);
    setApplyError('');
    try {
      const jobId = 'job_id' in selectedJob ? selectedJob.job_id : selectedJob.id;
      const res = await apiClient.post('/applications/', {
        job_id: jobId,
        resume_id: selectedResumeId,
      });
      if (res.data.status) {
        setApplySuccess('Application submitted successfully!');
        // Update has_applied flag in state
        setJobs(jobs.map(j => j.id === jobId ? { ...j, has_applied: true } : j));
        setRecommendations(recommendations.map(r => r.job_id === jobId ? { ...r, has_applied: true } : r));
        setTimeout(() => {
          setApplyModalOpen(false);
          setApplySuccess('');
        }, 1500);
      } else {
        setApplyError(res.data.message || 'Failed to apply.');
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setApplying(false);
    }
  };

  const openDetails = (job: Job | JobRecommendation) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const openApply = (job: Job | JobRecommendation) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Browse Jobs" description="Explore job opportunities and find your perfect match." />

      {/* AI Recommendations Section */}
      {!loadingRecs && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AutoAwesome style={{ fontSize: 24 }} className="text-blue-500" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Recommended for You</h2>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-bold rounded-full">AI-Matched</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.slice(0, 4).map(rec => (
              <div key={rec.job_id} className="card-base flex flex-col overflow-hidden border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-all">
                {/* Header Match Score */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 px-6 py-4 border-b border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_COLORS[rec.tier] || TIER_COLORS.poor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-base font-black">{Math.round(rec.overall_score)}%</span>
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${TIER_COLORS[rec.tier]}`}>
                        {rec.tier_label} Match
                      </p>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
                        <Star style={{ fontSize: 12 }} className="text-amber-500" /> {rec.match_reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{rec.job_title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium">
                    {rec.company_name && <span className="flex items-center gap-1"><Business style={{ fontSize: 14 }} /> {rec.company_name}</span>}
                    {rec.location && <span className="flex items-center gap-1"><LocationOn style={{ fontSize: 14 }} />{rec.location}</span>}
                    {rec.job_type && <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded">{rec.job_type}</span>}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-4">
                    {rec.job_description}
                  </p>

                  {/* Skills Preview */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Top Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.required_skills?.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-1 text-[11px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-md font-medium">{s}</span>
                      ))}
                      {rec.required_skills && rec.required_skills.length > 4 && (
                         <span className="px-2 py-1 text-[11px] bg-gray-50 dark:bg-zinc-900 text-gray-500 rounded-md">+{rec.required_skills.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (Pushed to bottom) */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
                    <button 
                      onClick={() => openDetails(rec)} 
                      className="btn-secondary flex-1 py-2 text-sm justify-center"
                    >
                      View Details
                    </button>
                    {rec.has_applied ? (
                      <button disabled className="btn-secondary flex-1 py-2 text-sm justify-center opacity-75 cursor-not-allowed">
                        <Check style={{ fontSize: 16, marginRight: '4px' }} /> Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => openApply(rec)} 
                        className="btn-primary flex-1 py-2 text-sm justify-center"
                      >
                        Apply Now <ArrowForward style={{ fontSize: 16, marginLeft: '4px' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingRecs && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AutoAwesome style={{ fontSize: 24 }} className="text-blue-500 animate-pulse" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Finding matches...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => <div key={i} className="card-base p-6 h-[300px] skeleton rounded-2xl" />)}
          </div>
        </div>
      )}

      {/* All Jobs Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">All Opportunities</h2>
        <SearchBar value={search} onSearch={setSearch} placeholder="Search jobs by title, skills, or company..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card-base p-6 h-[260px] skeleton rounded-2xl" />)}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filteredJobs.map(job => (
            <div key={job.id} className="card-base flex flex-col p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-zinc-700">
                  <Work style={{ fontSize: 24 }} className="text-gray-500 dark:text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={job.job_title}>{job.job_title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                    {job.company_name && <span className="truncate max-w-[100px]">{job.company_name}</span>}
                    {job.location && <span className="flex items-center gap-0.5 truncate max-w-[100px]"><LocationOn style={{ fontSize: 12 }} />{job.location}</span>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                 {job.job_type && <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">{job.job_type}</span>}
                 <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{job.job_description}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded border border-gray-200 dark:border-zinc-700">{s}</span>
                    ))}
                    {job.required_skills.length > 3 && <span className="text-[10px] text-gray-400 font-medium">+{job.required_skills.length - 3}</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons (Pushed to bottom using mt-auto) */}
              <div className="mt-auto pt-4 flex gap-2 w-full">
                <button 
                  onClick={() => openDetails(job)} 
                  className="btn-secondary flex-1 py-2 text-xs justify-center"
                >
                  Details
                </button>
                {job.has_applied ? (
                  <button disabled className="btn-secondary flex-1 py-2 text-xs justify-center opacity-75 cursor-not-allowed">
                    <Check style={{ fontSize: 14, marginRight: '4px' }} /> Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => openApply(job)} 
                    className="btn-primary flex-1 py-2 text-xs justify-center"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search ? 'No Jobs Found' : 'No Jobs Available'}
          description={search ? 'Try adjusting your search terms.' : 'No job listings are available right now. Check back later.'}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          isOpen={detailsModalOpen} 
          onClose={() => setDetailsModalOpen(false)} 
          onApply={(job) => {
             setDetailsModalOpen(false);
             openApply(job);
          }}
        />
      )}

      {/* Apply Confirmation Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Apply for Job</h3>
              <button onClick={() => { setApplyModalOpen(false); setApplyError(''); setApplySuccess(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500">
                <Close style={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                <p className="text-base font-bold text-gray-900 dark:text-white mb-1">{selectedJob.job_title}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {selectedJob.company_name && <span className="flex items-center gap-1"><Business style={{fontSize: 14}}/> {selectedJob.company_name}</span>}
                  {selectedJob.location && <span className="flex items-center gap-1"><LocationOn style={{fontSize: 14}}/> {selectedJob.location}</span>}
                </div>
              </div>

              {applyError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-sm font-medium text-red-700 dark:text-red-400">
                  {applyError}
                </div>
              )}

              {applySuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {applySuccess}
                </div>
              )}

              {resumes.length > 0 ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Select Resume to Submit
                  </label>
                  <select
                    value={selectedResumeId || ''}
                    onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                    className="input-base text-sm w-full font-medium"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.file_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-3">
                    You need an analyzed resume to apply for this job.
                  </p>
                  <button onClick={() => navigate('/candidate/resume')} className="btn-secondary text-xs w-full justify-center">
                    Upload Resume Now
                  </button>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-zinc-800 flex gap-3 bg-gray-50 dark:bg-zinc-900/50">
              <button onClick={() => { setApplyModalOpen(false); setApplyError(''); setApplySuccess(''); }} className="btn-secondary flex-1 py-2.5 justify-center font-bold">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || resumes.length === 0}
                className="btn-primary flex-1 py-2.5 justify-center font-bold shadow-md"
              >
                {applying ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
