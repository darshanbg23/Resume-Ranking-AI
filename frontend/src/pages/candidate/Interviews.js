import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
export const CandidateInterviews = () => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Interviews", description: "View your scheduled interviews and preparation materials." }), _jsx(EmptyState, { title: "No Interviews Scheduled", description: "You don't have any upcoming interviews. Keep applying to jobs and check back here when you're shortlisted." })] }));
};
export default CandidateInterviews;
