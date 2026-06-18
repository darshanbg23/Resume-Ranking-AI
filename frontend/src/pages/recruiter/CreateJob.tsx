import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import { ArrowBack, ArrowForward, Publish } from '@mui/icons-material';
import apiClient from '../../services/api';

const skillSuggestions = ['Python', 'Java', 'React', 'TypeScript', 'Node.js', 'Django', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL', 'Flutter', 'Go', 'Rust'];

export const RecruiterCreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', company: '', description: '', job_type: 'full-time',
    experience_min: '2', salary_min: '', salary_max: '', location: '',
    skills: [] as string[], deadline: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

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
      } else {
        setError(response.data.message || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Job Details', 'Requirements', 'Salary & Location', 'Preview'];

  return (
    <div className="space-y-6">
      <PageHeader title="Create Job Posting" description="Fill in the details to create a new job opening." />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button onClick={() => setStep(i + 1)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              step === i + 1 ? 'bg-blue-600 text-white shadow-sm' : step > i + 1 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#111111] text-gray-500'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{step > i + 1 ? '✓' : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 flex-shrink-0 ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-3xl">
        {step === 1 && (
          <div className="card-base p-6 space-y-5 animate-fadeIn">
            <h2 className="section-header">Job Details</h2>
            <div>
              <label className="input-label">Job Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="e.g. Senior Backend Developer" />
            </div>
            <div>
              <label className="input-label">Company Name *</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-base" placeholder="e.g. TechNova Solutions" />
            </div>
            <div>
              <label className="input-label">Job Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-base min-h-[150px] resize-y" placeholder="Describe the role, responsibilities, and what you're looking for..." />
            </div>
            <div>
              <label className="input-label">Job Type</label>
              <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })} className="input-base">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-base p-6 space-y-5 animate-fadeIn">
            <h2 className="section-header">Requirements</h2>
            <div>
              <label className="input-label">Minimum Experience (years)</label>
              <input type="number" value={form.experience_min} onChange={e => setForm({ ...form, experience_min: e.target.value })} className="input-base w-32" min="0" max="20" />
            </div>
            <div>
              <label className="input-label">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} className="input-base flex-1" placeholder="Type a skill and press Enter" />
                <button onClick={() => addSkill(skillInput)} className="btn-secondary text-sm">Add</button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {skillSuggestions.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                  <button key={s} onClick={() => addSkill(s)} className="px-2 py-0.5 bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-zinc-300 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-base w-48" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card-base p-6 space-y-5 animate-fadeIn">
            <h2 className="section-header">Salary & Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Minimum Salary (LPA)</label>
                <input type="number" value={form.salary_min} onChange={e => setForm({ ...form, salary_min: e.target.value })} className="input-base" placeholder="e.g. 15" />
              </div>
              <div>
                <label className="input-label">Maximum Salary (LPA)</label>
                <input type="number" value={form.salary_max} onChange={e => setForm({ ...form, salary_max: e.target.value })} className="input-base" placeholder="e.g. 25" />
              </div>
            </div>
            <div>
              <label className="input-label">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="e.g. Bangalore, India" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card-base p-6 space-y-5 animate-fadeIn">
            <h2 className="section-header">Preview</h2>
            <div className="space-y-4">
              <div><span className="text-xs font-medium text-gray-500 uppercase">Title</span><p className="font-semibold text-gray-900 dark:text-white">{form.title || '—'}</p></div>
              <div><span className="text-xs font-medium text-gray-500 uppercase">Company</span><p className="text-gray-700 dark:text-zinc-300">{form.company || '—'}</p></div>
              <div><span className="text-xs font-medium text-gray-500 uppercase">Description</span><p className="text-sm text-gray-600 dark:text-zinc-400">{form.description || '—'}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs font-medium text-gray-500 uppercase">Type</span><p className="capitalize">{form.job_type}</p></div>
                <div><span className="text-xs font-medium text-gray-500 uppercase">Experience</span><p>{form.experience_min}+ years</p></div>
                <div><span className="text-xs font-medium text-gray-500 uppercase">Salary</span><p>{form.salary_min && form.salary_max ? `₹${form.salary_min}-${form.salary_max} LPA` : '—'}</p></div>
                <div><span className="text-xs font-medium text-gray-500 uppercase">Location</span><p>{form.location || '—'}</p></div>
              </div>
              {form.skills.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">{form.skills.map(s => <span key={s} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">{s}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/recruiter/jobs')} className="btn-ghost">
            <ArrowBack style={{ fontSize: 16 }} /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <div className="flex gap-2">
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary">Next <ArrowForward style={{ fontSize: 16 }} /></button>
            ) : (
              <button onClick={handlePublish} disabled={submitting} className="btn-primary disabled:opacity-50">
                <Publish style={{ fontSize: 16 }} /> {submitting ? 'Publishing...' : 'Publish Job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterCreateJob;
