import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import { ArrowBack, ArrowForward, Publish } from '@mui/icons-material';
import apiClient from '../../services/api';
const skillSuggestions = ['Python', 'Java', 'React', 'TypeScript', 'Node.js', 'Django', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL', 'Flutter', 'Go', 'Rust'];
export const RecruiterCreateJob = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '', company: '', description: '', job_type: 'full-time',
        experience_min: '2', salary_min: '', salary_max: '', location: '',
        skills: [], deadline: '',
    });
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const addSkill = (skill) => {
        const s = skill.trim();
        if (s && !form.skills.includes(s))
            setForm({ ...form, skills: [...form.skills, s] });
        setSkillInput('');
    };
    const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
    const handlePublish = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and description are required');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                job_title: form.title,
                job_description: form.description,
                company_name: form.company,
                required_skills: form.skills,
                experience_required: form.experience_min ? `${form.experience_min}+` : '',
                location: form.location,
                salary_min: form.salary_min || null,
                salary_max: form.salary_max || null,
                job_type: form.job_type,
            };
            const response = await apiClient.post('/jobs/', payload);
            if (response.data.status) {
                navigate('/recruiter/jobs');
            }
            else {
                setError(response.data.message || 'Failed to create job');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to create job. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    const steps = ['Job Details', 'Requirements', 'Salary & Location', 'Preview'];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Create Job Posting", description: "Fill in the details to create a new job opening." }), error && (_jsxs("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-red-700 dark:text-red-400", children: error }), _jsx("button", { onClick: () => setError(null), className: "text-red-400 hover:text-red-600 text-sm font-bold", children: "\u2715" })] })), _jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-2", children: steps.map((s, i) => (_jsxs(React.Fragment, { children: [_jsxs("button", { onClick: () => setStep(i + 1), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${step === i + 1 ? 'bg-blue-600 text-white shadow-sm' : step > i + 1 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#111111] text-gray-500'}`, children: [_jsx("span", { className: "w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold", children: step > i + 1 ? '✓' : i + 1 }), _jsx("span", { className: "hidden sm:inline", children: s })] }), i < steps.length - 1 && _jsx("div", { className: `w-8 h-0.5 flex-shrink-0 ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-[#1a1a1a]'}` })] }, s))) }), _jsxs("div", { className: "max-w-3xl", children: [step === 1 && (_jsxs("div", { className: "card-base p-6 space-y-5 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Job Details" }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Job Title *" }), _jsx("input", { type: "text", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), className: "input-base", placeholder: "e.g. Senior Backend Developer" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Company Name *" }), _jsx("input", { type: "text", value: form.company, onChange: e => setForm({ ...form, company: e.target.value }), className: "input-base", placeholder: "e.g. TechNova Solutions" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Job Description *" }), _jsx("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), className: "input-base min-h-[150px] resize-y", placeholder: "Describe the role, responsibilities, and what you're looking for..." })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Job Type" }), _jsxs("select", { value: form.job_type, onChange: e => setForm({ ...form, job_type: e.target.value }), className: "input-base", children: [_jsx("option", { value: "full-time", children: "Full-time" }), _jsx("option", { value: "part-time", children: "Part-time" }), _jsx("option", { value: "contract", children: "Contract" }), _jsx("option", { value: "internship", children: "Internship" }), _jsx("option", { value: "remote", children: "Remote" })] })] })] })), step === 2 && (_jsxs("div", { className: "card-base p-6 space-y-5 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Requirements" }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Minimum Experience (years)" }), _jsx("input", { type: "number", value: form.experience_min, onChange: e => setForm({ ...form, experience_min: e.target.value }), className: "input-base w-32", min: "0", max: "20" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Required Skills" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "text", value: skillInput, onChange: e => setSkillInput(e.target.value), onKeyDown: e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput)), className: "input-base flex-1", placeholder: "Type a skill and press Enter" }), _jsx("button", { onClick: () => addSkill(skillInput), className: "btn-secondary text-sm", children: "Add" })] }), form.skills.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mb-3", children: form.skills.map(s => (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium", children: [s, _jsx("button", { onClick: () => removeSkill(s), className: "hover:text-red-500 ml-0.5", children: "\u00D7" })] }, s))) })), _jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Suggestions:" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: skillSuggestions.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (_jsxs("button", { onClick: () => addSkill(s), className: "px-2 py-0.5 bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-zinc-300 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors", children: ["+ ", s] }, s))) })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Application Deadline" }), _jsx("input", { type: "date", value: form.deadline, onChange: e => setForm({ ...form, deadline: e.target.value }), className: "input-base w-48" })] })] })), step === 3 && (_jsxs("div", { className: "card-base p-6 space-y-5 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Salary & Location" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Minimum Salary (LPA)" }), _jsx("input", { type: "number", value: form.salary_min, onChange: e => setForm({ ...form, salary_min: e.target.value }), className: "input-base", placeholder: "e.g. 15" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Maximum Salary (LPA)" }), _jsx("input", { type: "number", value: form.salary_max, onChange: e => setForm({ ...form, salary_max: e.target.value }), className: "input-base", placeholder: "e.g. 25" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Location" }), _jsx("input", { type: "text", value: form.location, onChange: e => setForm({ ...form, location: e.target.value }), className: "input-base", placeholder: "e.g. Bangalore, India" })] })] })), step === 4 && (_jsxs("div", { className: "card-base p-6 space-y-5 animate-fadeIn", children: [_jsx("h2", { className: "section-header", children: "Preview" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Title" }), _jsx("p", { className: "font-semibold text-gray-900 dark:text-white", children: form.title || '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Company" }), _jsx("p", { className: "text-gray-700 dark:text-zinc-300", children: form.company || '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Description" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-zinc-400", children: form.description || '—' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Type" }), _jsx("p", { className: "capitalize", children: form.job_type })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Experience" }), _jsxs("p", { children: [form.experience_min, "+ years"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Salary" }), _jsx("p", { children: form.salary_min && form.salary_max ? `₹${form.salary_min}-${form.salary_max} LPA` : '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Location" }), _jsx("p", { children: form.location || '—' })] })] }), form.skills.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-gray-500 uppercase", children: "Skills" }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-1", children: form.skills.map(s => _jsx("span", { className: "px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium", children: s }, s)) })] }))] })] })), _jsxs("div", { className: "flex items-center justify-between mt-6", children: [_jsxs("button", { onClick: () => step > 1 ? setStep(step - 1) : navigate('/recruiter/jobs'), className: "btn-ghost", children: [_jsx(ArrowBack, { style: { fontSize: 16 } }), " ", step > 1 ? 'Back' : 'Cancel'] }), _jsx("div", { className: "flex gap-2", children: step < 4 ? (_jsxs("button", { onClick: () => setStep(step + 1), className: "btn-primary", children: ["Next ", _jsx(ArrowForward, { style: { fontSize: 16 } })] })) : (_jsxs("button", { onClick: handlePublish, disabled: submitting, className: "btn-primary disabled:opacity-50", children: [_jsx(Publish, { style: { fontSize: 16 } }), " ", submitting ? 'Publishing...' : 'Publish Job'] })) })] })] })] }));
};
export default RecruiterCreateJob;
