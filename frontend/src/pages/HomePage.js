import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, People, TrendingUp, FlashOn, Notifications as NotificationsIcon, RocketLaunch } from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';
export const HomePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            const dashboards = {
                candidate: '/candidate/dashboard',
                recruiter: '/recruiter/dashboard',
                admin: '/admin/dashboard',
            };
            const path = dashboards[user.role];
            if (path)
                navigate(path, { replace: true });
        }
    }, [isAuthenticated, user?.role, navigate]);
    if (isAuthenticated) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }), _jsx("p", { className: "mt-4 text-gray-600 dark:text-zinc-400", children: "Redirecting..." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-20", children: [_jsx("section", { className: "relative py-20 sm:py-32", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6", children: [_jsx(RocketLaunch, { style: { fontSize: 16 } }), " AI-Powered Recruitment Platform"] }), _jsxs("h1", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight", children: ["Smart Resume Screening", _jsx("span", { className: "block gradient-text mt-2", children: "Made Simple" })] }), _jsx("p", { className: "text-lg sm:text-xl text-gray-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed", children: "Find the best candidates faster. Our AI-powered platform analyzes resumes, ranks candidates, and automates your hiring process." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs(Link, { to: "/register", className: "btn-primary text-lg px-8 py-3.5 shadow-lg shadow-blue-500/25", children: ["Get Started Free", _jsx(ArrowRight, { style: { fontSize: 20 } })] }), _jsx(Link, { to: "/login", className: "btn-secondary text-lg px-8 py-3.5", children: "Sign In" })] })] }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center", children: "Powerful Features" }), _jsx("p", { className: "text-gray-500 dark:text-zinc-400 text-center mb-12 max-w-xl mx-auto", children: "Everything you need to streamline your recruitment pipeline." }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children max-w-3xl mx-auto", children: [
                                {
                                    icon: _jsx(FlashOn, { style: { fontSize: 28 } }),
                                    title: 'AI Resume Screening',
                                    description: 'Automatically parse and analyze resumes using advanced NLP to extract skills, experience, and education.',
                                    color: 'from-blue-500 to-indigo-600',
                                },
                                {
                                    icon: _jsx(TrendingUp, { style: { fontSize: 28 } }),
                                    title: 'Smart Job Matching',
                                    description: 'Match candidates to jobs with semantic AI scoring — not just keyword matching.',
                                    color: 'from-emerald-500 to-teal-600',
                                },
                                {
                                    icon: _jsx(People, { style: { fontSize: 28 } }),
                                    title: 'Application Tracking',
                                    description: 'Track applications through every stage — from applied to interview to selection.',
                                    color: 'from-purple-500 to-indigo-600',
                                },
                                {
                                    icon: _jsx(NotificationsIcon, { style: { fontSize: 28 } }),
                                    title: 'Real-time Notifications',
                                    description: 'Get instant updates when candidates apply or when your application status changes.',
                                    color: 'from-amber-500 to-orange-600',
                                },
                            ].map((feature, idx) => (_jsxs("div", { className: "card-elevated p-6 card-hover group", children: [_jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`, children: feature.icon }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: feature.title }), _jsx("p", { className: "text-gray-600 dark:text-zinc-400 text-sm leading-relaxed", children: feature.description })] }, idx))) })] }) }), _jsx("section", { className: "py-16 bg-gray-50 dark:bg-[#0D0D0D] rounded-2xl mx-4", children: _jsx("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger-children", children: [
                            { value: '10,000+', label: 'Resumes Processed' },
                            { value: '500+', label: 'Companies Trust Us' },
                            { value: '94%', label: 'Screening Accuracy' },
                            { value: '3x', label: 'Faster Hiring' },
                        ].map((stat, idx) => (_jsxs("div", { children: [_jsx("p", { className: "text-3xl sm:text-4xl font-bold gradient-text", children: stat.value }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 mt-1", children: stat.label })] }, idx))) }) }) }), _jsxs("section", { className: "py-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-4 relative overflow-hidden", children: [_jsx("div", { className: "absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" }), _jsx("div", { className: "absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10", children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "Ready to transform your hiring?" }), _jsx("p", { className: "text-blue-100 mb-8 max-w-lg mx-auto", children: "Join hundreds of companies that use ResumeRank AI to find the perfect candidates." }), _jsxs(Link, { to: "/register", className: "inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg transition-all hover:shadow-lg", children: ["Start Free Trial", _jsx(ArrowRight, { style: { fontSize: 20 } })] })] })] })] }));
};
export default HomePage;
