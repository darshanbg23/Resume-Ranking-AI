import React from 'react';
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
import CandidateInterviews from '@pages/candidate/Interviews';
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
import RecruiterInterviews from '@pages/recruiter/Interviews';
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
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
    <div className="text-center animate-fadeIn">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white text-4xl font-bold">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="btn-primary inline-flex"
      >
        Back to Home
      </a>
    </div>
  </div>
);

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // ── Candidate Portal ───────────────────────────────────
  {
    element: <AuthLayout requiredRole="candidate" />,
    children: [
      { path: '/candidate/dashboard', element: <CandidateDashboard /> },
      { path: '/candidate/jobs', element: <CandidateJobs /> },
      { path: '/candidate/jobs/:id', element: <CandidateJobDetails /> },
      { path: '/candidate/applications', element: <CandidateApplications /> },
      { path: '/candidate/resume', element: <CandidateResume /> },
      { path: '/candidate/insights', element: <CandidateInsights /> },
      { path: '/candidate/interviews', element: <CandidateInterviews /> },
      { path: '/candidate/notifications', element: <CandidateNotifications /> },
      { path: '/candidate/settings', element: <CandidateSettings /> },
      { path: '/candidate/profile', element: <CandidateProfile /> },
    ],
  },

  // ── Recruiter Portal ───────────────────────────────────
  {
    element: <AuthLayout requiredRole="recruiter" />,
    children: [
      { path: '/recruiter/dashboard', element: <RecruiterDashboard /> },
      { path: '/recruiter/jobs', element: <RecruiterJobs /> },
      { path: '/recruiter/jobs/create', element: <RecruiterCreateJob /> },
      { path: '/recruiter/candidates', element: <RecruiterCandidates /> },
      { path: '/recruiter/screening', element: <RecruiterScreening /> },
      { path: '/recruiter/rankings', element: <RecruiterRankings /> },
      { path: '/recruiter/interviews', element: <RecruiterInterviews /> },
      { path: '/recruiter/analytics', element: <RecruiterAnalytics /> },
      { path: '/recruiter/profile', element: <RecruiterProfile /> },
    ],
  },

  // ── Admin Portal ───────────────────────────────────────
  {
    element: <AuthLayout requiredRole="admin" />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/users', element: <AdminUsers /> },
      { path: '/admin/recruiters', element: <AdminRecruiters /> },
      { path: '/admin/jobs', element: <AdminJobs /> },
      { path: '/admin/analytics', element: <AdminAnalytics /> },
      { path: '/admin/logs', element: <AdminLogs /> },
    ],
  },

  // ── 404 fallback ───────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
