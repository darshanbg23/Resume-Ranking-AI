import React from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';

export const RecruiterAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Recruitment analytics and insights." />
      <EmptyState
        title="Analytics Coming Soon"
        description="Detailed recruitment analytics with charts, trends, and insights will appear here as you screen candidates and fill positions."
      />
    </div>
  );
};

export default RecruiterAnalytics;
