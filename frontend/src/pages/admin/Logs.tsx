import React, { useState, useEffect } from 'react';
import PageHeader from '@components/PageHeader';
import EmptyState from '@components/EmptyState';
import { Refresh, PersonAdd, CloudUpload, Psychology } from '@mui/icons-material';
import apiClient from '../../services/api';

interface LogEntry {
  type: string;
  description: string;
  timestamp: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  registration: { icon: <PersonAdd style={{ fontSize: 14 }} />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20', label: 'Registration' },
  upload: { icon: <CloudUpload style={{ fontSize: 14 }} />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20', label: 'Upload' },
  analysis: { icon: <Psychology style={{ fontSize: 14 }} />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20', label: 'AI Analysis' },
};

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/analytics/');
      if (res.data.status) {
        setLogs(res.data.data.recent_activity || []);
      }
    } catch (err) { console.error('Failed:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="View recent platform activity and events."
        action={<button onClick={fetchLogs} className="btn-secondary text-sm"><Refresh style={{ fontSize: 16 }} /> Refresh</button>}
      />

      <div className="flex items-center gap-2">
        {['all', 'registration', 'upload', 'analysis'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>
            {f === 'all' ? 'All Events' : TYPE_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="card-base p-4 h-14 skeleton rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800/50">
          {filtered.map((log, i) => {
            const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.analysis;
            return (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 dark:text-zinc-300">{log.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Activity" description="No recent platform events to display." />
      )}
    </div>
  );
};

export default AdminLogs;
