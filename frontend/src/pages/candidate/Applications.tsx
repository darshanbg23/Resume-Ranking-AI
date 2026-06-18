import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import { Search, Work, CheckCircle, Schedule, Star, Close, HourglassTop, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: string;
  status_display: string;
  applied_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  applied: { icon: <HourglassTop style={{ fontSize: 14 }} />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  under_review: { icon: <Visibility style={{ fontSize: 14 }} />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  shortlisted: { icon: <Star style={{ fontSize: 14 }} />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  interview_scheduled: { icon: <Schedule style={{ fontSize: 14 }} />, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  selected: { icon: <CheckCircle style={{ fontSize: 14 }} />, color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/20' },
  rejected: { icon: <Close style={{ fontSize: 14 }} />, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/20' },
};

const STATUS_STEPS = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected'];

export const CandidateApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/applications/');
        if (res.data.status) {
          setApplications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const getStatusBadge = (status: string, display: string) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['applied'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
        {cfg.icon} {display}
      </span>
    );
  };

  const getStepIndex = (status: string) => {
    if (status === 'rejected') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="My Applications"
        description="Track the status of your job applications."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Applied' },
          { key: 'under_review', label: 'Under Review' },
          { key: 'shortlisted', label: 'Shortlisted' },
          { key: 'interview_scheduled', label: 'Interview' },
          { key: 'selected', label: 'Selected' },
          { key: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#111111] text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            {tab.label}
            {tab.key === 'all' && ` (${applications.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-base p-5 h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {filteredApps.map(app => {
            const stepIdx = getStepIndex(app.status);
            return (
              <div
                key={app.id}
                className="card-base p-5 card-hover cursor-pointer transition-all"
                onClick={() => navigate(`/candidate/jobs/${app.job_id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Work style={{ fontSize: 22 }} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{app.job_title}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                        {app.company_name && <span>{app.company_name}</span>}
                        {app.location && <span>· {app.location}</span>}
                        {app.job_type && <span className="capitalize">· {app.job_type}</span>}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(app.status, app.status_display)}
                </div>

                {/* Status Timeline */}
                {app.status !== 'rejected' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const isActive = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500'
                              } ${isCurrent ? 'ring-2 ring-blue-300 dark:ring-blue-800' : ''}`}>
                                {i + 1}
                              </div>
                              <span className={`text-[9px] mt-1 text-center ${
                                isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-zinc-500'
                              }`}>
                                {step === 'applied' ? 'Applied' :
                                 step === 'under_review' ? 'Review' :
                                 step === 'shortlisted' ? 'Shortlisted' :
                                 step === 'interview_scheduled' ? 'Interview' :
                                 'Selected'}
                              </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                                i < stepIdx ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-700'
                              }`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {app.status === 'rejected' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-red-500">Application was not selected for this position.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={filter !== 'all' ? 'No Applications Found' : 'No Applications Yet'}
          description={
            filter !== 'all'
              ? 'No applications match this filter.'
              : "You haven't applied to any jobs yet. Browse available positions and submit your first application."
          }
          action={
            filter === 'all' ? (
              <button onClick={() => navigate('/candidate/jobs')} className="btn-primary">
                <Search style={{ fontSize: 18 }} /> Browse Jobs
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
};

export default CandidateApplications;
