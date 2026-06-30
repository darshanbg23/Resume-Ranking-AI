import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import SearchBar from '@components/SearchBar';
import Modal from '@components/Modal';
import { Work, Add, Delete, LocationOn, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
export const RecruiterJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, job: null });
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await apiClient.get('/jobs/my/');
                const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setJobs(data);
            }
            catch (err) {
                console.error('Failed to fetch jobs:', err);
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
            await apiClient.delete(`/jobs/${deleteModal.job.id}/`);
            setJobs(prev => prev.filter(j => j.id !== deleteModal.job.id));
            setDeleteModal({ show: false, job: null });
        }
        catch (err) {
            console.error('Failed to delete job:', err);
        }
        finally {
            setDeleting(false);
        }
    };
    const filteredJobs = jobs.filter(j => j.job_title.toLowerCase().includes(search.toLowerCase()) ||
        (j.company_name || '').toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Job Listings", description: "Manage your job postings and view applicant activity.", action: _jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary", children: [_jsx(Add, { style: { fontSize: 18 } }), " Post a Job"] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: jobs.length }), _jsx("p", { className: "text-xs text-gray-500", children: "Total Jobs" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-600", children: jobs.filter(j => j.is_active !== false).length }), _jsx("p", { className: "text-xs text-gray-500", children: "Active" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: new Set(jobs.map(j => j.job_type)).size }), _jsx("p", { className: "text-xs text-gray-500", children: "Job Types" })] })] }), _jsx(SearchBar, { value: search, onSearch: setSearch, placeholder: "Search your job postings..." }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-5 h-28 skeleton rounded-xl" }, i)) })) : filteredJobs.length > 0 ? (_jsx("div", { className: "space-y-3 stagger-children", children: filteredJobs.map(job => (_jsx("div", { className: "card-base p-5 card-hover", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0 flex-1", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0", children: _jsx(Work, { style: { fontSize: 20 }, className: "text-blue-600 dark:text-blue-400" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [_jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: job.job_title }), _jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-medium rounded-full ${job.is_active !== false ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`, children: job.is_active !== false ? 'Active' : 'Inactive' }), job.job_type && (_jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 capitalize", children: job.job_type }))] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mb-1.5", children: job.job_description }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-400", children: [job.company_name && _jsx("span", { children: job.company_name }), job.location && _jsxs("span", { className: "flex items-center gap-0.5", children: [_jsx(LocationOn, { style: { fontSize: 12 } }), job.location] }), job.salary_min && job.salary_max && _jsxs("span", { children: ["\u20B9", job.salary_min, "-", job.salary_max, " LPA"] }), job.created_at && (_jsxs("span", { className: "flex items-center gap-0.5", children: [_jsx(AccessTime, { style: { fontSize: 12 } }), new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })] }))] }), job.required_skills && job.required_skills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [job.required_skills.slice(0, 5).map((s, i) => (_jsx("span", { className: "px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded", children: s }, i))), job.required_skills.length > 5 && _jsxs("span", { className: "text-[10px] text-gray-400", children: ["+", job.required_skills.length - 5] })] }))] })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); setDeleteModal({ show: true, job }); }, className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex-shrink-0", title: "Delete Job", children: _jsx(Delete, { style: { fontSize: 16 }, className: "text-red-400" }) })] }) }, job.id))) })) : (_jsx(EmptyState, { title: "No Job Postings", description: "Create your first job posting to start receiving candidate applications.", action: _jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary", children: [_jsx(Add, { style: { fontSize: 18 } }), " Post a Job"] }) })), _jsx(Modal, { isOpen: deleteModal.show, onClose: () => setDeleteModal({ show: false, job: null }), title: "Delete Job", size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setDeleteModal({ show: false, job: null }), className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "btn-danger disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete Job' })] }), children: _jsxs("p", { className: "text-gray-600 dark:text-zinc-300", children: ["Delete ", _jsx("strong", { children: deleteModal.job?.job_title }), "? This will remove the job and all associated AI match records."] }) })] }));
};
export default RecruiterJobs;
