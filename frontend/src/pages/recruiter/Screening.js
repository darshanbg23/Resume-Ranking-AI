import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import { Search, Refresh, CheckCircle, Cancel, AutoAwesome, ThumbUp, ThumbDown, Star, EventNote, } from '@mui/icons-material';
import apiClient from '../../services/api';
const TIER_COLORS = {
    excellent: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    good: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    average: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    poor: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};
export const RecruiterScreening = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [screeningLoading, setScreeningLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await apiClient.get('/jobs/my/');
                const jobData = res.data?.data || res.data || [];
                setJobs(Array.isArray(jobData) ? jobData : []);
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
    const handleScreenJob = async (jobId) => {
        setScreeningLoading(true);
        setCandidates([]);
        setApplicants([]);
        try {
            const [rankRes, appRes] = await Promise.all([
                apiClient.get(`/ai/rankings/${jobId}/`),
                apiClient.get(`/jobs/${jobId}/applicants/`).catch(() => ({ data: { data: { applicants: [] } } })),
            ]);
            if (rankRes.data.status) {
                setCandidates(rankRes.data.data.candidates || []);
            }
            if (appRes.data.data?.applicants) {
                setApplicants(appRes.data.data.applicants);
            }
        }
        catch (err) {
            console.error('Screening failed:', err);
        }
        finally {
            setScreeningLoading(false);
        }
    };
    const handleSelectJob = (jobId) => {
        setSelectedJobId(jobId);
        handleScreenJob(jobId);
    };
    const handleStatusAction = async (candidateUserId, newStatus) => {
        const app = applicants.find(a => a.candidate?.id === candidateUserId);
        if (!app) {
            setActionMessage('This candidate has not applied for this job.');
            setTimeout(() => setActionMessage(null), 3000);
            return;
        }
        setActionLoading(candidateUserId);
        try {
            const res = await apiClient.put(`/applications/${app.id}/status/`, { status: newStatus });
            if (res.data.status) {
                setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus, status_display: res.data.data.status_display } : a));
                setActionMessage('Candidate status updated. Notification sent.');
            }
        }
        catch (err) {
            setActionMessage(err.response?.data?.message || 'Failed to update status');
        }
        finally {
            setActionLoading(null);
            setTimeout(() => setActionMessage(null), 3000);
        }
    };
    const getApplicantStatus = (userId) => {
        return applicants.find(a => a.candidate?.id === userId);
    };
    const filtered = candidates.filter(c => {
        const matchesSearch = !searchTerm ||
            c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
        return matchesSearch && matchesTier;
    });
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Resume Screening", description: "Loading..." }), _jsx("div", { className: "space-y-4", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-6 h-24 skeleton rounded-xl" }, i)) })] }));
    }
    if (jobs.length === 0) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Resume Screening", description: "Screen and evaluate candidate resumes with AI-powered analysis." }), _jsx(EmptyState, { title: "No Jobs Posted", description: "Post a job first to start screening candidate resumes against your requirements." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Resume Screening", description: "Screen and evaluate candidate resumes with AI-powered analysis." }), actionMessage && (_jsx("div", { className: "p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 animate-fadeIn", children: _jsx("p", { className: "text-sm text-blue-700 dark:text-blue-400", children: actionMessage }) })), _jsx("div", { className: "card-base p-5", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-end gap-4", children: [_jsxs("div", { className: "flex-1 w-full", children: [_jsx("label", { className: "text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block", children: "Select Job to Screen Against" }), _jsxs("select", { value: selectedJobId || '', onChange: (e) => handleSelectJob(Number(e.target.value)), className: "input-base text-sm w-full", children: [_jsx("option", { value: "", children: "Choose a job posting..." }), jobs.map(j => _jsx("option", { value: j.id, children: j.job_title }, j.id))] })] }), selectedJobId && (_jsxs("button", { onClick: () => handleScreenJob(selectedJobId), disabled: screeningLoading, className: "btn-primary text-sm flex items-center gap-2 disabled:opacity-50", children: [_jsx(Refresh, { style: { fontSize: 16 }, className: screeningLoading ? 'animate-spin' : '' }), screeningLoading ? 'Screening...' : 'Re-Screen All'] }))] }) }), selectedJobId && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { style: { fontSize: 18 }, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by name or skill...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-base pl-9 text-sm w-full" })] }), _jsxs("select", { value: tierFilter, onChange: (e) => setTierFilter(e.target.value), className: "input-base text-sm w-48", children: [_jsx("option", { value: "all", children: "All Tiers" }), _jsx("option", { value: "excellent", children: "Excellent (\u226590)" }), _jsx("option", { value: "good", children: "Good (\u226575)" }), _jsx("option", { value: "average", children: "Average (\u226550)" }), _jsx("option", { value: "poor", children: "Poor (<50)" })] })] }), candidates.length > 0 && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: ['excellent', 'good', 'average', 'poor'].map(tier => {
                            const count = candidates.filter(c => c.tier === tier).length;
                            return (_jsxs("div", { className: `p-3 rounded-xl border ${TIER_COLORS[tier]}`, children: [_jsx("p", { className: "text-2xl font-bold", children: count }), _jsxs("p", { className: "text-xs capitalize", children: [tier, " Match"] })] }, tier));
                        }) })), screeningLoading ? (_jsxs("div", { className: "card-base p-12 text-center", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400", children: "Screening candidates with AI..." })] })) : filtered.length > 0 ? (_jsx("div", { className: "space-y-3", children: filtered.map(candidate => {
                            const appStatus = getApplicantStatus(candidate.user_id);
                            return (_jsxs("div", { className: "card-base overflow-hidden transition-all", children: [_jsxs("div", { className: "p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors", onClick: () => setExpandedId(expandedId === candidate.resume_id ? null : candidate.resume_id), children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("span", { className: "w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-zinc-400", children: ["#", candidate.rank] }) }), _jsx(ProgressRing, { value: Math.round(candidate.overall_score), size: 48, strokeWidth: 4 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5 flex-wrap", children: [_jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white truncate", children: candidate.candidate_name }), _jsx("span", { className: `px-2 py-0.5 text-[10px] font-semibold rounded-full border ${TIER_COLORS[candidate.tier]}`, children: candidate.tier_label }), appStatus && (_jsx("span", { className: "px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300", children: appStatus.status_display || appStatus.status }))] }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 truncate", children: [candidate.experience && `${candidate.experience} yrs exp · `, candidate.skills.slice(0, 4).join(', '), candidate.skills.length > 4 && ` +${candidate.skills.length - 4} more`] })] }), _jsxs("div", { className: "hidden sm:flex items-center gap-3 text-xs text-gray-500", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-bold text-gray-900 dark:text-white", children: candidate.semantic_score.toFixed(0) }), _jsx("p", { children: "Semantic" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-bold text-gray-900 dark:text-white", children: candidate.keyword_score.toFixed(0) }), _jsx("p", { children: "Keyword" })] })] })] }), expandedId === candidate.resume_id && (_jsxs("div", { className: "border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900/30 space-y-4 animate-fadeIn", children: [candidate.summary && (_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1", children: [_jsx(AutoAwesome, { style: { fontSize: 14 } }), " AI Summary"] }), _jsx("p", { className: "text-sm text-gray-700 dark:text-zinc-300", children: candidate.summary })] })), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [_jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Semantic" }), _jsxs("p", { className: "text-lg font-bold text-blue-600", children: [candidate.semantic_score.toFixed(1), "%"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Keyword" }), _jsxs("p", { className: "text-lg font-bold text-purple-600", children: [candidate.keyword_score.toFixed(1), "%"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Overall" }), _jsxs("p", { className: "text-lg font-bold text-emerald-600", children: [candidate.overall_score.toFixed(1), "%"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white dark:bg-zinc-800", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Education" }), _jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-zinc-300 truncate", children: candidate.education || 'N/A' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-emerald-600 uppercase mb-1.5 flex items-center gap-1", children: [_jsx(CheckCircle, { style: { fontSize: 14 } }), " Matched (", candidate.skills_matched.length, ")"] }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [candidate.skills_matched.map((s, i) => (_jsx("span", { className: "px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded", children: s }, i))), candidate.skills_matched.length === 0 && _jsx("span", { className: "text-xs text-gray-400", children: "None" })] })] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-red-600 uppercase mb-1.5 flex items-center gap-1", children: [_jsx(Cancel, { style: { fontSize: 14 } }), " Missing (", candidate.skills_missing.length, ")"] }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [candidate.skills_missing.map((s, i) => (_jsx("span", { className: "px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded", children: s }, i))), candidate.skills_missing.length === 0 && _jsx("span", { className: "text-xs text-emerald-500", children: "All matched!" })] })] })] }), appStatus ? (_jsxs("div", { className: "pt-3 border-t border-gray-200 dark:border-zinc-700", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mb-2", children: ["Current: ", _jsx("span", { className: "font-semibold text-gray-900 dark:text-white", children: appStatus.status_display || appStatus.status })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [appStatus.status !== 'shortlisted' && appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (_jsxs("button", { onClick: (e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'shortlisted'); }, disabled: actionLoading === candidate.user_id, className: "inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50", children: [_jsx(Star, { style: { fontSize: 14 } }), " Shortlist"] })), appStatus.status !== 'interview_scheduled' && appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (_jsxs("button", { onClick: (e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'interview_scheduled'); }, disabled: actionLoading === candidate.user_id, className: "inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50", children: [_jsx(EventNote, { style: { fontSize: 14 } }), " Interview"] })), appStatus.status !== 'selected' && appStatus.status !== 'rejected' && (_jsxs("button", { onClick: (e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'selected'); }, disabled: actionLoading === candidate.user_id, className: "inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50", children: [_jsx(ThumbUp, { style: { fontSize: 14 } }), " Accept"] })), appStatus.status !== 'rejected' && appStatus.status !== 'selected' && (_jsxs("button", { onClick: (e) => { e.stopPropagation(); handleStatusAction(candidate.user_id, 'rejected'); }, disabled: actionLoading === candidate.user_id, className: "inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50", children: [_jsx(ThumbDown, { style: { fontSize: 14 } }), " Reject"] }))] })] })) : (_jsx("div", { className: "pt-3 border-t border-gray-200 dark:border-zinc-700", children: _jsx("p", { className: "text-xs text-gray-400 dark:text-zinc-500 italic", children: "This candidate has not applied. Actions are available after they apply." }) }))] }))] }, candidate.resume_id));
                        }) })) : candidates.length > 0 ? (_jsx(EmptyState, { title: "No Matching Candidates", description: "No candidates match your current search or filter criteria." })) : (_jsx(EmptyState, { title: "No Candidates Screened Yet", description: "No analyzed resumes found. Candidates need to upload and analyze their resumes first." }))] }))] }));
};
export default RecruiterScreening;
