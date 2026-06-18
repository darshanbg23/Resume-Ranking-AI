import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '@components/PageHeader';
import Modal from '@components/Modal';
import EmptyState from '@components/EmptyState';
import { CloudUpload, Description, Delete, Download, Analytics, AccessTime, CheckCircle, Error as ErrorIcon, HourglassTop, Person, Email, Phone, Star, Code, Work, School, AutoAwesome } from '@mui/icons-material';
import apiClient from '../../services/api';

interface ResumeItem {
  id: number;
  file_name: string;
  file_size: number;
  file_size_display: string;
  file_type: string;
  status: string;
  match_score: number | null;
  skills_extracted: string[];
  experience_extracted: string;
  education_extracted: string;
  name_extracted: string;
  email_extracted: string;
  phone_extracted: string;
  certifications_extracted: string[];
  projects_extracted: any[];
  resume_summary: string;
  analysis_result: any;
  uploaded_at: string;
  analyzed_at: string | null;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pending: { icon: <HourglassTop style={{ fontSize: 14 }} />, label: 'Pending', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  processing: { icon: <HourglassTop style={{ fontSize: 14 }} className="animate-spin" />, label: 'Processing', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  processed: { icon: <CheckCircle style={{ fontSize: 14 }} />, label: 'Analyzed', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  failed: { icon: <ErrorIcon style={{ fontSize: 14 }} />, label: 'Failed', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/20' },
};

export const CandidateResume: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const response = await apiClient.get('/resumes/');
      if (response.data.status) {
        setResumes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
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
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/resumes/${deleteTarget}/`);
      setResumes(prev => prev.filter(r => r.id !== deleteTarget));
      if (selectedResume?.id === deleteTarget) setSelectedResume(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  const handleDownload = async (resume: ResumeItem) => {
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
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleAnalyze = async (resume: ResumeItem) => {
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
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Analysis failed';
      setError(msg);
      setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, status: 'failed' } : r));
    } finally {
      setAnalyzing(null);
    }
  };

  const getStatusBadge = (s: string) => {
    const cfg = statusConfig[s] || statusConfig['pending'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color} ${cfg.bg}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />

      <PageHeader
        title="Resume Manager"
        description="Upload, manage, and analyze your resumes with AI-powered screening."
        action={
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary" disabled={uploading}>
            <CloudUpload style={{ fontSize: 18 }} /> {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-[#0D0D0D]/50"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Uploading your resume...</p>
          </>
        ) : (
          <>
            <CloudUpload style={{ fontSize: 40 }} className="text-gray-400 dark:text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Drag & drop your resume here or click to browse</p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Supported: PDF, DOC, DOCX (Max 10MB)</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume List */}
        <div className="lg:col-span-2">
          <h2 className="section-header mb-4">Your Resumes ({resumes.length})</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="card-base p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 skeleton rounded" />
                      <div className="h-3 w-1/3 skeleton rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : resumes.length > 0 ? (
            <div className="space-y-3">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  className={`card-base p-4 cursor-pointer transition-all ${
                    selectedResume?.id === resume.id ? 'ring-2 ring-blue-500' : 'card-hover'
                  }`}
                  onClick={() => setSelectedResume(resume)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <Description style={{ fontSize: 20 }} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{resume.file_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                            <AccessTime style={{ fontSize: 12 }} />
                            {new Date(resume.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400 dark:text-zinc-500">{resume.file_size_display}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400 dark:text-zinc-500">{resume.file_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(resume.status)}
                      {(resume.status === 'pending' || resume.status === 'failed') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAnalyze(resume); }}
                          disabled={analyzing === resume.id}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                          title="Analyze with AI"
                        >
                          <Analytics style={{ fontSize: 16 }} className="text-blue-500" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(resume); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors" title="Download">
                        <Download style={{ fontSize: 16 }} className="text-gray-400" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(resume.id); setShowDeleteModal(true); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Delete">
                        <Delete style={{ fontSize: 16 }} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  {/* Skills preview for analyzed resumes */}
                  {resume.status === 'processed' && resume.skills_extracted && resume.skills_extracted.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {resume.skills_extracted.slice(0, 4).map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium rounded">{s}</span>
                      ))}
                      {resume.skills_extracted.length > 4 && (
                        <span className="text-[10px] text-gray-400">+{resume.skills_extracted.length - 4} more</span>
                      )}
                      {resume.experience_extracted && (
                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 flex items-center gap-0.5 ml-auto">
                          <Work style={{ fontSize: 11 }} /> {resume.experience_extracted} yrs exp
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No resumes uploaded"
              description="Upload your first resume to get started with AI-powered screening and career insights."
              action={
                <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                  <CloudUpload style={{ fontSize: 18 }} /> Upload Your First Resume
                </button>
              }
            />
          )}
        </div>

        {/* Analysis Results Panel */}
        <div>
          <h2 className="section-header mb-4">Analysis Results</h2>
          {selectedResume && selectedResume.status === 'processed' && selectedResume.analysis_result ? (
            <div className="card-base p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Analysis Complete Header */}
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                <CheckCircle style={{ fontSize: 24 }} className="text-emerald-500 mb-1" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Resume Analysis Complete</p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">AI has extracted the following details from your resume</p>
              </div>

              {/* Parsed Contact Info */}
              {(selectedResume.name_extracted || selectedResume.email_extracted || selectedResume.phone_extracted) && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111]">
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                    <Person style={{ fontSize: 14 }} /> Parsed Contact
                  </p>
                  <div className="space-y-1.5">
                    {selectedResume.name_extracted && (
                      <p className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Person style={{ fontSize: 13 }} className="text-gray-400" /> {selectedResume.name_extracted}
                      </p>
                    )}
                    {selectedResume.email_extracted && (
                      <p className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Email style={{ fontSize: 13 }} className="text-gray-400" /> {selectedResume.email_extracted}
                      </p>
                    )}
                    {selectedResume.phone_extracted && (
                      <p className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Phone style={{ fontSize: 13 }} className="text-gray-400" /> {selectedResume.phone_extracted}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {selectedResume.resume_summary && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                    <AutoAwesome style={{ fontSize: 14 }} className="text-amber-500" /> AI Summary
                  </p>
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                    {selectedResume.resume_summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedResume.skills_extracted && selectedResume.skills_extracted.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                    <Code style={{ fontSize: 14 }} className="text-blue-500" /> Skills ({selectedResume.skills_extracted.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.skills_extracted.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedResume.experience_extracted && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Work style={{ fontSize: 14 }} className="text-emerald-500" /> Experience
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedResume.experience_extracted} years</p>
                </div>
              )}

              {/* Education */}
              {selectedResume.education_extracted && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <School style={{ fontSize: 14 }} className="text-indigo-500" /> Education
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedResume.education_extracted}</p>
                </div>
              )}

              {/* Certifications */}
              {selectedResume.certifications_extracted && selectedResume.certifications_extracted.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                    <Star style={{ fontSize: 14 }} className="text-yellow-500" /> Certifications
                  </p>
                  <div className="space-y-1">
                    {selectedResume.certifications_extracted.map((cert: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-sm text-gray-700 dark:text-zinc-300">
                        <CheckCircle style={{ fontSize: 12 }} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedResume.projects_extracted && selectedResume.projects_extracted.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">Projects ({selectedResume.projects_extracted.length})</p>
                  <div className="space-y-2">
                    {selectedResume.projects_extracted.map((proj: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {typeof proj === 'string' ? proj : proj.title || 'Untitled'}
                        </p>
                        {proj.description && (
                          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Categories */}
              {selectedResume.analysis_result?.project_categories && selectedResume.analysis_result.project_categories.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2">Project Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.analysis_result.project_categories.map((c: string) => (
                      <span key={c} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyzed At */}
              {selectedResume.analyzed_at && (
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center">
                  Analyzed: {new Date(selectedResume.analyzed_at).toLocaleString()}
                </p>
              )}

              {/* Re-analyze */}
              <button
                onClick={() => handleAnalyze(selectedResume)}
                disabled={analyzing === selectedResume.id}
                className="btn-secondary text-xs w-full justify-center"
              >
                <Analytics style={{ fontSize: 16 }} /> {analyzing === selectedResume.id ? 'Re-analyzing...' : 'Re-analyze'}
              </button>
            </div>
          ) : selectedResume && selectedResume.status === 'pending' ? (
            <div className="card-base p-6 text-center">
              <HourglassTop style={{ fontSize: 32 }} className="text-amber-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Resume Not Analyzed</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Click below to run AI analysis on this resume.</p>
              <button
                onClick={() => handleAnalyze(selectedResume)}
                disabled={analyzing === selectedResume.id}
                className="btn-primary text-sm mt-4"
              >
                <Analytics style={{ fontSize: 16 }} /> {analyzing === selectedResume.id ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          ) : selectedResume && selectedResume.status === 'processing' ? (
            <div className="card-base p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Analyzing...</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">AI is processing your resume. This may take a moment.</p>
            </div>
          ) : selectedResume && selectedResume.status === 'failed' ? (
            <div className="card-base p-6 text-center">
              <ErrorIcon style={{ fontSize: 32 }} className="text-red-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Analysis Failed</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Something went wrong. Try again.</p>
              <button
                onClick={() => handleAnalyze(selectedResume)}
                disabled={analyzing === selectedResume.id}
                className="btn-primary text-sm mt-4"
              >
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="card-base p-6 text-center">
              <Analytics style={{ fontSize: 32 }} className="text-gray-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">Select a resume to view or trigger AI analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resume"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-zinc-300">Are you sure you want to delete this resume? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CandidateResume;
