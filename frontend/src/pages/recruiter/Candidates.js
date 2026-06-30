import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import { Search, Work, School, Description, AutoAwesome } from '@mui/icons-material';
import apiClient from '../../services/api';
export const RecruiterCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await apiClient.get('/ai/candidates/');
                if (res.data.status) {
                    setCandidates(res.data.data || []);
                }
            }
            catch (err) {
                console.error('Failed to fetch candidates:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);
    // Filter & search
    const filtered = candidates.filter(c => {
        const matchesSearch = !searchTerm ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.latest_resume?.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        let matchesFilter = true;
        if (filterBy === 'analyzed')
            matchesFilter = c.latest_resume?.status === 'processed';
        if (filterBy === 'pending')
            matchesFilter = !c.latest_resume || c.latest_resume.status !== 'processed';
        return matchesSearch && matchesFilter;
    });
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidates", description: "Loading candidates..." }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-6 h-20 skeleton rounded-xl" }, i)) })] }));
    }
    if (candidates.length === 0) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidates", description: "View and manage candidates who have registered on the platform." }), _jsx(EmptyState, { title: "No Candidates Yet", description: "No candidates have registered on the platform yet. Share your job postings to attract candidates." })] }));
    }
    const analyzedCount = candidates.filter(c => c.latest_resume?.status === 'processed').length;
    const totalResumes = candidates.reduce((sum, c) => sum + c.resume_count, 0);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidates", description: "View and manage all candidates with their AI analysis data." }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: candidates.length }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: "Total Candidates" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-600", children: analyzedCount }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: "Analyzed" })] }), _jsxs("div", { className: "card-base p-4", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: totalResumes }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: "Total Resumes" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by name, email, or skill...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-base pl-9 text-sm w-full" })] }), _jsxs("select", { value: filterBy, onChange: (e) => setFilterBy(e.target.value), className: "input-base text-sm w-44", children: [_jsx("option", { value: "all", children: "All Candidates" }), _jsx("option", { value: "analyzed", children: "Analyzed" }), _jsx("option", { value: "pending", children: "Pending Analysis" })] })] }), filtered.length > 0 ? (_jsx("div", { className: "space-y-3", children: filtered.map(candidate => {
                    const r = candidate.latest_resume;
                    const isAnalyzed = r?.status === 'processed';
                    return (_jsxs("div", { className: "card-base overflow-hidden", children: [_jsxs("div", { className: "p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors", onClick: () => setExpandedId(expandedId === candidate.user_id ? null : candidate.user_id), children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-white text-sm font-bold", children: candidate.name.charAt(0).toUpperCase() }) }), isAnalyzed && r?.match_score != null && (_jsx(ProgressRing, { value: Math.round(r.match_score), size: 44, strokeWidth: 3 })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [_jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: candidate.name }), _jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${isAnalyzed
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`, children: isAnalyzed ? 'Analyzed' : 'Pending' })] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: candidate.email }), isAnalyzed && r?.skills && r.skills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-1.5", children: [r.skills.slice(0, 5).map((s, i) => (_jsx("span", { className: "px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded", children: s }, i))), r.skills.length > 5 && _jsxs("span", { className: "text-[10px] text-gray-400", children: ["+", r.skills.length - 5] })] }))] }), _jsxs("div", { className: "text-right hidden sm:block", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: [candidate.resume_count, " resume(s)"] }), isAnalyzed && r?.experience && (_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: [r.experience, " yrs exp"] }))] })] }), expandedId === candidate.user_id && r && isAnalyzed && (_jsxs("div", { className: "border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900/30 space-y-3", children: [r.summary && (_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1", children: [_jsx(AutoAwesome, { style: { fontSize: 14 } }), " AI Summary"] }), _jsx("p", { className: "text-sm text-gray-700 dark:text-zinc-300", children: r.summary })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [_jsx(Work, { style: { fontSize: 14 }, className: "text-emerald-500" }), _jsx("span", { className: "text-xs text-gray-500", children: "Experience" })] }), _jsxs("p", { className: "text-sm font-bold text-gray-900 dark:text-white", children: [r.experience || 'N/A', " years"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [_jsx(School, { style: { fontSize: 14 }, className: "text-indigo-500" }), _jsx("span", { className: "text-xs text-gray-500", children: "Education" })] }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: r.education || 'N/A' })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [_jsx(Description, { style: { fontSize: 14 }, className: "text-blue-500" }), _jsx("span", { className: "text-xs text-gray-500", children: "Resume" })] }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: r.file_name })] })] }), r.skills && r.skills.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-gray-500 uppercase mb-1.5", children: ["All Skills (", r.skills.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: r.skills.map((s, i) => (_jsx("span", { className: "px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800/40", children: s }, i))) })] }))] }))] }, candidate.user_id));
                }) })) : (_jsx(EmptyState, { title: "No Matching Candidates", description: "No candidates match your current search or filter." }))] }));
};
export default RecruiterCandidates;
