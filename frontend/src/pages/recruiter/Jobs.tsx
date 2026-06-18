import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import SearchBar from '@components/SearchBar';
import Modal from '@components/Modal';
import { Work, Add, Delete, LocationOn, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  is_active?: boolean;
  created_at?: string | null;
  posted_by?: string;
}

export const RecruiterJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: Job | null }>({ show: false, job: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.get('/jobs/');
        const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.job) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/jobs/${deleteModal.job.id}/`);
      setJobs(prev => prev.filter(j => j.id !== deleteModal.job!.id));
      setDeleteModal({ show: false, job: null });
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.job_title.toLowerCase().includes(search.toLowerCase()) ||
    (j.company_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Listings"
        description="Manage your job postings and view applicant activity."
        action={
          <button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary">
            <Add style={{ fontSize: 18 }} /> Post a Job
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="card-base p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p><p className="text-xs text-gray-500">Total Jobs</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-emerald-600">{jobs.filter(j => j.is_active !== false).length}</p><p className="text-xs text-gray-500">Active</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-blue-600">{new Set(jobs.map(j => j.job_type)).size}</p><p className="text-xs text-gray-500">Job Types</p></div>
      </div>

      <SearchBar value={search} onSearch={setSearch} placeholder="Search your job postings..." />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card-base p-5 h-28 skeleton rounded-xl" />)}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {filteredJobs.map(job => (
            <div key={job.id} className="card-base p-5 card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Work style={{ fontSize: 20 }} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{job.job_title}</h3>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${job.is_active !== false ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                        {job.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                      {job.job_type && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 capitalize">{job.job_type}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mb-1.5">{job.job_description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {job.company_name && <span>{job.company_name}</span>}
                      {job.location && <span className="flex items-center gap-0.5"><LocationOn style={{ fontSize: 12 }} />{job.location}</span>}
                      {job.salary_min && job.salary_max && <span>₹{job.salary_min}-{job.salary_max} LPA</span>}
                      {job.created_at && (
                        <span className="flex items-center gap-0.5">
                          <AccessTime style={{ fontSize: 12 }} />
                          {new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.required_skills.slice(0, 5).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">{s}</span>
                        ))}
                        {job.required_skills.length > 5 && <span className="text-[10px] text-gray-400">+{job.required_skills.length - 5}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, job }); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex-shrink-0"
                  title="Delete Job"
                >
                  <Delete style={{ fontSize: 16 }} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Job Postings"
          description="Create your first job posting to start receiving candidate applications."
          action={
            <button onClick={() => navigate('/recruiter/jobs/create')} className="btn-primary">
              <Add style={{ fontSize: 18 }} /> Post a Job
            </button>
          }
        />
      )}

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, job: null })} title="Delete Job" size="sm"
        footer={<><button onClick={() => setDeleteModal({ show: false, job: null })} className="btn-secondary">Cancel</button><button onClick={handleDelete} disabled={deleting} className="btn-danger disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete Job'}</button></>}
      >
        <p className="text-gray-600 dark:text-zinc-300">Delete <strong>{deleteModal.job?.job_title}</strong>? This will remove the job and all associated AI match records.</p>
      </Modal>
    </div>
  );
};

export default RecruiterJobs;
