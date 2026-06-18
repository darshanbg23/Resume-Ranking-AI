import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import { Search, Delete, Work, LocationOn, AccessTime } from '@mui/icons-material';
import apiClient from '../../services/api';

interface JobItem {
  id: number;
  job_title: string;
  job_description: string;
  company_name: string;
  location: string;
  job_type: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string | null;
  posted_by: string;
}

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; job: JobItem | null }>({ show: false, job: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/admin/jobs/');
        if (res.data.status) setJobs(res.data.data || []);
      } catch (err) { console.error('Failed:', err); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.job) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/jobs/${deleteModal.job.id}/`);
      setJobs(prev => prev.filter(j => j.id !== deleteModal.job!.id));
      setDeleteModal({ show: false, job: null });
    } catch (err) { console.error('Failed:', err); }
    finally { setDeleting(false); }
  };

  const filtered = jobs.filter(j =>
    j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.posted_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Job Management" description="Monitor and manage all job openings across the platform." />

      <div className="grid grid-cols-3 gap-4">
        <div className="card-base p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p><p className="text-xs text-gray-500">Total Jobs</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-emerald-600">{jobs.filter(j => j.is_active).length}</p><p className="text-xs text-gray-500">Active</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-amber-600">{jobs.filter(j => !j.is_active).length}</p><p className="text-xs text-gray-500">Inactive</p></div>
      </div>

      <div className="relative">
        <Search style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by title, company, or poster..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-base pl-9 text-sm w-full" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card-base p-5 h-20 skeleton rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(job => (
            <div key={job.id} className="card-base p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Work style={{ fontSize: 20 }} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{job.job_title}</h3>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${job.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 capitalize">{job.job_type}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{job.job_description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      {job.company_name && <span>{job.company_name}</span>}
                      {job.location && <span className="flex items-center gap-0.5"><LocationOn style={{ fontSize: 12 }} />{job.location}</span>}
                      <span>Posted by: {job.posted_by}</span>
                      {job.created_at && (
                        <span className="flex items-center gap-0.5">
                          <AccessTime style={{ fontSize: 12 }} />
                          {new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.required_skills.slice(0, 6).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">{s}</span>
                        ))}
                        {job.required_skills.length > 6 && <span className="text-[10px] text-gray-400">+{job.required_skills.length - 6}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setDeleteModal({ show: true, job })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex-shrink-0" title="Delete">
                  <Delete style={{ fontSize: 16 }} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Jobs Found" description={searchTerm ? 'No jobs match your search.' : 'No jobs have been posted on the platform yet.'} />
      )}

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, job: null })} title="Delete Job" size="sm"
        footer={<><button onClick={() => setDeleteModal({ show: false, job: null })} className="btn-secondary">Cancel</button><button onClick={handleDelete} disabled={deleting} className="btn-danger disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete Job'}</button></>}
      >
        <p className="text-gray-600 dark:text-zinc-300">Are you sure you want to delete <strong>{deleteModal.job?.job_title}</strong>? This will also remove all AI match records for this job.</p>
      </Modal>
    </div>
  );
};

export default AdminJobs;
