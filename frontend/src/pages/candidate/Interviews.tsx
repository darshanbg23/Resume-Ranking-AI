import React from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';


export const CandidateInterviews: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        description="View your scheduled interviews and preparation materials."
      />

      <EmptyState
        title="No Interviews Scheduled"
        description="You don't have any upcoming interviews. Keep applying to jobs and check back here when you're shortlisted."
      />
    </div>
  );
};

export default CandidateInterviews;
