import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '@components/PageHeader';
import Modal from '@components/Modal';
import EmptyState from '@components/EmptyState';
import { CloudUpload, Description, Delete, Download, Analytics, AccessTime, CheckCircle, Error as ErrorIcon, HourglassTop, Person, Email, Phone, Star, Code, Work, School, AutoAwesome } from '@mui/icons-material';
import apiClient from '../../services/api';
const statusConfig = {
    pending: { icon: _jsx(HourglassTop, { style: { fontSize: 14 } }), label: 'Pending', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    processing: { icon: _jsx(HourglassTop, { style: { fontSize: 14 }, className: "animate-spin" }), label: 'Processing', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    processed: { icon: _jsx(CheckCircle, { style: { fontSize: 14 } }), label: 'Analyzed', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    failed: { icon: _jsx(ErrorIcon, { style: { fontSize: 14 } }), label: 'Failed', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/20' },
};
export const CandidateResume = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const fetchResumes = useCallback(async () => {
        try {
            const response = await apiClient.get('/resumes/');
            if (response.data.status) {
                setResumes(response.data.data);
            }
        }
        catch (err) {
            console.error('Failed to fetch resumes:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);
    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0)
            return;
        const file = files[0];
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/resumes/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.status) {
                // Add the new resume to the top of the list
                setResumes(prev => [response.data.data, ...prev]);
            }
        }
        catch (err) {
            const msg = err.response?.data?.message || 'Upload failed. Please try again.';
            setError(msg);
        }
        finally {
            setUploading(false);
            e.target.value = '';
        }
    };
    const handleDelete = async () => {
        if (!deleteTarget)
            return;
        try {
            await apiClient.delete(`/resumes/${deleteTarget}/`);
            setResumes(prev => prev.filter(r => r.id !== deleteTarget));
            if (selectedResume?.id === deleteTarget)
                setSelectedResume(null);
        }
        catch (err) {
            console.error('Delete failed:', err);
        }
        finally {
            setDeleteTarget(null);
            setShowDeleteModal(false);
        }
    };
    const handleDownload = async (resume) => {
        try {
            const response = await apiClient.get(`/resumes/${resume.id}/download/`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = resume.file_name;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error('Download failed:', err);
        }
    };
    const handleAnalyze = async (resume) => {
        setAnalyzing(resume.id);
        try {
            // Update status locally first
            setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'processing' } : r));
            const response = await apiClient.post(`/resumes/${resume.id}/analyze/`);
            if (response.data.status) {
                const updatedData = response.data.data;
                setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, ...updatedData } : r));
                if (selectedResume?.id === resume.id) {
                    setSelectedResume({ ...selectedResume, ...updatedData });
                }
            }
        }
        catch (err) {
            const msg = err.response?.data?.message || 'Analysis failed';
            setError(msg);
            setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'failed' } : r));
        }
        finally {
            setAnalyzing(null);
        }
    };
    const getStatusBadge = (s) => {
        const cfg = statusConfig[s] || statusConfig['pending'];
        return (_jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color} ${cfg.bg}`, children: [cfg.icon, " ", cfg.label] }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".pdf,.doc,.docx", onChange: handleUpload, className: "hidden" }), _jsx(PageHeader, { title: "Resume Manager", description: "Upload, manage, and analyze your resumes with AI-powered screening.", action: _jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "btn-primary", disabled: uploading, children: [_jsx(CloudUpload, { style: { fontSize: 18 } }), " ", uploading ? 'Uploading...' : 'Upload Resume'] }) }), error && (_jsxs("div", { className: "p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-red-700 dark:text-red-400", children: error }), _jsx("button", { onClick: () => setError(null), className: "text-red-400 hover:text-red-600 text-sm font-bold", children: "\u2715" })] })), _jsx("div", { className: "border-2 border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-[#0D0D0D]/50", onClick: () => !uploading && fileInputRef.current?.click(), children: uploading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" }), _jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-zinc-300", children: "Uploading your resume..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CloudUpload, { style: { fontSize: 40 }, className: "text-gray-400 dark:text-zinc-600 mb-3" }), _jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-zinc-300", children: "Drag & drop your resume here or click to browse" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-500 mt-1", children: "Supported: PDF, DOC, DOCX (Max 10MB)" })] })) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("h2", { className: "section-header mb-4", children: ["Your Resumes (", resumes.length, ")"] }), loading ? (_jsx("div", { className: "space-y-3", children: [1, 2].map(i => (_jsx("div", { className: "card-base p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg skeleton" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 w-2/3 skeleton rounded" }), _jsx("div", { className: "h-3 w-1/3 skeleton rounded" })] })] }) }, i))) })) : resumes.length > 0 ? (_jsx("div", { className: "space-y-3", children: resumes.map(resume => (_jsxs("div", { className: `card-base p-4 cursor-pointer transition-all ${selectedResume?.id === resume.id ? 'ring-2 ring-blue-500' : 'card-hover'}`, onClick: () => setSelectedResume(resume), children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0", children: _jsx(Description, { style: { fontSize: 20 }, className: "text-red-600 dark:text-red-400" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate", children: resume.file_name }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [_jsxs("span", { className: "text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1", children: [_jsx(AccessTime, { style: { fontSize: 12 } }), new Date(resume.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })] }), _jsx("span", { className: "text-xs text-gray-400", children: "\u00B7" }), _jsx("span", { className: "text-xs text-gray-400 dark:text-zinc-500", children: resume.file_size_display }), _jsx("span", { className: "text-xs text-gray-400", children: "\u00B7" }), _jsx("span", { className: "text-xs text-gray-400 dark:text-zinc-500", children: resume.file_type })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [getStatusBadge(resume.status), (resume.status === 'pending' || resume.status === 'failed') && (_jsx("button", { onClick: (e) => { e.stopPropagation(); handleAnalyze(resume); }, disabled: analyzing === resume.id, className: "p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors", title: "Analyze with AI", children: _jsx(Analytics, { style: { fontSize: 16 }, className: "text-blue-500" }) })), _jsx("button", { onClick: (e) => { e.stopPropagation(); handleDownload(resume); }, className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors", title: "Download", children: _jsx(Download, { style: { fontSize: 16 }, className: "text-gray-400" }) }), _jsx("button", { onClick: (e) => { e.stopPropagation(); setDeleteTarget(resume.id); setShowDeleteModal(true); }, className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors", title: "Delete", children: _jsx(Delete, { style: { fontSize: 16 }, className: "text-gray-400 hover:text-red-500" }) })] })] }), resume.status === 'processed' && resume.skills_extracted && resume.skills_extracted.length > 0 && (_jsxs("div", { className: "mt-2.5 flex items-center gap-2 flex-wrap", children: [resume.skills_extracted.slice(0, 4).map((s) => (_jsx("span", { className: "px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium rounded", children: s }, s))), resume.skills_extracted.length > 4 && (_jsxs("span", { className: "text-[10px] text-gray-400", children: ["+", resume.skills_extracted.length - 4, " more"] })), resume.experience_extracted && (_jsxs("span", { className: "text-[10px] text-gray-500 dark:text-zinc-400 flex items-center gap-0.5 ml-auto", children: [_jsx(Work, { style: { fontSize: 11 } }), " ", resume.experience_extracted, " yrs exp"] }))] }))] }, resume.id))) })) : (_jsx(EmptyState, { title: "No resumes uploaded", description: "Upload your first resume to get started with AI-powered screening and career insights.", action: _jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "btn-primary", children: [_jsx(CloudUpload, { style: { fontSize: 18 } }), " Upload Your First Resume"] }) }))] }), _jsxs("div", { children: [_jsx("h2", { className: "section-header mb-4", children: "Analysis Results" }), selectedResume && selectedResume.status === 'processed' && selectedResume.analysis_result ? (_jsxs("div", { className: "card-base p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30", children: [_jsx(CheckCircle, { style: { fontSize: 24 }, className: "text-emerald-500 mb-1" }), _jsx("p", { className: "text-sm font-bold text-emerald-700 dark:text-emerald-300", children: "Resume Analysis Complete" }), _jsx("p", { className: "text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5", children: "AI has extracted the following details from your resume" })] }), (selectedResume.name_extracted || selectedResume.email_extracted || selectedResume.phone_extracted) && (_jsxs("div", { className: "p-3 rounded-lg bg-gray-50 dark:bg-[#111111]", children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1", children: [_jsx(Person, { style: { fontSize: 14 } }), " Parsed Contact"] }), _jsxs("div", { className: "space-y-1.5", children: [selectedResume.name_extracted && (_jsxs("p", { className: "text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5", children: [_jsx(Person, { style: { fontSize: 13 }, className: "text-gray-400" }), " ", selectedResume.name_extracted] })), selectedResume.email_extracted && (_jsxs("p", { className: "text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5", children: [_jsx(Email, { style: { fontSize: 13 }, className: "text-gray-400" }), " ", selectedResume.email_extracted] })), selectedResume.phone_extracted && (_jsxs("p", { className: "text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5", children: [_jsx(Phone, { style: { fontSize: 13 }, className: "text-gray-400" }), " ", selectedResume.phone_extracted] }))] })] })), selectedResume.resume_summary && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1", children: [_jsx(AutoAwesome, { style: { fontSize: 14 }, className: "text-amber-500" }), " AI Summary"] }), _jsx("p", { className: "text-sm text-gray-700 dark:text-zinc-300 leading-relaxed p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30", children: selectedResume.resume_summary })] })), selectedResume.skills_extracted && selectedResume.skills_extracted.length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1", children: [_jsx(Code, { style: { fontSize: 14 }, className: "text-blue-500" }), " Skills (", selectedResume.skills_extracted.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedResume.skills_extracted.map((s) => (_jsx("span", { className: "px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium", children: s }, s))) })] })), selectedResume.experience_extracted && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1", children: [_jsx(Work, { style: { fontSize: 14 }, className: "text-emerald-500" }), " Experience"] }), _jsxs("p", { className: "text-sm text-gray-900 dark:text-white font-medium", children: [selectedResume.experience_extracted, " years"] })] })), selectedResume.education_extracted && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1", children: [_jsx(School, { style: { fontSize: 14 }, className: "text-indigo-500" }), " Education"] }), _jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: selectedResume.education_extracted })] })), selectedResume.certifications_extracted && selectedResume.certifications_extracted.length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1", children: [_jsx(Star, { style: { fontSize: 14 }, className: "text-yellow-500" }), " Certifications"] }), _jsx("div", { className: "space-y-1", children: selectedResume.certifications_extracted.map((cert, idx) => (_jsxs("div", { className: "flex items-start gap-1.5 text-sm text-gray-700 dark:text-zinc-300", children: [_jsx(CheckCircle, { style: { fontSize: 12 }, className: "text-yellow-500 mt-0.5 flex-shrink-0" }), cert] }, idx))) })] })), selectedResume.projects_extracted && selectedResume.projects_extracted.length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2", children: ["Projects (", selectedResume.projects_extracted.length, ")"] }), _jsx("div", { className: "space-y-2", children: selectedResume.projects_extracted.map((proj, idx) => (_jsxs("div", { className: "p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30", children: [_jsx("p", { className: "text-xs font-medium text-gray-900 dark:text-white", children: typeof proj === 'string' ? proj : proj.name || proj.title || (proj.description ? proj.description.slice(0, 50) : 'Project') }), proj.description && (_jsx("p", { className: "text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5", children: proj.description }))] }, idx))) })] })), selectedResume.analysis_result?.project_categories && selectedResume.analysis_result.project_categories.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2", children: "Project Categories" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedResume.analysis_result.project_categories.map((c) => (_jsx("span", { className: "px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium", children: c }, c))) })] })), selectedResume.analyzed_at && (_jsxs("p", { className: "text-[10px] text-gray-400 dark:text-zinc-500 text-center", children: ["Analyzed: ", new Date(selectedResume.analyzed_at).toLocaleString()] })), _jsxs("button", { onClick: () => handleAnalyze(selectedResume), disabled: analyzing === selectedResume.id, className: "btn-secondary text-xs w-full justify-center", children: [_jsx(Analytics, { style: { fontSize: 16 } }), " ", analyzing === selectedResume.id ? 'Re-analyzing...' : 'Re-analyze'] })] })) : selectedResume && selectedResume.status === 'pending' ? (_jsxs("div", { className: "card-base p-6 text-center", children: [_jsx(HourglassTop, { style: { fontSize: 32 }, className: "text-amber-400 mb-2" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Resume Not Analyzed" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-1", children: "Click below to run AI analysis on this resume." }), _jsxs("button", { onClick: () => handleAnalyze(selectedResume), disabled: analyzing === selectedResume.id, className: "btn-primary text-sm mt-4", children: [_jsx(Analytics, { style: { fontSize: 16 } }), " ", analyzing === selectedResume.id ? 'Analyzing...' : 'Analyze Resume'] })] })) : selectedResume && selectedResume.status === 'processing' ? (_jsxs("div", { className: "card-base p-6 text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Analyzing..." }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-1", children: "AI is processing your resume. This may take a moment." })] })) : selectedResume && selectedResume.status === 'failed' ? (_jsxs("div", { className: "card-base p-6 text-center", children: [_jsx(ErrorIcon, { style: { fontSize: 32 }, className: "text-red-400 mb-2" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Analysis Failed" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-1", children: "Something went wrong. Try again." }), _jsx("button", { onClick: () => handleAnalyze(selectedResume), disabled: analyzing === selectedResume.id, className: "btn-primary text-sm mt-4", children: "Retry Analysis" })] })) : (_jsxs("div", { className: "card-base p-6 text-center", children: [_jsx(Analytics, { style: { fontSize: 32 }, className: "text-gray-300 dark:text-zinc-600 mb-2" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400", children: "Select a resume to view or trigger AI analysis" })] }))] })] }), _jsx(Modal, { isOpen: showDeleteModal, onClose: () => setShowDeleteModal(false), title: "Delete Resume", size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowDeleteModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: handleDelete, className: "btn-danger", children: "Delete" })] }), children: _jsx("p", { className: "text-gray-600 dark:text-zinc-300", children: "Are you sure you want to delete this resume? This action cannot be undone." }) })] }));
};
export default CandidateResume;
