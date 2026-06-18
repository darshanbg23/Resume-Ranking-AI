import React from 'react';
import PageHeader from '@components/PageHeader';
import { LoadingSpinner } from '@components/LoadingSpinner';

export const CandidateResults: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Results" description="View your application results and matches" />

      <div className="bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#222222] p-12 text-center">
        <div className="mb-4">
          <LoadingSpinner />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Results coming soon
        </h3>
        <p className="text-gray-600 dark:text-zinc-400">
          Your match results will appear here once you apply to jobs.
        </p>
      </div>
    </div>
  );
};

export default CandidateResults;
