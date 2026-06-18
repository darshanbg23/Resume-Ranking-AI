import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import { Search, Block, CheckCircle, Delete, Work, Business } from '@mui/icons-material';
import apiClient from '../../services/api';

interface RecruiterItem {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  jobs_posted: number;
  company_name?: string;
  designation?: string;
  phone?: string;
  location?: string;
}

export const AdminRecruiters: React.FC = () => {
  const [recruiters, setRecruiters] = useState<RecruiterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; recruiter: RecruiterItem | null }>({ show: false, recruiter: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const res = await apiClient.get('/admin/users/?role=recruiter');
        if (res.data.status) setRecruiters(res.data.data || []);
      } catch (err) { console.error('Failed to fetch recruiters:', err); }
      finally { setLoading(false); }
    };
    fetchRecruiters();
  }, []);

  const handleToggle = async (r: RecruiterItem) => {
    try {
      await apiClient.put(`/admin/users/${r.id}/`, { is_active: !r.is_active });
      setRecruiters(prev => prev.map(u => u.id === r.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) { console.error('Failed:', err); }
  };

  const handleDelete = async () => {
    if (!deleteModal.recruiter) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${deleteModal.recruiter.id}/`);
      setRecruiters(prev => prev.filter(u => u.id !== deleteModal.recruiter!.id));
      setDeleteModal({ show: false, recruiter: null });
    } catch (err) { console.error('Failed:', err); }
    finally { setDeleting(false); }
  };

  const filtered = recruiters.filter(r =>
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Recruiter Management" description="Manage and verify recruiter accounts." />

      <div className="grid grid-cols-3 gap-4">
        <div className="card-base p-4"><p className="text-2xl font-bold text-blue-600">{recruiters.length}</p><p className="text-xs text-gray-500">Total Recruiters</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-emerald-600">{recruiters.filter(r => r.is_active).length}</p><p className="text-xs text-gray-500">Active</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-amber-600">{recruiters.reduce((sum, r) => sum + r.jobs_posted, 0)}</p><p className="text-xs text-gray-500">Total Jobs Posted</p></div>
      </div>

      <div className="relative">
        <Search style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name, email, or company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-base pl-9 text-sm w-full" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card-base p-5 h-20 skeleton rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card-base p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{r.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.full_name}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${r.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {r.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{r.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {r.company_name && <span className="flex items-center gap-1"><Business style={{ fontSize: 12 }} /> {r.company_name}</span>}
                      <span className="flex items-center gap-1"><Work style={{ fontSize: 12 }} /> {r.jobs_posted} jobs</span>
                      <span>Joined {new Date(r.date_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={r.is_active ? 'Suspend' : 'Activate'}>
                    {r.is_active ? <Block style={{ fontSize: 16 }} className="text-amber-500" /> : <CheckCircle style={{ fontSize: 16 }} className="text-emerald-500" />}
                  </button>
                  <button onClick={() => setDeleteModal({ show: true, recruiter: r })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Delete">
                    <Delete style={{ fontSize: 16 }} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Recruiters Found" description={searchTerm ? 'No recruiters match your search.' : 'No recruiters have registered on the platform yet.'} />
      )}

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, recruiter: null })} title="Delete Recruiter" size="sm"
        footer={<><button onClick={() => setDeleteModal({ show: false, recruiter: null })} className="btn-secondary">Cancel</button><button onClick={handleDelete} disabled={deleting} className="btn-danger disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button></>}
      >
        <p className="text-gray-600 dark:text-zinc-300">Delete <strong>{deleteModal.recruiter?.full_name}</strong>? This will remove their account and unlink any jobs they posted.</p>
      </Modal>
    </div>
  );
};

export default AdminRecruiters;
