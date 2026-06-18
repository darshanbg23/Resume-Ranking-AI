import React from 'react';
import {
  Close, Work, LocationOn, Star,
  ArrowForward, Check, Business
} from '@mui/icons-material';

interface Job {
  id: number;
  job_title: string;
  job_description: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  required_skills?: string[];
  salary_min?: string | null;
  salary_max?: string | null;
  has_applied?: boolean;
}

interface JobRecommendation extends Job {
  job_id: number;
  overall_score: number;
  semantic_score: number;
  keyword_score: number;
  tier: string;
  tier_label: string;
  skills_matched: string[];
  skills_missing: string[];
  match_reason: string;
}

interface JobDetailsModalProps {
  job: Job | JobRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job | JobRecommendation) => void;
}

const TIER_COLORS: Record<string, string> = {
  excellent: 'from-emerald-500 to-green-600 text-white',
  good: 'from-blue-500 to-indigo-600 text-white',
  average: 'from-amber-500 to-orange-600 text-white',
  poor: 'from-gray-400 to-gray-500 text-white',
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  const isRec = 'overall_score' in job;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/50">
              <Work style={{ fontSize: 28 }} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{job.job_title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-zinc-400">
                {job.company_name && (
                  <span className="flex items-center gap-1">
                    <Business style={{ fontSize: 16 }} /> {job.company_name}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1">
                    <LocationOn style={{ fontSize: 16 }} /> {job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-800 rounded-md text-xs font-medium capitalize">
                    {job.job_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl text-gray-500 transition-colors">
            <Close style={{ fontSize: 24 }} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* AI Match Info (If Recommended) */}
          {isRec && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-4">
                <Star style={{ fontSize: 20 }} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">AI Match Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                  <p className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${TIER_COLORS[(job as JobRecommendation).tier] || TIER_COLORS.poor}`}>
                    {Math.round((job as JobRecommendation).overall_score)}%
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Overall Match</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round((job as JobRecommendation).semantic_score)}%
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Relevance</p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round((job as JobRecommendation).keyword_score)}%
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Skills Match</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(job as JobRecommendation).skills_matched.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                      <Check style={{ fontSize: 14 }} /> Matching Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(job as JobRecommendation).skills_matched.map((s, i) => (
                        <span key={i} className="px-2 py-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                 )}
                 {(job as JobRecommendation).skills_missing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(job as JobRecommendation).skills_missing.map((s, i) => (
                        <span key={i} className="px-2 py-1 text-[11px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                 )}
              </div>
            </div>
          )}

          {/* Job Description */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">About the Role</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-zinc-400 whitespace-pre-wrap">
              {job.job_description}
            </div>
          </section>

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Compensation */}
          {(job.salary_min || job.salary_max) && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Compensation</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-800/30">
                <span>{job.salary_min ? `$${job.salary_min}` : 'N/A'}</span>
                <span>-</span>
                <span>{job.salary_max ? `$${job.salary_max}` : 'N/A'}</span>
              </div>
            </section>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex gap-4">
          <button onClick={onClose} className="btn-secondary flex-1 py-3 justify-center text-sm font-bold">
            Close
          </button>
          {job.has_applied ? (
            <button disabled className="btn-secondary flex-1 py-3 justify-center text-sm font-bold opacity-75 cursor-not-allowed">
              <Check style={{ fontSize: 18, marginRight: '8px' }} /> Already Applied
            </button>
          ) : (
            <button 
              onClick={() => { onClose(); onApply(job); }} 
              className="btn-primary flex-1 py-3 justify-center text-sm font-bold shadow-lg shadow-blue-500/30"
            >
              Apply Now <ArrowForward style={{ fontSize: 18, marginLeft: '8px' }} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
