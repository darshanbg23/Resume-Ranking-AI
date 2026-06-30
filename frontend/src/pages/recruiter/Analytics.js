import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/PageHeader';
import StatsCard from '@components/StatsCard';
import EmptyState from '@components/EmptyState';
import { Work, People, CheckCircle, Cancel, Star, TrendingUp, BarChart as BarChartIcon, PieChart as PieChartIcon, EmojiEvents, Add, WorkOff, ThumbUp } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import apiClient from '../../services/api';
const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (_jsxs("div", { className: "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg px-3 py-2", children: [_jsx("p", { className: "text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]", children: label }), _jsxs("p", { className: "text-xs text-blue-600 dark:text-blue-400 mt-0.5", children: [payload[0].value, " application", payload[0].value !== 1 ? 's' : ''] })] }));
    }
    return null;
};
const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (_jsxs("div", { className: "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg px-3 py-2", children: [_jsx("p", { className: "text-xs font-bold", style: { color: payload[0].payload.color }, children: payload[0].name }), _jsxs("p", { className: "text-xs text-gray-600 dark:text-zinc-400 mt-0.5", children: [payload[0].value, " application", payload[0].value !== 1 ? 's' : ''] })] }));
    }
    return null;
};
export const RecruiterAnalytics = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await apiClient.get('/recruiter/analytics/');
                if (res.data.status) {
                    setData(res.data.data);
                }
                else {
                    setError(true);
                }
            }
            catch (err) {
                console.error('Failed to load analytics:', err);
                setError(true);
            }
            finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);
    if (loading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Analytics", description: "Recruitment analytics and insights." }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [1, 2, 3, 4].map(i => _jsx("div", { className: "h-28 skeleton rounded-xl" }, i)) }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [5, 6, 7, 8].map(i => _jsx("div", { className: "h-28 skeleton rounded-xl" }, i)) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsx("div", { className: "h-72 skeleton rounded-xl" }), _jsx("div", { className: "h-72 skeleton rounded-xl" })] })] }));
    }
    if (error || !data) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Analytics", description: "Recruitment analytics and insights." }), _jsx(EmptyState, { title: "Failed to Load Analytics", description: "Something went wrong while loading your analytics. Please try again." })] }));
    }
    const hasJobs = data.total_jobs > 0;
    const hasApplications = data.total_applications > 0;
    // Truncate job titles for chart display
    const barChartData = data.applications_per_job.map(j => ({
        ...j,
        short_title: j.job_title.length > 22 ? j.job_title.slice(0, 20) + '…' : j.job_title,
    }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Analytics", description: "Your recruitment analytics and insights \u2014 all data shown is specific to your account.", action: !hasJobs ? (_jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary", children: [_jsx(Add, { style: { fontSize: 18 } }), " Post Your First Job"] })) : undefined }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children", children: [_jsx(StatsCard, { title: "Total Jobs Posted", value: data.total_jobs, icon: _jsx(Work, { style: { fontSize: 22 } }), color: "blue", variant: "gradient" }), _jsx(StatsCard, { title: "Active Jobs", value: data.active_jobs, icon: _jsx(CheckCircle, { style: { fontSize: 22 } }), color: "emerald", variant: "gradient" }), _jsx(StatsCard, { title: "Closed Jobs", value: data.closed_jobs, icon: _jsx(WorkOff, { style: { fontSize: 22 } }), color: "orange", variant: "gradient" }), _jsx(StatsCard, { title: "Total Applications", value: data.total_applications, icon: _jsx(People, { style: { fontSize: 22 } }), color: "purple", variant: "gradient" })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children", children: [_jsx(StatsCard, { title: "Shortlisted", value: data.shortlisted, icon: _jsx(Star, { style: { fontSize: 22 } }), color: "indigo", description: "Candidates shortlisted" }), _jsx(StatsCard, { title: "Selected", value: data.selected, icon: _jsx(ThumbUp, { style: { fontSize: 22 } }), color: "green", description: "Candidates selected" }), _jsx(StatsCard, { title: "Rejected", value: data.rejected, icon: _jsx(Cancel, { style: { fontSize: 22 } }), color: "red", description: "Candidates rejected" }), _jsx(StatsCard, { title: "Avg Match Score", value: data.avg_match_score > 0 ? `${data.avg_match_score}%` : 'N/A', icon: _jsx(TrendingUp, { style: { fontSize: 22 } }), color: "pink", description: "Across all applicants" })] }), hasApplications ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card-base p-6", children: [_jsxs("h3", { className: "section-header flex items-center gap-2 mb-4", children: [_jsx(BarChartIcon, { style: { fontSize: 20 }, className: "text-blue-500" }), "Applications Per Job"] }), barChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: Math.max(240, barChartData.length * 48), children: _jsxs(BarChart, { data: barChartData, layout: "vertical", margin: { top: 0, right: 24, bottom: 0, left: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }), _jsx(XAxis, { type: "number", allowDecimals: false, tick: { fontSize: 12 } }), _jsx(YAxis, { type: "category", dataKey: "short_title", width: 140, tick: { fontSize: 11 } }), _jsx(Tooltip, { content: _jsx(CustomTooltipBar, {}) }), _jsx(Bar, { dataKey: "application_count", name: "Applications", radius: [0, 6, 6, 0], maxBarSize: 28, children: barChartData.map((_entry, index) => (_jsx(Cell, { fill: index % 2 === 0 ? '#3b82f6' : '#6366f1' }, `bar-${index}`))) })] }) })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 py-8 text-center", children: "No application data to chart." }))] }), _jsxs("div", { className: "card-base p-6", children: [_jsxs("h3", { className: "section-header flex items-center gap-2 mb-4", children: [_jsx(PieChartIcon, { style: { fontSize: 20 }, className: "text-purple-500" }), "Application Status Breakdown"] }), data.status_distribution.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data.status_distribution, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 3, dataKey: "value", nameKey: "name", stroke: "none", children: data.status_distribution.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { content: _jsx(CustomTooltipPie, {}) }), _jsx(Legend, { iconType: "circle", iconSize: 8, formatter: (value) => (_jsx("span", { className: "text-xs text-gray-600 dark:text-zinc-400", children: value })) })] }) })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 py-8 text-center", children: "No status data available." }))] })] })) : hasJobs ? (_jsxs("div", { className: "card-base p-8 text-center", children: [_jsx(People, { style: { fontSize: 48 }, className: "text-gray-300 dark:text-zinc-600 mx-auto mb-3" }), _jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-1", children: "No Applications Yet" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto", children: "Your jobs haven't received any applications yet. Charts and detailed analytics will appear here once candidates start applying." })] })) : null, hasJobs && (_jsxs("div", { className: "card-base p-6", children: [_jsxs("h3", { className: "section-header flex items-center gap-2 mb-4", children: [_jsx(EmojiEvents, { style: { fontSize: 20 }, className: "text-amber-500" }), "Top ", Math.min(5, data.top_5_jobs.length), " Jobs by Applications"] }), data.top_5_jobs.length > 0 && data.top_5_jobs.some(j => j.application_count > 0) ? (_jsx("div", { className: "space-y-3", children: data.top_5_jobs.filter(j => j.application_count > 0).map((job, i) => {
                            const maxApps = data.top_5_jobs[0].application_count || 1;
                            const pct = Math.round((job.application_count / maxApps) * 100);
                            return (_jsxs("div", { className: "group", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                            : i === 1 ? 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                                                                : i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                                                                    : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'}`, children: i + 1 }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: job.job_title }), job.company_name && (_jsxs("span", { className: "text-xs text-gray-400 dark:text-zinc-500 hidden sm:inline", children: ["\u2022 ", job.company_name] })), _jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${job.is_active
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`, children: job.is_active ? 'Active' : 'Closed' })] }), _jsx("span", { className: "text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 ml-3", children: job.application_count })] }), _jsx("div", { className: "h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden ml-8", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-indigo-500", style: { width: `${pct}%` } }) })] }, job.job_id));
                        }) })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 py-4 text-center", children: "No applications received yet across your jobs." }))] })), hasJobs && data.applications_per_job.length > 5 && (_jsxs("div", { className: "card-base overflow-hidden", children: [_jsx("div", { className: "p-5 border-b border-gray-200 dark:border-zinc-800", children: _jsx("h3", { className: "section-header", children: "All Jobs \u2014 Application Summary" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50 dark:bg-zinc-900 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase", children: [_jsx("th", { className: "text-left p-3", children: "Job Title" }), _jsx("th", { className: "text-left p-3 hidden sm:table-cell", children: "Company" }), _jsx("th", { className: "text-center p-3", children: "Status" }), _jsx("th", { className: "text-center p-3", children: "Applications" })] }) }), _jsx("tbody", { children: data.applications_per_job.map(job => (_jsxs("tr", { className: "border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors", children: [_jsx("td", { className: "p-3 font-medium text-gray-900 dark:text-white", children: job.job_title }), _jsx("td", { className: "p-3 text-gray-500 dark:text-zinc-400 hidden sm:table-cell", children: job.company_name || '—' }), _jsx("td", { className: "p-3 text-center", children: _jsx("span", { className: `px-2 py-0.5 text-[10px] font-semibold rounded-full ${job.is_active
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`, children: job.is_active ? 'Active' : 'Closed' }) }), _jsx("td", { className: "p-3 text-center font-bold text-gray-900 dark:text-white", children: job.application_count })] }, job.job_id))) })] }) })] })), !hasJobs && (_jsxs("div", { className: "card-base p-10 text-center", children: [_jsx(Work, { style: { fontSize: 52 }, className: "text-gray-300 dark:text-zinc-600 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "No Jobs Posted Yet" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-zinc-400 max-w-lg mx-auto mb-6", children: "Start by posting a job to begin receiving applications. Your recruitment analytics \u2014 including application trends, candidate scores, and status breakdowns \u2014 will appear here automatically." }), _jsxs("button", { onClick: () => navigate('/recruiter/jobs/create'), className: "btn-primary", children: [_jsx(Add, { style: { fontSize: 18 } }), " Post a Job"] })] }))] }));
};
export default RecruiterAnalytics;
