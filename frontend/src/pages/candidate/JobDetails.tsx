import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Work, ArrowBack, LocationOn, Business, AttachMoney,
  Schedule, Send, CheckCircle, Code, Person
} from '@mui/icons-material';
import apiClient from '../../services/api';

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
  experience_required?: string;
  has_applied?: boolean;
  applicant_count?: number;
  posted_by?: string;
  created_at?: string;
}

interface ResumeOption {
  id: number;
  file_name: string;
  status: string;
  skills_extracted: string[];
}

export const CandidateJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobRes = await apiClient.get(`/jobs/${id}/`);
        const jobData = jobRes.data.data || jobRes.data;
        setJob(jobData);
        setApplied(jobData.has_applied || false);

        // Fetch user's analyzed resumes for apply dropdown
        const resumeRes = await apiClient.get('/resumes/');
        const allResumes = resumeRes.data.data || [];
        const analyzed = allResumes.filter((r: any) => r.status === 'processed');
        setResumes(analyzed);
        if (analyzed.length > 0) {
          setSelectedResumeId(analyzed[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume to apply with.');
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const res = await apiClient.post('/applications/', {
        job_id: Number(id),
        resume_id: selectedResumeId,
      });
      if (res.data.status) {
        setApplied(true);
        setSuccess('Application submitted successfully! The recruiter has been notified.');
      } else {
        setError(res.data.message || 'Failed to apply');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="card-base p-6 space-y-4">
          <div className="h-6 w-2/3 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-4/5 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/candidate/jobs')} className="btn-ghost text-sm">
          <ArrowBack style={{ fontSize: 18 }} /> Back to Jobs
        </button>
        <div className="card-base p-8 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">Job Not Found</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">This job listing may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate('/candidate/jobs')} className="btn-ghost text-sm">
        <ArrowBack style={{ fontSize: 18 }} /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="card-base p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Work style={{ fontSize: 28 }} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{job.job_title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-zinc-400">
                  {job.company_name && (
                    <span className="flex items-center gap-1">
                      <Business style={{ fontSize: 16 }} /> {job.company_name}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <LocationOn style={{ fontSize: 16 }} /> {job.location}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full capitalize">
                      {job.job_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {job.salary_min && job.salary_max && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111]">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                    <AttachMoney style={{ fontSize: 14 }} /> Salary Range
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{Number(job.salary_min).toLocaleString()} — ₹{Number(job.salary_max).toLocaleString()}
                  </p>
                </div>
              )}
              {job.experience_required && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111]">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                    <Schedule style={{ fontSize: 14 }} /> Experience
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.experience_required}</p>
                </div>
              )}
              {job.posted_by && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111]">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                    <Person style={{ fontSize: 14 }} /> Posted By
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.posted_by}</p>
                </div>
              )}
            </div>

            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                  <Code style={{ fontSize: 14 }} /> Required Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="section-header text-base mb-3">Job Description</h3>
              <div className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {job.job_description}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — Apply */}
        <div className="space-y-4">
          <div className="card-base p-6 sticky top-20">
            {applied ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle style={{ fontSize: 28 }} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Application Submitted</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  You've already applied for this position. Track your application in My Applications.
                </p>
                <button
                  onClick={() => navigate('/candidate/applications')}
                  className="btn-secondary text-sm mt-4 w-full justify-center"
                >
                  View My Applications
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Apply for this Job</h3>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
                  </div>
                )}

                {resumes.length > 0 ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Select Resume
                    </label>
                    <select
                      value={selectedResumeId || ''}
                      onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                      className="input-base text-sm mb-4"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>{r.file_name}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                      You need an analyzed resume to apply.
                    </p>
                    <button
                      onClick={() => navigate('/candidate/resume')}
                      className="btn-secondary text-xs w-full justify-center"
                    >
                      Upload Resume First
                    </button>
                  </div>
                )}

                <button
                  onClick={handleApply}
                  disabled={applying || resumes.length === 0}
                  className="btn-primary w-full justify-center mt-2"
                >
                  <Send style={{ fontSize: 18 }} />
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </>
            )}
          </div>

          {/* Job Meta */}
          {job.created_at && (
            <div className="card-base p-4">
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Posted {new Date(job.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              {job.applicant_count !== undefined && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateJobDetails;
