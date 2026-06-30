import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import { Search, Delete, Block, CheckCircle } from '@mui/icons-material';
import apiClient from '../../services/api';
const ROLE_BADGE = {
    admin: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    recruiter: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    candidate: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
};
export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [deleting, setDeleting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };
    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm)
                params.append('search', searchTerm);
            if (roleFilter !== 'all')
                params.append('role', roleFilter);
            const res = await apiClient.get(`/admin/users/?${params.toString()}`);
            if (res.data.status) {
                setUsers(res.data.data || []);
            }
        }
        catch (err) {
            console.error('Failed to fetch users:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchUsers(); }, [searchTerm, roleFilter]);
    const handleToggleStatus = async (user) => {
        try {
            await apiClient.put(`/admin/users/${user.id}/`, { is_active: !user.is_active });
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
            showFeedback('success', `${user.full_name} has been ${user.is_active ? 'blocked' : 'activated'} successfully.`);
        }
        catch (err) {
            console.error('Failed to update user:', err);
            showFeedback('error', 'Failed to update user status. Please try again.');
        }
    };
    const handleDelete = async () => {
        if (!deleteModal.user)
            return;
        const userName = deleteModal.user.full_name;
        setDeleting(true);
        try {
            await apiClient.delete(`/admin/users/${deleteModal.user.id}/`);
            setUsers(prev => prev.filter(u => u.id !== deleteModal.user.id));
            setDeleteModal({ show: false, user: null });
            showFeedback('success', `${userName} has been permanently deleted.`);
        }
        catch (err) {
            console.error('Failed to delete user:', err);
            showFeedback('error', 'Failed to delete user. Please try again.');
        }
        finally {
            setDeleting(false);
        }
    };
    const stats = {
        total: users.length,
        candidates: users.filter(u => u.role === 'candidate').length,
        recruiters: users.filter(u => u.role === 'recruiter').length,
        admins: users.filter(u => u.role === 'admin').length,
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "User Management", description: "Manage platform users, roles, and permissions." }), feedback && (_jsxs("div", { className: `animate-fadeInDown px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30'}`, children: [_jsx("span", { children: feedback.message }), _jsx("button", { onClick: () => setFeedback(null), className: "text-current opacity-60 hover:opacity-100 ml-3", children: "\u00D7" })] })), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [_jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats.total }), _jsx("p", { className: "text-xs text-gray-500", children: "Total Users" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-600", children: stats.candidates }), _jsx("p", { className: "text-xs text-gray-500", children: "Candidates" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.recruiters }), _jsx("p", { className: "text-xs text-gray-500", children: "Recruiters" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-purple-600", children: stats.admins }), _jsx("p", { className: "text-xs text-gray-500", children: "Admins" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by name or email...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "input-base pl-9 text-sm w-full" })] }), _jsxs("select", { value: roleFilter, onChange: e => setRoleFilter(e.target.value), className: "input-base text-sm w-44", children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "candidate", children: "Candidates" }), _jsx("option", { value: "recruiter", children: "Recruiters" }), _jsx("option", { value: "admin", children: "Admins" })] })] }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-5 h-16 skeleton rounded-xl" }, i)) })) : users.length > 0 ? (_jsxs("div", { className: "card-base overflow-hidden", children: [_jsxs("div", { className: "hidden sm:grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 uppercase", children: [_jsx("div", { className: "col-span-3", children: "User" }), _jsx("div", { className: "col-span-2", children: "Role" }), _jsx("div", { className: "col-span-2", children: "Status" }), _jsx("div", { className: "col-span-2", children: "Joined" }), _jsx("div", { className: "col-span-1 text-center", children: "Resumes" }), _jsx("div", { className: "col-span-2 text-right", children: "Actions" })] }), users.map(user => (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors", children: [_jsx("div", { className: "col-span-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-xs font-bold", children: (user.first_name || user.email).charAt(0).toUpperCase() }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: user.full_name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user.email })] })] }) }), _jsx("div", { className: "col-span-2", children: _jsx("span", { className: `px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${ROLE_BADGE[user.role] || ROLE_BADGE.candidate}`, children: user.role }) }), _jsx("div", { className: "col-span-2", children: _jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-medium ${user.is_active ? 'text-emerald-600' : 'text-red-500'}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}` }), user.is_active ? 'Active' : 'Inactive'] }) }), _jsx("div", { className: "col-span-2 text-xs text-gray-500 hidden sm:block", children: new Date(user.date_joined).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) }), _jsx("div", { className: "col-span-1 text-center text-sm font-medium text-gray-700 dark:text-zinc-300 hidden sm:block", children: user.role === 'candidate' ? user.resume_count : user.jobs_posted }), _jsxs("div", { className: "col-span-2 flex items-center justify-end gap-1", children: [_jsx("button", { onClick: () => handleToggleStatus(user), className: `p-1.5 rounded-lg transition-colors ${user.is_active ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`, title: user.is_active ? 'Deactivate' : 'Activate', children: user.is_active
                                            ? _jsx(Block, { style: { fontSize: 16 }, className: "text-amber-500" })
                                            : _jsx(CheckCircle, { style: { fontSize: 16 }, className: "text-emerald-500" }) }), _jsx("button", { onClick: () => setDeleteModal({ show: true, user }), className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors", title: "Delete User", children: _jsx(Delete, { style: { fontSize: 16 }, className: "text-red-400 hover:text-red-600" }) })] })] }, user.id)))] })) : (_jsx(EmptyState, { title: "No Users Found", description: "No users match your current search or filter criteria." })), _jsx(Modal, { isOpen: deleteModal.show, onClose: () => setDeleteModal({ show: false, user: null }), title: "Delete User", size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setDeleteModal({ show: false, user: null }), className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "btn-danger disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete User' })] }), children: _jsxs("div", { className: "space-y-3", children: [_jsxs("p", { className: "text-gray-600 dark:text-zinc-300", children: ["Are you sure you want to delete ", _jsx("strong", { children: deleteModal.user?.full_name }), "?"] }), _jsxs("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30", children: [_jsx("p", { className: "text-xs text-red-700 dark:text-red-400 font-medium", children: "This will permanently delete:" }), _jsxs("ul", { className: "text-xs text-red-600 dark:text-red-400 mt-1 space-y-0.5 list-disc list-inside", children: [_jsx("li", { children: "User account and profile" }), _jsx("li", { children: "All uploaded resumes and files" }), _jsx("li", { children: "All AI analysis records" }), deleteModal.user?.role === 'recruiter' && _jsx("li", { children: "Jobs will be unlinked (not deleted)" })] })] })] }) })] }));
};
export default AdminUsers;
