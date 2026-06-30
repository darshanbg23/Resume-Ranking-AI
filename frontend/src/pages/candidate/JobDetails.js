import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Work, ArrowBack, LocationOn, Business, AttachMoney, Schedule, Send, CheckCircle, Code, Person } from '@mui/icons-material';
import apiClient from '../../services/api';
export const CandidateJobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch job details
                const jobRes = await apiClient.get(`/jobs/${id}/`);
                const jobData = jobRes.data.data || jobRes.data;
                setJob(jobData);
                setApplied(jobData.has_applied || false);
                // Fetch user's analyzed resumes for apply dropdown
                const resumeRes = await apiClient.get('/resumes/');
                const allResumes = resumeRes.data.data || [];
                const analyzed = allResumes.filter((r) => r.status === 'processed');
                setResumes(analyzed);
                if (analyzed.length > 0) {
                    setSelectedResumeId(analyzed[0].id);
                }
            }
            catch (err) {
                console.error('Failed to fetch data:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    const handleApply = async () => {
        if (!selectedResumeId) {
            setError('Please select a resume to apply with.');
            return;
        }
        setApplying(true);
        setError(null);
        try {
            const res = await apiClient.post('/applications/', {
                job_id: Number(id),
                resume_id: selectedResumeId,
            });
            if (res.data.status) {
                setApplied(true);
                setSuccess('Application submitted successfully! The recruiter has been notified.');
            }
            else {
                setError(res.data.message || 'Failed to apply');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        }
        finally {
            setApplying(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "h-8 w-48 skeleton rounded" }), _jsxs("div", { className: "card-base p-6 space-y-4", children: [_jsx("div", { className: "h-6 w-2/3 skeleton rounded" }), _jsx("div", { className: "h-4 w-full skeleton rounded" }), _jsx("div", { className: "h-4 w-4/5 skeleton rounded" })] })] }));
    }
    if (!job) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("button", { onClick: () => navigate('/candidate/jobs'), className: "btn-ghost text-sm", children: [_jsx(ArrowBack, { style: { fontSize: 18 } }), " Back to Jobs"] }), _jsxs("div", { className: "card-base p-8 text-center", children: [_jsx("p", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "Job Not Found" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 mt-2", children: "This job listing may have been removed." })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6 animate-fadeIn", children: [_jsxs("button", { onClick: () => navigate('/candidate/jobs'), className: "btn-ghost text-sm", children: [_jsx(ArrowBack, { style: { fontSize: 18 } }), " Back to Jobs"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 space-y-6", children: _jsxs("div", { className: "card-base p-6", children: [_jsxs("div", { className: "flex items-start gap-4 mb-6", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm", children: _jsx(Work, { style: { fontSize: 28 }, className: "text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: job.job_title }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-zinc-400", children: [job.company_name && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Business, { style: { fontSize: 16 } }), " ", job.company_name] })), job.location && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(LocationOn, { style: { fontSize: 16 } }), " ", job.location] })), job.job_type && (_jsx("span", { className: "px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full capitalize", children: job.job_type }))] })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6", children: [job.salary_min && job.salary_max && (_jsxs("div", { className: "p-3 rounded-lg bg-gray-50 dark:bg-[#111111]", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1", children: [_jsx(AttachMoney, { style: { fontSize: 14 } }), " Salary Range"] }), _jsxs("p", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: ["\u20B9", Number(job.salary_min).toLocaleString(), " \u2014 \u20B9", Number(job.salary_max).toLocaleString()] })] })), job.experience_required && (_jsxs("div", { className: "p-3 rounded-lg bg-gray-50 dark:bg-[#111111]", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1", children: [_jsx(Schedule, { style: { fontSize: 14 } }), " Experience"] }), _jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: job.experience_required })] })), job.posted_by && (_jsxs("div", { className: "p-3 rounded-lg bg-gray-50 dark:bg-[#111111]", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mb-1", children: [_jsx(Person, { style: { fontSize: 14 } }), " Posted By"] }), _jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: job.posted_by })] }))] }), job.required_skills && job.required_skills.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1", children: [_jsx(Code, { style: { fontSize: 14 } }), " Required Skills"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: job.required_skills.map((skill, i) => (_jsx("span", { className: "px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg", children: skill }, i))) })] })), _jsxs("div", { children: [_jsx("h3", { className: "section-header text-base mb-3", children: "Job Description" }), _jsx("div", { className: "text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed", children: job.job_description })] })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "card-base p-6 sticky top-20", children: applied ? (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3", children: _jsx(CheckCircle, { style: { fontSize: 28 }, className: "text-emerald-600" }) }), _jsx("h3", { className: "text-base font-bold text-gray-900 dark:text-white", children: "Application Submitted" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 mt-1", children: "You've already applied for this position. Track your application in My Applications." }), _jsx("button", { onClick: () => navigate('/candidate/applications'), className: "btn-secondary text-sm mt-4 w-full justify-center", children: "View My Applications" })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-base font-bold text-gray-900 dark:text-white mb-4", children: "Apply for this Job" }), error && (_jsx("div", { className: "mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50", children: _jsx("p", { className: "text-sm text-red-700 dark:text-red-400", children: error }) })), success && (_jsx("div", { className: "mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50", children: _jsx("p", { className: "text-sm text-emerald-700 dark:text-emerald-400", children: success }) })), resumes.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2", children: "Select Resume" }), _jsx("select", { value: selectedResumeId || '', onChange: (e) => setSelectedResumeId(Number(e.target.value)), className: "input-base text-sm mb-4", children: resumes.map((r) => (_jsx("option", { value: r.id, children: r.file_name }, r.id))) })] })) : (_jsxs("div", { className: "mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50", children: [_jsx("p", { className: "text-sm text-amber-700 dark:text-amber-400 mb-2", children: "You need an analyzed resume to apply." }), _jsx("button", { onClick: () => navigate('/candidate/resume'), className: "btn-secondary text-xs w-full justify-center", children: "Upload Resume First" })] })), _jsxs("button", { onClick: handleApply, disabled: applying || resumes.length === 0, className: "btn-primary w-full justify-center mt-2", children: [_jsx(Send, { style: { fontSize: 18 } }), applying ? 'Submitting...' : 'Submit Application'] })] })) }), job.created_at && (_jsxs("div", { className: "card-base p-4", children: [_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: ["Posted ", new Date(job.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })] }), job.applicant_count !== undefined && (_jsxs("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-1", children: [job.applicant_count, " applicant", job.applicant_count !== 1 ? 's' : ''] }))] }))] })] })] }));
};
export default CandidateJobDetails;
