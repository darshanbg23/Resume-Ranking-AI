import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import ProgressRing from '@components/ProgressRing';
import EmptyState from '@components/EmptyState';
import {
  TrendingUp, Lightbulb, Code, School, Work, CloudUpload, Analytics, Description,
  Psychology, QuestionAnswer, WorkOutline, Person, Email, Phone,
  CheckCircle, Cancel, AutoAwesome, Star
} from '@mui/icons-material';
import apiClient from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ResumeItem {
  id: number;
  file_name: string;
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

interface JobItem {
  id: number;
  job_title: string;
  job_description: string;
}

interface SkillGapData {
  job_title: string;
  present_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  recommendations: string[];
}

interface InterviewQuestionsData {
  technical_questions: string[];
  behavioral_questions: string[];
  role_specific_questions: string[];
}

interface RoleRecommendation {
  role: string;
  confidence: number;
  reason: string;
}

export const CandidateInsights: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Feature states
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [skillGap, setSkillGap] = useState<SkillGapData | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionsData | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [roleRecommendations, setRoleRecommendations] = useState<RoleRecommendation[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [summaryLoading, setSummaryLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'ai-tools'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeRes, jobRes] = await Promise.all([
          apiClient.get('/resumes/'),
          apiClient.get('/jobs/').catch(() => ({ data: { data: [] } })),
        ]);
        if (resumeRes.data.status) {
          setResumes(resumeRes.data.data);
          const analyzed = resumeRes.data.data.find((r: ResumeItem) => r.status === 'processed');
          if (analyzed) setSelectedResumeId(analyzed.id);
        }
        const jobData = jobRes.data?.data || jobRes.data || [];
        setJobs(Array.isArray(jobData) ? jobData : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedResume = resumes.find(r => r.id === selectedResumeId) || null;
  const analyzedResumes = resumes.filter(r => r.status === 'processed');
  const hasResumes = resumes.length > 0;
  const hasAnalysis = selectedResume?.status === 'processed' && selectedResume?.analysis_result;

  // ── AI Feature Handlers ────────────────────────────────────

  const handleGenerateSummary = async () => {
    if (!selectedResumeId) return;
    setSummaryLoading(true);
    try {
      const res = await apiClient.post(`/ai/generate-summary/${selectedResumeId}/`);
      if (res.data.status) {
        setResumes(prev => prev.map(r =>
          r.id === selectedResumeId ? { ...r, resume_summary: res.data.data.summary } : r
        ));
      }
    } catch (err) {
      console.error('Summary generation failed:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSkillGap = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setSkillGapLoading(true);
    try {
      const res = await apiClient.post(`/ai/skill-gap/${selectedResumeId}/${selectedJobId}/`);
      if (res.data.status) {
        setSkillGap(res.data.data);
      }
    } catch (err) {
      console.error('Skill gap analysis failed:', err);
    } finally {
      setSkillGapLoading(false);
    }
  };

  const handleInterviewQuestions = async () => {
    if (!selectedResumeId) return;
    setQuestionsLoading(true);
    try {
      const res = await apiClient.post(`/ai/interview-questions/${selectedResumeId}/`, {
        job_id: selectedJobId || undefined,
      });
      if (res.data.status) {
        setInterviewQuestions(res.data.data);
      }
    } catch (err) {
      console.error('Interview questions failed:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleRoleRecommendations = async () => {
    if (!selectedResumeId) return;
    setRolesLoading(true);
    try {
      const res = await apiClient.post(`/ai/recommend-roles/${selectedResumeId}/`);
      if (res.data.status) {
        setRoleRecommendations(res.data.data.roles || []);
      }
    } catch (err) {
      console.error('Role recommendations failed:', err);
    } finally {
      setRolesLoading(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Insights" description="Loading your resume insights..." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card-base p-6 h-28 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  // ── Empty States ───────────────────────────────────────────

  if (!hasResumes) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Insights" description="AI-powered analysis of your resume, skills, and career recommendations." />
        <EmptyState
          title="No Resumes Uploaded"
          description="Upload your resume to get AI-powered insights including skill analysis, experience breakdown, and career recommendations."
          action={
            <button onClick={() => navigate('/candidate/resume')} className="btn-primary">
              <CloudUpload style={{ fontSize: 18 }} /> Upload Resume
            </button>
          }
        />
      </div>
    );
  }

  if (analyzedResumes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Insights" description="AI-powered analysis of your resume, skills, and career recommendations." />
        <div className="card-base p-8 text-center">
          <Analytics style={{ fontSize: 48 }} className="text-blue-400 mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Analyzed Resumes</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
            You have {resumes.length} resume(s) uploaded but none have been analyzed yet. Go to Resume Manager and click "Analyze" to generate AI insights.
          </p>
          <button onClick={() => navigate('/candidate/resume')} className="btn-primary">
            <Description style={{ fontSize: 18 }} /> Go to Resume Manager
          </button>
        </div>
      </div>
    );
  }

  // ── Main Content ───────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="AI Insights" description="AI-powered analysis of your resume, skills, and career recommendations." />

      {/* Resume Selector + Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {analyzedResumes.length > 1 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">Resume:</label>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => { setSelectedResumeId(Number(e.target.value)); setSkillGap(null); setInterviewQuestions(null); setRoleRecommendations([]); }}
              className="input-base max-w-xs text-sm"
            >
              {analyzedResumes.map(r => (
                <option key={r.id} value={r.id}>{r.file_name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-900 rounded-lg p-1">
          {(['overview', 'skills', 'ai-tools'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'skills' ? 'Skills & Experience' : 'AI Tools'}
            </button>
          ))}
        </div>
      </div>

      {hasAnalysis && (
        <>
          {/* ─── OVERVIEW TAB ──────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* Resume Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                      <CheckCircle style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Analysis Status</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Complete</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    AI has extracted skills, experience, and education from your resume
                  </p>
                </div>
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                      <Code style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Skills Found</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedResume!.skills_extracted?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedResume!.skills_extracted?.slice(0, 3).map((s: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-300 text-[10px] font-medium rounded">{s}</span>
                    ))}
                    {(selectedResume!.skills_extracted?.length || 0) > 3 && (
                      <span className="text-[10px] text-gray-400">+{selectedResume!.skills_extracted!.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                      <Work style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Experience</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedResume!.experience_extracted || '—'}
                        {selectedResume!.experience_extracted && <span className="text-sm font-normal text-gray-500 ml-1">years</span>}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    {selectedResume!.education_extracted ? `Education: ${selectedResume!.education_extracted.slice(0, 50)}...` : 'No education info detected'}
                  </p>
                </div>
              </div>

              {/* Parsed Contact Info */}
              {(selectedResume!.name_extracted || selectedResume!.email_extracted || selectedResume!.phone_extracted) && (
                <div className="card-base p-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <Person style={{ fontSize: 18 }} className="text-blue-500" /> Extracted Contact Info
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedResume!.name_extracted && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-sm text-gray-700 dark:text-zinc-300">
                        <Person style={{ fontSize: 16 }} className="text-blue-500" /> <span className="font-medium">{selectedResume!.name_extracted}</span>
                      </div>
                    )}
                    {selectedResume!.email_extracted && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-600 dark:text-zinc-400">
                        <Email style={{ fontSize: 16 }} className="text-gray-400" /> {selectedResume!.email_extracted}
                      </div>
                    )}
                    {selectedResume!.phone_extracted && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-600 dark:text-zinc-400">
                        <Phone style={{ fontSize: 16 }} className="text-gray-400" /> {selectedResume!.phone_extracted}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="section-header flex items-center gap-2">
                    <AutoAwesome style={{ fontSize: 20 }} className="text-amber-500" /> AI Resume Summary
                  </h2>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    {summaryLoading ? 'Generating...' : selectedResume!.resume_summary ? 'Regenerate' : 'Generate Summary'}
                  </button>
                </div>
                {selectedResume!.resume_summary ? (
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
                    {selectedResume!.resume_summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                    Click "Generate Summary" to get an AI-powered summary of this resume.
                  </p>
                )}
              </div>

              {/* AI Analysis — Strengths & Weaknesses */}
              {selectedResume!.analysis_result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedResume!.analysis_result.strengths && selectedResume!.analysis_result.strengths.length > 0 && (
                    <div className="card-base p-6">
                      <h2 className="section-header mb-4 flex items-center gap-2">
                        <TrendingUp style={{ fontSize: 20 }} className="text-emerald-500" /> Strengths
                      </h2>
                      <div className="space-y-2">
                        {selectedResume!.analysis_result.strengths.map((s: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                            <CheckCircle style={{ fontSize: 16 }} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-zinc-300">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedResume!.analysis_result.weaknesses && selectedResume!.analysis_result.weaknesses.length > 0 && (
                    <div className="card-base p-6">
                      <h2 className="section-header mb-4 flex items-center gap-2">
                        <Lightbulb style={{ fontSize: 20 }} className="text-amber-500" /> Areas to Improve
                      </h2>
                      <div className="space-y-2">
                        {selectedResume!.analysis_result.weaknesses.map((w: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                            <Lightbulb style={{ fontSize: 16 }} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-zinc-300">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Certifications & Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certifications */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <Star style={{ fontSize: 20 }} className="text-yellow-500" /> Certifications
                  </h2>
                  {selectedResume!.certifications_extracted && selectedResume!.certifications_extracted.length > 0 ? (
                    <div className="space-y-2">
                      {selectedResume!.certifications_extracted.map((cert: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                          <CheckCircle style={{ fontSize: 16 }} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-zinc-300">{cert}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 dark:text-zinc-500">
                      <Star style={{ fontSize: 32 }} className="mb-2 opacity-30" />
                      <p className="text-sm">No certifications detected</p>
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <TrendingUp style={{ fontSize: 20 }} className="text-purple-600" /> Projects
                  </h2>
                  {selectedResume!.projects_extracted && selectedResume!.projects_extracted.length > 0 ? (
                    <div className="space-y-3">
                      {selectedResume!.projects_extracted.map((proj: any, idx: number) => {
                        const title = typeof proj === 'string' ? proj : proj.title || 'Untitled Project';
                        const description = typeof proj === 'object' ? proj.description : '';
                        return (
                          <div key={idx} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-purple-200 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                              {title}
                            </p>
                            {description && (
                              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 ml-7 leading-relaxed">{description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 dark:text-zinc-500">
                      <TrendingUp style={{ fontSize: 32 }} className="mb-2 opacity-30" />
                      <p className="text-sm">No projects detected</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── SKILLS & EXPERIENCE TAB ───────────────────────── */}
          {activeTab === 'skills' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Extracted */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <Code style={{ fontSize: 20 }} className="text-blue-600" /> Skills Extracted
                  </h2>
                  {selectedResume!.skills_extracted && selectedResume!.skills_extracted.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedResume!.skills_extracted.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No skills detected in this resume.</p>
                  )}
                </div>

                {/* Project Categories */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <TrendingUp style={{ fontSize: 20 }} className="text-purple-600" /> Project Categories
                  </h2>
                  {selectedResume!.analysis_result?.project_categories && selectedResume!.analysis_result.project_categories.length > 0 ? (
                    <div className="space-y-2">
                      {selectedResume!.analysis_result.project_categories.map((cat: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#111111]">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                            <TrendingUp style={{ fontSize: 16 }} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cat}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No project categories detected.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Experience Analysis */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <Work style={{ fontSize: 20 }} className="text-emerald-600" /> Experience Analysis
                  </h2>
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                      {selectedResume!.experience_extracted || '0'} years
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Total experience detected by AI</p>
                  </div>
                </div>

                {/* Education Analysis */}
                <div className="card-base p-6">
                  <h2 className="section-header mb-4 flex items-center gap-2">
                    <School style={{ fontSize: 20 }} className="text-indigo-600" /> Education
                  </h2>
                  {selectedResume!.education_extracted ? (
                    <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30">
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {selectedResume!.education_extracted}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No education information detected.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── AI TOOLS TAB ──────────────────────────────────── */}
          {activeTab === 'ai-tools' && (
            <>
              {/* Skill Gap Analysis */}
              <div className="card-base p-6">
                <h2 className="section-header mb-4 flex items-center gap-2">
                  <Psychology style={{ fontSize: 20 }} className="text-rose-500" /> Skill Gap Analysis
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1 block">Select Job to Compare</label>
                    <select
                      value={selectedJobId || ''}
                      onChange={(e) => { setSelectedJobId(Number(e.target.value)); setSkillGap(null); }}
                      className="input-base text-sm w-full"
                    >
                      <option value="">Choose a job...</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.job_title}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleSkillGap}
                    disabled={!selectedJobId || skillGapLoading}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {skillGapLoading ? 'Analyzing...' : 'Analyze Gap'}
                  </button>
                </div>

                {skillGap && (
                  <div className="space-y-4 mt-4">
                    {/* Match percentage */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#111111]">
                      <ProgressRing value={Math.round(skillGap.match_percentage)} size={64} strokeWidth={5} />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Skill Match</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{skillGap.match_percentage.toFixed(0)}% for {skillGap.job_title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Present Skills */}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                          <CheckCircle style={{ fontSize: 14 }} /> Present Skills ({skillGap.present_skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillGap.present_skills.map((s, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800/40">{s}</span>
                          ))}
                          {skillGap.present_skills.length === 0 && <span className="text-xs text-gray-400">None matched</span>}
                        </div>
                      </div>
                      {/* Missing Skills */}
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
                          <Cancel style={{ fontSize: 14 }} /> Missing Skills ({skillGap.missing_skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillGap.missing_skills.map((s, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800/40">{s}</span>
                          ))}
                          {skillGap.missing_skills.length === 0 && <span className="text-xs text-emerald-500">All skills matched! 🎉</span>}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {skillGap.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2 flex items-center gap-1">
                          <Lightbulb style={{ fontSize: 14 }} /> Improvement Recommendations
                        </h4>
                        <div className="space-y-2">
                          {skillGap.recommendations.map((rec, i) => (
                            <div key={i} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border-l-3 border-blue-500 text-sm text-gray-700 dark:text-zinc-300">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interview Questions */}
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-header flex items-center gap-2">
                    <QuestionAnswer style={{ fontSize: 20 }} className="text-indigo-500" /> Interview Questions
                  </h2>
                  <button
                    onClick={handleInterviewQuestions}
                    disabled={questionsLoading}
                    className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                  >
                    {questionsLoading ? 'Generating...' : interviewQuestions ? 'Regenerate' : 'Generate Questions'}
                  </button>
                </div>

                {interviewQuestions ? (
                  <div className="space-y-4">
                    {/* Technical */}
                    {interviewQuestions.technical_questions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">Technical Questions</h4>
                        <ol className="space-y-2">
                          {interviewQuestions.technical_questions.map((q, i) => (
                            <li key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-zinc-300">
                              <span className="text-blue-500 font-bold mr-2">{i + 1}.</span> {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {/* Behavioral */}
                    {interviewQuestions.behavioral_questions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 uppercase mb-2">Behavioral Questions</h4>
                        <ol className="space-y-2">
                          {interviewQuestions.behavioral_questions.map((q, i) => (
                            <li key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-zinc-300">
                              <span className="text-emerald-500 font-bold mr-2">{i + 1}.</span> {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {/* Role-Specific */}
                    {interviewQuestions.role_specific_questions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-purple-600 uppercase mb-2">Role-Specific Questions</h4>
                        <ol className="space-y-2">
                          {interviewQuestions.role_specific_questions.map((q, i) => (
                            <li key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-[#111111] text-sm text-gray-700 dark:text-zinc-300">
                              <span className="text-purple-500 font-bold mr-2">{i + 1}.</span> {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                    Click "Generate Questions" to get AI-generated interview questions tailored to this resume.
                  </p>
                )}
              </div>

              {/* Role Recommendations */}
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-header flex items-center gap-2">
                    <WorkOutline style={{ fontSize: 20 }} className="text-teal-500" /> Recommended Roles
                  </h2>
                  <button
                    onClick={handleRoleRecommendations}
                    disabled={rolesLoading}
                    className="text-xs px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50"
                  >
                    {rolesLoading ? 'Generating...' : roleRecommendations.length > 0 ? 'Regenerate' : 'Get Recommendations'}
                  </button>
                </div>

                {roleRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {roleRecommendations.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-zinc-800">
                        <div className="flex-shrink-0">
                          <ProgressRing value={role.confidence} size={50} strokeWidth={4} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{role.role}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{role.reason}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          role.confidence >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' :
                          role.confidence >= 60 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                          'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        }`}>
                          {role.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                    Click "Get Recommendations" to see AI-suggested roles based on your skills and experience.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Resume Info Footer */}
          <div className="card-base p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
              <span>Resume: {selectedResume!.file_name} · {selectedResume!.file_size_display}</span>
              <span>Analyzed: {selectedResume!.analyzed_at ? new Date(selectedResume!.analyzed_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateInsights;
