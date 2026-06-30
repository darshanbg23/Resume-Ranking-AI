import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import { Refresh, PersonAdd, CloudUpload, Psychology } from '@mui/icons-material';
import apiClient from '../../services/api';
const TYPE_CONFIG = {
    registration: { icon: _jsx(PersonAdd, { style: { fontSize: 14 } }), color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20', label: 'Registration' },
    upload: { icon: _jsx(CloudUpload, { style: { fontSize: 14 } }), color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20', label: 'Upload' },
    analysis: { icon: _jsx(Psychology, { style: { fontSize: 14 } }), color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20', label: 'AI Analysis' },
};
export const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/analytics/');
            if (res.data.status) {
                setLogs(res.data.data.recent_activity || []);
            }
        }
        catch (err) {
            console.error('Failed:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchLogs(); }, []);
    const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Activity Logs", description: "View recent platform activity and events.", action: _jsxs("button", { onClick: fetchLogs, className: "btn-secondary text-sm", children: [_jsx(Refresh, { style: { fontSize: 16 } }), " Refresh"] }) }), _jsx("div", { className: "flex items-center gap-2", children: ['all', 'registration', 'upload', 'analysis'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'}`, children: f === 'all' ? 'All Events' : TYPE_CONFIG[f]?.label || f }, f))) }), loading ? (_jsx("div", { className: "space-y-2", children: [1, 2, 3, 4, 5].map(i => _jsx("div", { className: "card-base p-4 h-14 skeleton rounded-xl" }, i)) })) : filtered.length > 0 ? (_jsx("div", { className: "card-base overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800/50", children: filtered.map((log, i) => {
                    const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.analysis;
                    return (_jsxs("div", { className: "flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors", children: [_jsx("div", { className: `w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`, children: config.icon }), _jsx("div", { className: "min-w-0 flex-1", children: _jsx("p", { className: "text-sm text-gray-700 dark:text-zinc-300", children: log.description }) }), _jsx("span", { className: "text-xs text-gray-400 whitespace-nowrap flex-shrink-0", children: new Date(log.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })] }, i));
                }) })) : (_jsx(EmptyState, { title: "No Activity", description: "No recent platform events to display." }))] }));
};
export default AdminLogs;
