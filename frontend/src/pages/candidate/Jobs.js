import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import SearchBar from '@components/SearchBar';
import { Work, LocationOn, AutoAwesome, Star, ArrowForward, Close, Check, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { JobDetailsModal } from './JobDetailsModal';
const TIER_COLORS = {
    excellent: 'from-emerald-500 to-green-600 text-white',
    good: 'from-blue-500 to-indigo-600 text-white',
    average: 'from-amber-500 to-orange-600 text-white',
    poor: 'from-gray-400 to-gray-500 text-white',
};
export const CandidateJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [search, setSearch] = useState('');
    // Modals & Application state
    const [resumes, setResumes] = useState([]);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applySuccess, setApplySuccess] = useState('');
    useEffect(() => {
        const fetchAll = async () => {
            // Fetch all jobs
            try {
                const response = await apiClient.get('/jobs/');
                if (Array.isArray(response.data)) {
                    setJobs(response.data);
                }
                else if (response.data.data) {
                    setJobs(response.data.data);
                }
            }
            catch (err) {
                console.error('Failed to fetch jobs:', err);
            }
            finally {
                setLoading(false);
            }
            // Fetch AI recommendations & resumes
            try {
                const resumesRes = await apiClient.get('/resumes/');
                const fetchedResumes = resumesRes.data.data || resumesRes.data || [];
                const processedResumes = fetchedResumes.filter((r) => r.status === 'processed');
                setResumes(processedResumes);
                if (processedResumes.length > 0) {
                    setSelectedResumeId(processedResumes[0].id);
                }
                const analyzedResume = processedResumes[0];
                if (analyzedResume) {
                    const recsRes = await apiClient.get(`/ai/recommended-jobs/${analyzedResume.id}/`);
                    if (recsRes.data.status && recsRes.data.data?.recommendations) {
                        setRecommendations(recsRes.data.data.recommendations);
                    }
                }
            }
            catch (err) {
                console.error('Failed to fetch recommendations:', err);
            }
            finally {
                setLoadingRecs(false);
            }
        };
        fetchAll();
    }, []);
    const filteredJobs = jobs.filter(j => j.job_title.toLowerCase().includes(search.toLowerCase()) ||
        j.job_description.toLowerCase().includes(search.toLowerCase()));
    const handleApply = async () => {
        if (!selectedJob || !selectedResumeId)
            return;
        setApplying(true);
        setApplyError('');
        try {
            const jobId = 'job_id' in selectedJob ? selectedJob.job_id : selectedJob.id;
            const res = await apiClient.post('/applications/', {
                job_id: jobId,
                resume_id: selectedResumeId,
            });
            if (res.data.status) {
                setApplySuccess('Application submitted successfully!');
                // Update has_applied flag in state
                setJobs(jobs.map(j => j.id === jobId ? { ...j, has_applied: true } : j));
                setRecommendations(recommendations.map(r => r.job_id === jobId ? { ...r, has_applied: true } : r));
                setTimeout(() => {
                    setApplyModalOpen(false);
                    setApplySuccess('');
                }, 1500);
            }
            else {
                setApplyError(res.data.message || 'Failed to apply.');
            }
        }
        catch (err) {
            setApplyError(err.response?.data?.message || 'Error submitting application.');
        }
        finally {
            setApplying(false);
        }
    };
    const openDetails = (job) => {
        setSelectedJob(job);
        setDetailsModalOpen(true);
    };
    const openApply = (job) => {
        setSelectedJob(job);
        setApplyModalOpen(true);
    };
    return (_jsxs("div", { className: "space-y-8 pb-12", children: [_jsx(PageHeader, { title: "Browse Jobs", description: "Explore job opportunities and find your perfect match." }), !loadingRecs && recommendations.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AutoAwesome, { style: { fontSize: 24 }, className: "text-blue-500" }), _jsx("h2", { className: "text-xl font-black text-gray-900 dark:text-white", children: "Recommended for You" }), _jsx("span", { className: "px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-bold rounded-full", children: "AI-Matched" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: recommendations.slice(0, 4).map(rec => (_jsxs("div", { className: "card-base flex flex-col overflow-hidden border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-all", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 px-6 py-4 border-b border-blue-100 dark:border-blue-900/20 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_COLORS[rec.tier] || TIER_COLORS.poor} flex items-center justify-center flex-shrink-0 shadow-sm`, children: _jsxs("span", { className: "text-base font-black", children: [Math.round(rec.overall_score), "%"] }) }), _jsxs("div", { children: [_jsxs("p", { className: `text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${TIER_COLORS[rec.tier]}`, children: [rec.tier_label, " Match"] }), _jsxs("p", { className: "text-xs text-gray-600 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1", children: [_jsx(Star, { style: { fontSize: 12 }, className: "text-amber-500" }), " ", rec.match_reason] })] })] }) }), _jsxs("div", { className: "p-6 flex flex-col flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1", children: rec.job_title }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium", children: [rec.company_name && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Business, { style: { fontSize: 14 } }), " ", rec.company_name] }), rec.location && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(LocationOn, { style: { fontSize: 14 } }), rec.location] }), rec.job_type && _jsx("span", { className: "capitalize px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded", children: rec.job_type })] }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-4", children: rec.job_description }), _jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider", children: "Top Required Skills" }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [rec.required_skills?.slice(0, 4).map((s, i) => (_jsx("span", { className: "px-2 py-1 text-[11px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-md font-medium", children: s }, i))), rec.required_skills && rec.required_skills.length > 4 && (_jsxs("span", { className: "px-2 py-1 text-[11px] bg-gray-50 dark:bg-zinc-900 text-gray-500 rounded-md", children: ["+", rec.required_skills.length - 4] }))] })] }), _jsxs("div", { className: "mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-3", children: [_jsx("button", { onClick: () => openDetails(rec), className: "btn-secondary flex-1 py-2 text-sm justify-center", children: "View Details" }), rec.has_applied ? (_jsxs("button", { disabled: true, className: "btn-secondary flex-1 py-2 text-sm justify-center opacity-75 cursor-not-allowed", children: [_jsx(Check, { style: { fontSize: 16, marginRight: '4px' } }), " Applied"] })) : (_jsxs("button", { onClick: () => openApply(rec), className: "btn-primary flex-1 py-2 text-sm justify-center", children: ["Apply Now ", _jsx(ArrowForward, { style: { fontSize: 16, marginLeft: '4px' } })] }))] })] })] }, rec.job_id))) })] })), loadingRecs && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AutoAwesome, { style: { fontSize: 24 }, className: "text-blue-500 animate-pulse" }), _jsx("h2", { className: "text-xl font-black text-gray-900 dark:text-white", children: "Finding matches..." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [1, 2].map(i => _jsx("div", { className: "card-base p-6 h-[300px] skeleton rounded-2xl" }, i)) })] })), _jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-zinc-800", children: [_jsx("h2", { className: "text-xl font-black text-gray-900 dark:text-white mb-4", children: "All Opportunities" }), _jsx(SearchBar, { value: search, onSearch: setSearch, placeholder: "Search jobs by title, skills, or company..." })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: [1, 2, 3, 4, 5, 6].map(i => _jsx("div", { className: "card-base p-6 h-[260px] skeleton rounded-2xl" }, i)) })) : filteredJobs.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children", children: filteredJobs.map(job => (_jsxs("div", { className: "card-base flex flex-col p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md h-full", children: [_jsxs("div", { className: "flex items-start gap-4 mb-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-zinc-700", children: _jsx(Work, { style: { fontSize: 24 }, className: "text-gray-500 dark:text-zinc-400" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "text-base font-bold text-gray-900 dark:text-white truncate", title: job.job_title, children: job.job_title }), _jsxs("div", { className: "flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium", children: [job.company_name && _jsx("span", { className: "truncate max-w-[100px]", children: job.company_name }), job.location && _jsxs("span", { className: "flex items-center gap-0.5 truncate max-w-[100px]", children: [_jsx(LocationOn, { style: { fontSize: 12 } }), job.location] })] })] })] }), _jsxs("div", { className: "mb-4", children: [job.job_type && _jsx("span", { className: "inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2", children: job.job_type }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 line-clamp-2", children: job.job_description })] }), _jsx("div", { className: "mb-6", children: job.required_skills && job.required_skills.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1.5", children: [job.required_skills.slice(0, 3).map((s, i) => (_jsx("span", { className: "px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded border border-gray-200 dark:border-zinc-700", children: s }, i))), job.required_skills.length > 3 && _jsxs("span", { className: "text-[10px] text-gray-400 font-medium", children: ["+", job.required_skills.length - 3] })] })) }), _jsxs("div", { className: "mt-auto pt-4 flex gap-2 w-full", children: [_jsx("button", { onClick: () => openDetails(job), className: "btn-secondary flex-1 py-2 text-xs justify-center", children: "Details" }), job.has_applied ? (_jsxs("button", { disabled: true, className: "btn-secondary flex-1 py-2 text-xs justify-center opacity-75 cursor-not-allowed", children: [_jsx(Check, { style: { fontSize: 14, marginRight: '4px' } }), " Applied"] })) : (_jsx("button", { onClick: () => openApply(job), className: "btn-primary flex-1 py-2 text-xs justify-center", children: "Apply Now" }))] })] }, job.id))) })) : (_jsx(EmptyState, { title: search ? 'No Jobs Found' : 'No Jobs Available', description: search ? 'Try adjusting your search terms.' : 'No job listings are available right now. Check back later.' })), selectedJob && (_jsx(JobDetailsModal, { job: selectedJob, isOpen: detailsModalOpen, onClose: () => setDetailsModalOpen(false), onApply: (job) => {
                    setDetailsModalOpen(false);
                    openApply(job);
                } })), applyModalOpen && selectedJob && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn", children: _jsxs("div", { className: "bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800", children: [_jsxs("div", { className: "p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "Apply for Job" }), _jsx("button", { onClick: () => { setApplyModalOpen(false); setApplyError(''); setApplySuccess(''); }, className: "p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500", children: _jsx(Close, { style: { fontSize: 20 } }) })] }), _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700", children: [_jsx("p", { className: "text-base font-bold text-gray-900 dark:text-white mb-1", children: selectedJob.job_title }), _jsxs("div", { className: "flex items-center gap-3 text-sm text-gray-500", children: [selectedJob.company_name && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Business, { style: { fontSize: 14 } }), " ", selectedJob.company_name] }), selectedJob.location && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(LocationOn, { style: { fontSize: 14 } }), " ", selectedJob.location] })] })] }), applyError && (_jsx("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-sm font-medium text-red-700 dark:text-red-400", children: applyError })), applySuccess && (_jsx("div", { className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-sm font-medium text-emerald-700 dark:text-emerald-400", children: applySuccess })), resumes.length > 0 ? (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2", children: "Select Resume to Submit" }), _jsx("select", { value: selectedResumeId || '', onChange: (e) => setSelectedResumeId(Number(e.target.value)), className: "input-base text-sm w-full font-medium", children: resumes.map((r) => (_jsx("option", { value: r.id, children: r.file_name }, r.id))) })] })) : (_jsxs("div", { className: "p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50", children: [_jsx("p", { className: "text-sm font-medium text-amber-700 dark:text-amber-400 mb-3", children: "You need an analyzed resume to apply for this job." }), _jsx("button", { onClick: () => navigate('/candidate/resume'), className: "btn-secondary text-xs w-full justify-center", children: "Upload Resume Now" })] }))] }), _jsxs("div", { className: "p-5 border-t border-gray-100 dark:border-zinc-800 flex gap-3 bg-gray-50 dark:bg-zinc-900/50", children: [_jsx("button", { onClick: () => { setApplyModalOpen(false); setApplyError(''); setApplySuccess(''); }, className: "btn-secondary flex-1 py-2.5 justify-center font-bold", children: "Cancel" }), _jsx("button", { onClick: handleApply, disabled: applying || resumes.length === 0, className: "btn-primary flex-1 py-2.5 justify-center font-bold shadow-md", children: applying ? 'Submitting...' : 'Confirm Application' })] })] }) }))] }));
};
export default CandidateJobs;
