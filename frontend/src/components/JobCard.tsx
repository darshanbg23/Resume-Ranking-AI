import React from 'react';
import { LocationOn, Work, AccessTime, BookmarkBorder, Bookmark } from '@mui/icons-material';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
  onView?: (job: Job) => void;
  onSave?: (job: Job) => void;
  isSaved?: boolean;
  showMatchScore?: boolean;
  compact?: boolean;
}

const typeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'internship': 'Internship',
  'remote': 'Remote',
};

export const JobCard: React.FC<JobCardProps> = ({
  job, onApply, onView, onSave, isSaved = false, showMatchScore = false, compact = false,
}) => {
  const matchColor = (job.match_score || 0) >= 80 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
    : (job.match_score || 0) >= 60 ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';

  return (
    <div className="card-base p-5 card-hover group" onClick={() => onView?.(job)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Company Logo Placeholder */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">{job.company.charAt(0)}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {job.job_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">{job.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showMatchScore && job.match_score && (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${matchColor}`}>
              {job.match_score}% Match
            </span>
          )}
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(job); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
            >
              {isSaved
                ? <Bookmark style={{ fontSize: 20 }} className="text-blue-600" />
                : <BookmarkBorder style={{ fontSize: 20 }} className="text-gray-400" />
              }
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <LocationOn style={{ fontSize: 14 }} />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Work style={{ fontSize: 14 }} />
          {typeLabels[job.job_type] || job.job_type}
        </span>
        {job.experience_required > 0 && (
          <span className="inline-flex items-center gap-1">
            <AccessTime style={{ fontSize: 14 }} />
            {job.experience_required}+ years
          </span>
        )}
        {job.salary_range && (
          <span className="font-medium text-gray-700 dark:text-zinc-300">
            {job.salary_range}
          </span>
        )}
      </div>

      {/* Skills */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.required_skills.slice(0, 5).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-zinc-300 rounded-md text-xs font-medium">
              {skill}
            </span>
          ))}
          {job.required_skills.length > 5 && (
            <span className="px-2 py-0.5 text-gray-400 dark:text-zinc-500 text-xs">
              +{job.required_skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222222]/50">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
          <span>{job.applicant_count} applicants</span>
          <span>Posted {new Date(job.posted_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
        </div>
        {onApply && (
          <button
            onClick={(e) => { e.stopPropagation(); onApply(job); }}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
