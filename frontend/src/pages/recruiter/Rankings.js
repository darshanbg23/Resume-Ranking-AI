import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import ProgressRing from '@components/ProgressRing';
import { EmojiEvents, TrendingUp, Star, ArrowDownward } from '@mui/icons-material';
import apiClient from '../../services/api';
const TIER_CONFIG = {
    excellent: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        icon: _jsx(EmojiEvents, { style: { fontSize: 20 }, className: "text-amber-500" }),
    },
    good: {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        icon: _jsx(Star, { style: { fontSize: 20 }, className: "text-blue-500" }),
    },
    average: {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        icon: _jsx(TrendingUp, { style: { fontSize: 20 }, className: "text-amber-500" }),
    },
    poor: {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        icon: _jsx(ArrowDownward, { style: { fontSize: 20 }, className: "text-red-500" }),
    },
};
export const RecruiterRankings = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rankingLoading, setRankingLoading] = useState(false);
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
    const handleFetchRankings = async (jobId) => {
        setRankingLoading(true);
        try {
            const res = await apiClient.get(`/ai/rankings/${jobId}/`);
            if (res.data.status) {
                setCandidates(res.data.data.candidates || []);
            }
        }
        catch (err) {
            console.error('Ranking failed:', err);
        }
        finally {
            setRankingLoading(false);
        }
    };
    const handleSelectJob = (jobId) => {
        setSelectedJobId(jobId);
        handleFetchRankings(jobId);
    };
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidate Rankings", description: "Loading..." }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "card-base p-6 h-20 skeleton rounded-xl" }, i)) })] }));
    }
    if (jobs.length === 0) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidate Rankings", description: "View AI-powered candidate rankings for your job postings." }), _jsx(EmptyState, { title: "No Jobs Posted", description: "Post a job first to generate candidate rankings." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Candidate Rankings", description: "AI-powered candidate rankings sorted by composite match score." }), _jsxs("div", { className: "card-base p-5", children: [_jsx("label", { className: "text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block", children: "Select Job to View Rankings" }), _jsxs("select", { value: selectedJobId || '', onChange: (e) => handleSelectJob(Number(e.target.value)), className: "input-base text-sm w-full max-w-md", children: [_jsx("option", { value: "", children: "Choose a job posting..." }), jobs.map(j => _jsx("option", { value: j.id, children: j.job_title }, j.id))] })] }), selectedJobId && (_jsx(_Fragment, { children: rankingLoading ? (_jsxs("div", { className: "card-base p-12 text-center", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400", children: "Computing rankings..." })] })) : candidates.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: ['excellent', 'good', 'average', 'poor'].map(tier => {
                                const count = candidates.filter(c => c.tier === tier).length;
                                const config = TIER_CONFIG[tier];
                                return (_jsxs("div", { className: `p-4 rounded-xl border ${config.bg}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [config.icon, _jsx("span", { className: `text-2xl font-bold ${config.color}`, children: count })] }), _jsxs("p", { className: `text-xs font-medium capitalize ${config.color}`, children: [tier, " Match"] })] }, tier));
                            }) }), _jsxs("div", { className: "card-base overflow-hidden", children: [_jsxs("div", { className: "hidden sm:grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase", children: [_jsx("div", { className: "col-span-1 text-center", children: "Rank" }), _jsx("div", { className: "col-span-3", children: "Candidate" }), _jsx("div", { className: "col-span-2", children: "Skills" }), _jsx("div", { className: "col-span-1 text-center", children: "Exp" }), _jsx("div", { className: "col-span-1 text-center", children: "Semantic" }), _jsx("div", { className: "col-span-1 text-center", children: "Keyword" }), _jsx("div", { className: "col-span-2 text-center", children: "Overall Score" }), _jsx("div", { className: "col-span-1 text-center", children: "Tier" })] }), candidates.map((c, idx) => {
                                    return (_jsxs("div", { className: `grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors ${idx === 0 ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`, children: [_jsx("div", { className: "col-span-1 text-center hidden sm:block", children: _jsx("span", { className: `inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${idx === 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700' :
                                                        idx === 1 ? 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300' :
                                                            idx === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700' :
                                                                'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`, children: c.rank }) }), _jsxs("div", { className: "col-span-3", children: [_jsxs("p", { className: "text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2", children: [_jsxs("span", { className: "sm:hidden text-xs text-gray-400", children: ["#", c.rank] }), c.candidate_name] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: c.email })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [c.skills.slice(0, 3).map((s, i) => (_jsx("span", { className: "px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded", children: s }, i))), c.skills.length > 3 && (_jsxs("span", { className: "text-[10px] text-gray-400", children: ["+", c.skills.length - 3] }))] }) }), _jsxs("div", { className: "col-span-1 text-center text-sm text-gray-700 dark:text-zinc-300 hidden sm:block", children: [c.experience || '—', " ", c.experience ? 'yrs' : ''] }), _jsxs("div", { className: "col-span-1 text-center text-sm font-medium text-blue-600 hidden sm:block", children: [c.semantic_score.toFixed(0), "%"] }), _jsxs("div", { className: "col-span-1 text-center text-sm font-medium text-purple-600 hidden sm:block", children: [c.keyword_score.toFixed(0), "%"] }), _jsxs("div", { className: "col-span-2 flex items-center justify-center gap-2", children: [_jsx(ProgressRing, { value: Math.round(c.overall_score), size: 40, strokeWidth: 3 }), _jsxs("span", { className: "text-sm font-bold text-gray-900 dark:text-white", children: [c.overall_score.toFixed(1), "%"] })] }), _jsx("div", { className: "col-span-1 text-center", children: _jsx("span", { className: `px-2 py-1 text-[10px] font-semibold rounded-full border ${c.tier === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300' :
                                                        c.tier === 'good' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300' :
                                                            c.tier === 'average' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300' :
                                                                'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300'}`, children: c.tier_label }) })] }, c.resume_id));
                                })] })] })) : (_jsx(EmptyState, { title: "No Rankings Available", description: "No analyzed resumes found. Candidates need to upload and analyze their resumes for rankings to appear." })) }))] }));
};
export default RecruiterRankings;
