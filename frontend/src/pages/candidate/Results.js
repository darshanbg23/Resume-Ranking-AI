import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageHeader from '@components/PageHeader';
import { LoadingSpinner } from '@components/LoadingSpinner';
export const CandidateResults = () => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Results", description: "View your application results and matches" }), _jsxs("div", { className: "bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#222222] p-12 text-center", children: [_jsx("div", { className: "mb-4", children: _jsx(LoadingSpinner, {}) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: "Results coming soon" }), _jsx("p", { className: "text-gray-600 dark:text-zinc-400", children: "Your match results will appear here once you apply to jobs." })] })] }));
};
export default CandidateResults;
