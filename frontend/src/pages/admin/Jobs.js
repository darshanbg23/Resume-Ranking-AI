import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import Modal from '@components/Modal';
import { Search, Delete, Work, LocationOn, AccessTime } from '@mui/icons-material';
import apiClient from '../../services/api';
export const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await apiClient.get('/admin/jobs/');
                if (res.data.status)
                    setJobs(res.data.data || []);
            }
            catch (err) {
                console.error('Failed:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);
    const handleDelete = async () => {
        if (!deleteModal.job)
            return;
        setDeleting(true);
        try {
            await apiClient.delete(`/admin/jobs/${deleteModal.job.id}/`);
            setJobs(prev => prev.filter(j => j.id !== deleteModal.job.id));
            setDeleteModal({ show: false, job: null });
        }
        catch (err) {
            console.error('Failed:', err);
        }
        finally {
            setDeleting(false);
        }
    };
    const filtered = jobs.filter(j => j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.posted_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Job Management", description: "Monitor and manage all job openings across the platform." }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: jobs.length }), _jsx("p", { className: "text-xs text-gray-500", children: "Total Jobs" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-600", children: jobs.filter(j => j.is_active).length }), _jsx("p", { className: "text-xs text-gray-500", children: "Active" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-amber-600", children: jobs.filter(j => !j.is_active).length }), _jsx("p", { className: "text-xs text-gray-500", children: "Inactive" })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by title, company, or poster...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "input-base pl-9 text-sm w-full" })] }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-5 h-20 skeleton rounded-xl" }, i)) })) : filtered.length > 0 ? (_jsx("div", { className: "space-y-3", children: filtered.map(job => (_jsx("div", { className: "card-base p-4", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0", children: _jsx(Work, { style: { fontSize: 20 }, className: "text-blue-600 dark:text-blue-400" }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [_jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: job.job_title }), _jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-medium rounded-full ${job.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`, children: job.is_active ? 'Active' : 'Inactive' }), _jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 capitalize", children: job.job_type })] }), _jsx("p", { className: "text-xs text-gray-500 line-clamp-1", children: job.job_description }), _jsxs("div", { className: "flex items-center gap-3 mt-1.5 text-xs text-gray-400", children: [job.company_name && _jsx("span", { children: job.company_name }), job.location && _jsxs("span", { className: "flex items-center gap-0.5", children: [_jsx(LocationOn, { style: { fontSize: 12 } }), job.location] }), _jsxs("span", { children: ["Posted by: ", job.posted_by] }), job.created_at && (_jsxs("span", { className: "flex items-center gap-0.5", children: [_jsx(AccessTime, { style: { fontSize: 12 } }), new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })] }))] }), job.required_skills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [job.required_skills.slice(0, 6).map((s, i) => (_jsx("span", { className: "px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded", children: s }, i))), job.required_skills.length > 6 && _jsxs("span", { className: "text-[10px] text-gray-400", children: ["+", job.required_skills.length - 6] })] }))] })] }), _jsx("button", { onClick: () => setDeleteModal({ show: true, job }), className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex-shrink-0", title: "Delete", children: _jsx(Delete, { style: { fontSize: 16 }, className: "text-red-400" }) })] }) }, job.id))) })) : (_jsx(EmptyState, { title: "No Jobs Found", description: searchTerm ? 'No jobs match your search.' : 'No jobs have been posted on the platform yet.' })), _jsx(Modal, { isOpen: deleteModal.show, onClose: () => setDeleteModal({ show: false, job: null }), title: "Delete Job", size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setDeleteModal({ show: false, job: null }), className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "btn-danger disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete Job' })] }), children: _jsxs("p", { className: "text-gray-600 dark:text-zinc-300", children: ["Are you sure you want to delete ", _jsx("strong", { children: deleteModal.job?.job_title }), "? This will also remove all AI match records for this job."] }) })] }));
};
export default AdminJobs;
