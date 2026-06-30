import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
export const RecruiterInterviews = () => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Interviews", description: "Schedule and manage candidate interviews." }), _jsx(EmptyState, { title: "No Interviews Scheduled", description: "Schedule interviews with shortlisted candidates from your recruitment pipeline." })] }));
};
export default RecruiterInterviews;
