import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import {
  Search, Delete, Block, CheckCircle
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface UserItem {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  resume_count: number;
  jobs_posted: number;
  phone?: string;
  location?: string;
  company_name?: string;
  skills?: string[];
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  recruiter: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  candidate: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: UserItem | null }>({ show: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      const res = await apiClient.get(`/admin/users/?${params.toString()}`);
      if (res.data.status) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [searchTerm, roleFilter]);

  const handleToggleStatus = async (user: UserItem) => {
    try {
      await apiClient.put(`/admin/users/${user.id}/`, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${deleteModal.user.id}/`);
      setUsers(prev => prev.filter(u => u.id !== deleteModal.user!.id));
      setDeleteModal({ show: false, user: null });
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: users.length,
    candidates: users.filter(u => u.role === 'candidate').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage platform users, roles, and permissions." />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-base p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p><p className="text-xs text-gray-500">Total Users</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-emerald-600">{stats.candidates}</p><p className="text-xs text-gray-500">Candidates</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-blue-600">{stats.recruiters}</p><p className="text-xs text-gray-500">Recruiters</p></div>
        <div className="card-base p-4"><p className="text-2xl font-bold text-purple-600">{stats.admins}</p><p className="text-xs text-gray-500">Admins</p></div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-base pl-9 text-sm w-full" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-base text-sm w-44">
          <option value="all">All Roles</option>
          <option value="candidate">Candidates</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card-base p-5 h-16 skeleton rounded-xl" />)}</div>
      ) : users.length > 0 ? (
        <div className="card-base overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1 text-center">Resumes</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {users.map(user => (
            <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
              {/* User Info */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{(user.first_name || user.email).charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${ROLE_BADGE[user.role] || ROLE_BADGE.candidate}`}>
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Joined */}
              <div className="col-span-2 text-xs text-gray-500 hidden sm:block">
                {new Date(user.date_joined).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Resumes */}
              <div className="col-span-1 text-center text-sm font-medium text-gray-700 dark:text-zinc-300 hidden sm:block">
                {user.role === 'candidate' ? user.resume_count : user.jobs_posted}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}
                  title={user.is_active ? 'Deactivate' : 'Activate'}
                >
                  {user.is_active
                    ? <Block style={{ fontSize: 16 }} className="text-amber-500" />
                    : <CheckCircle style={{ fontSize: 16 }} className="text-emerald-500" />
                  }
                </button>
                <button
                  onClick={() => setDeleteModal({ show: true, user })}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  title="Delete User"
                >
                  <Delete style={{ fontSize: 16 }} className="text-red-400 hover:text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Users Found" description="No users match your current search or filter criteria." />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, user: null })}
        title="Delete User"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteModal({ show: false, user: null })} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-zinc-300">
            Are you sure you want to delete <strong>{deleteModal.user?.full_name}</strong>?
          </p>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">This will permanently delete:</p>
            <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-0.5 list-disc list-inside">
              <li>User account and profile</li>
              <li>All uploaded resumes and files</li>
              <li>All AI analysis records</li>
              {deleteModal.user?.role === 'recruiter' && <li>Jobs will be unlinked (not deleted)</li>}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
