import React from 'react';
import PageHeader from '@components/PageHeader';
import { LoadingSpinner } from '@components/LoadingSpinner';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View platform reports and analytics" />

      <div className="bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#222222] p-12 text-center">
        <div className="mb-4">
          <LoadingSpinner />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Reports coming soon
        </h3>
        <p className="text-gray-600 dark:text-zinc-400">
          Comprehensive platform reports and analytics will be available soon.
        </p>
      </div>
    </div>
  );
};

export default AdminReports;
