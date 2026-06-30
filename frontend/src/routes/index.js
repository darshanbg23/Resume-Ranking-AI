import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '@layouts/PublicLayout';
import AuthLayout from '@layouts/AuthLayout';
// Public pages
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
// Candidate pages
import CandidateDashboard from '@pages/candidate/Dashboard';
import CandidateJobs from '@pages/candidate/Jobs';
import CandidateJobDetails from '@pages/candidate/JobDetails';
import CandidateApplications from '@pages/candidate/Applications';
import CandidateResume from '@pages/candidate/Resume';
import CandidateInsights from '@pages/candidate/Insights';
import CandidateSettings from '@pages/candidate/Settings';
import CandidateProfile from '@pages/candidate/Profile';
import CandidateNotifications from '@pages/candidate/Notifications';
// Recruiter pages
import RecruiterDashboard from '@pages/recruiter/Dashboard';
import RecruiterJobs from '@pages/recruiter/Jobs';
import RecruiterCreateJob from '@pages/recruiter/CreateJob';
import RecruiterCandidates from '@pages/recruiter/Candidates';
import RecruiterScreening from '@pages/recruiter/Screening';
import RecruiterRankings from '@pages/recruiter/Rankings';
import RecruiterProfile from '@pages/recruiter/Profile';
import RecruiterAnalytics from '@pages/recruiter/Analytics';
// Admin pages
import AdminDashboard from '@pages/admin/Dashboard';
import AdminUsers from '@pages/admin/Users';
import AdminRecruiters from '@pages/admin/Recruiters';
import AdminJobs from '@pages/admin/Jobs';
import AdminAnalytics from '@pages/admin/Analytics';
import AdminLogs from '@pages/admin/Logs';
// 404 Error page
const NotFoundPage = () => (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black", children: _jsxs("div", { className: "text-center animate-fadeIn", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white text-4xl font-bold", children: "404" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Page Not Found" }), _jsx("p", { className: "text-gray-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto", children: "The page you're looking for doesn't exist or has been moved." }), _jsx("a", { href: "/", className: "btn-primary inline-flex", children: "Back to Home" })] }) }));
const router = createBrowserRouter([
    // ── Public routes ──────────────────────────────────────
    {
        element: _jsx(PublicLayout, {}),
        children: [
            { path: '/', element: _jsx(HomePage, {}) },
            { path: '/login', element: _jsx(LoginPage, {}) },
            { path: '/register', element: _jsx(RegisterPage, {}) },
        ],
    },
    // ── Candidate Portal ───────────────────────────────────
    {
        element: _jsx(AuthLayout, { requiredRole: "candidate" }),
        children: [
            { path: '/candidate/dashboard', element: _jsx(CandidateDashboard, {}) },
            { path: '/candidate/jobs', element: _jsx(CandidateJobs, {}) },
            { path: '/candidate/jobs/:id', element: _jsx(CandidateJobDetails, {}) },
            { path: '/candidate/applications', element: _jsx(CandidateApplications, {}) },
            { path: '/candidate/resume', element: _jsx(CandidateResume, {}) },
            { path: '/candidate/insights', element: _jsx(CandidateInsights, {}) },
            { path: '/candidate/notifications', element: _jsx(CandidateNotifications, {}) },
            { path: '/candidate/settings', element: _jsx(CandidateSettings, {}) },
            { path: '/candidate/profile', element: _jsx(CandidateProfile, {}) },
        ],
    },
    // ── Recruiter Portal ───────────────────────────────────
    {
        element: _jsx(AuthLayout, { requiredRole: "recruiter" }),
        children: [
            { path: '/recruiter/dashboard', element: _jsx(RecruiterDashboard, {}) },
            { path: '/recruiter/jobs', element: _jsx(RecruiterJobs, {}) },
            { path: '/recruiter/jobs/create', element: _jsx(RecruiterCreateJob, {}) },
            { path: '/recruiter/candidates', element: _jsx(RecruiterCandidates, {}) },
            { path: '/recruiter/screening', element: _jsx(RecruiterScreening, {}) },
            { path: '/recruiter/rankings', element: _jsx(RecruiterRankings, {}) },
            { path: '/recruiter/analytics', element: _jsx(RecruiterAnalytics, {}) },
            { path: '/recruiter/profile', element: _jsx(RecruiterProfile, {}) },
        ],
    },
    // ── Admin Portal ───────────────────────────────────────
    {
        element: _jsx(AuthLayout, { requiredRole: "admin" }),
        children: [
            { path: '/admin/dashboard', element: _jsx(AdminDashboard, {}) },
            { path: '/admin/users', element: _jsx(AdminUsers, {}) },
            { path: '/admin/recruiters', element: _jsx(AdminRecruiters, {}) },
            { path: '/admin/jobs', element: _jsx(AdminJobs, {}) },
            { path: '/admin/analytics', element: _jsx(AdminAnalytics, {}) },
            { path: '/admin/logs', element: _jsx(AdminLogs, {}) },
        ],
    },
    // ── 404 fallback ───────────────────────────────────────
    { path: '*', element: _jsx(NotFoundPage, {}) },
]);
export const AppRouter = () => {
    return _jsx(RouterProvider, { router: router });
};
export default AppRouter;
