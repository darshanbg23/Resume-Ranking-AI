import React from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';


export const RecruiterInterviews: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Interviews" description="Schedule and manage candidate interviews." />
      <EmptyState
        title="No Interviews Scheduled"
        description="Schedule interviews with shortlisted candidates from your recruitment pipeline."
      />
    </div>
  );
};

export default RecruiterInterviews;
