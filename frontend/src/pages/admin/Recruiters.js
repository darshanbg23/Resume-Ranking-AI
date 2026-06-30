import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import { Search, Block, CheckCircle, Delete, Work, Business } from '@mui/icons-material';
import apiClient from '../../services/api';
export const AdminRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, recruiter: null });
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const res = await apiClient.get('/admin/users/?role=recruiter');
                if (res.data.status)
                    setRecruiters(res.data.data || []);
            }
            catch (err) {
                console.error('Failed to fetch recruiters:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchRecruiters();
    }, []);
    const handleToggle = async (r) => {
        try {
            await apiClient.put(`/admin/users/${r.id}/`, { is_active: !r.is_active });
            setRecruiters(prev => prev.map(u => u.id === r.id ? { ...u, is_active: !u.is_active } : u));
        }
        catch (err) {
            console.error('Failed:', err);
        }
    };
    const handleDelete = async () => {
        if (!deleteModal.recruiter)
            return;
        setDeleting(true);
        try {
            await apiClient.delete(`/admin/users/${deleteModal.recruiter.id}/`);
            setRecruiters(prev => prev.filter(u => u.id !== deleteModal.recruiter.id));
            setDeleteModal({ show: false, recruiter: null });
        }
        catch (err) {
            console.error('Failed:', err);
        }
        finally {
            setDeleting(false);
        }
    };
    const filtered = recruiters.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Recruiter Management", description: "Manage and verify recruiter accounts." }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: recruiters.length }), _jsx("p", { className: "text-xs text-gray-500", children: "Total Recruiters" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-600", children: recruiters.filter(r => r.is_active).length }), _jsx("p", { className: "text-xs text-gray-500", children: "Active" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-amber-600", children: recruiters.reduce((sum, r) => sum + r.jobs_posted, 0) }), _jsx("p", { className: "text-xs text-gray-500", children: "Total Jobs Posted" })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by name, email, or company...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "input-base pl-9 text-sm w-full" })] }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-5 h-20 skeleton rounded-xl" }, i)) })) : filtered.length > 0 ? (_jsx("div", { className: "space-y-3", children: filtered.map(r => (_jsx("div", { className: "card-base p-4", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-sm font-bold", children: r.full_name.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: r.full_name }), _jsxs("span", { className: `inline-flex items-center gap-1 text-[10px] font-medium ${r.is_active ? 'text-emerald-600' : 'text-red-500'}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-red-500'}` }), r.is_active ? 'Active' : 'Suspended'] })] }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: r.email }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-gray-400", children: [r.company_name && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Business, { style: { fontSize: 12 } }), " ", r.company_name] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Work, { style: { fontSize: 12 } }), " ", r.jobs_posted, " jobs"] }), _jsxs("span", { children: ["Joined ", new Date(r.date_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })] })] })] })] }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsx("button", { onClick: () => handleToggle(r), className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors", title: r.is_active ? 'Suspend' : 'Activate', children: r.is_active ? _jsx(Block, { style: { fontSize: 16 }, className: "text-amber-500" }) : _jsx(CheckCircle, { style: { fontSize: 16 }, className: "text-emerald-500" }) }), _jsx("button", { onClick: () => setDeleteModal({ show: true, recruiter: r }), className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors", title: "Delete", children: _jsx(Delete, { style: { fontSize: 16 }, className: "text-red-400" }) })] })] }) }, r.id))) })) : (_jsx(EmptyState, { title: "No Recruiters Found", description: searchTerm ? 'No recruiters match your search.' : 'No recruiters have registered on the platform yet.' })), _jsx(Modal, { isOpen: deleteModal.show, onClose: () => setDeleteModal({ show: false, recruiter: null }), title: "Delete Recruiter", size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setDeleteModal({ show: false, recruiter: null }), className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "btn-danger disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete' })] }), children: _jsxs("p", { className: "text-gray-600 dark:text-zinc-300", children: ["Delete ", _jsx("strong", { children: deleteModal.recruiter?.full_name }), "? This will remove their account and unlink any jobs they posted."] }) })] }));
};
export default AdminRecruiters;
