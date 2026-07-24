import { useState, useEffect, useMemo, useCallback } from 'react';
import { taskApi } from '../services/api.js';
import DonutChart from './charts/DonutChart.jsx';
import BarChart from './charts/BarChart.jsx';
import LineChart from './charts/LineChart.jsx';

const STATUS_COLORS = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Completed: '#10b981' };
const PRIORITY_COLORS = { Low: '#60a5fa', Medium: '#8b5cf6', High: '#f87171' };
const TIMEFRAME_DAYS = { All: null, '7days': 7, '30days': 30 };

// Fills in zero-count days between the earliest returned day and today so the
// line chart never has gaps, mirroring the previous client-side behavior.
function buildTimeline(byDate, days) {
  const now = new Date();
  const map = {};

  let startDate;
  if (days) {
    startDate = new Date();
    startDate.setDate(now.getDate() - (days - 1));
  } else if (byDate.length > 0) {
    startDate = new Date(byDate[0].day);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(now.getDate() - 9);
    if (startDate > tenDaysAgo) startDate = tenDaysAgo;
  } else {
    startDate = new Date();
    startDate.setDate(now.getDate() - 9);
  }

  const cursor = new Date(startDate);
  while (cursor <= now) {
    const key = cursor.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    map[key] = 0;
    cursor.setDate(cursor.getDate() + 1);
  }

  byDate.forEach(({ day, count }) => {
    const key = new Date(day).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    if (map[key] !== undefined) map[key] += count;
  });

  return Object.entries(map).map(([label, value]) => ({ label, value }));
}

export default function AnalyticsSection() {
  const [timeframeFilter, setTimeframeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskApi.getStats({
        priority: priorityFilter,
        days: TIMEFRAME_DAYS[timeframeFilter],
      });
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, timeframeFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const donutData = useMemo(() => {
    const counts = { Pending: 0, 'In Progress': 0, Completed: 0 };
    (stats?.byStatus || []).forEach(row => { counts[row.status] = row.count; });
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }));
  }, [stats]);

  const barData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    (stats?.byPriority || []).forEach(row => { counts[row.priority] = row.count; });
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: PRIORITY_COLORS[label] }));
  }, [stats]);

  const lineData = useMemo(() => {
    return buildTimeline(stats?.byDate || [], TIMEFRAME_DAYS[timeframeFilter]);
  }, [stats, timeframeFilter]);

  const totalTasks = stats?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-dark-900/40 border border-dark-800/60 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white mb-0.5">Task Productivity Insights</h2>
          <p className="text-xs text-dark-500">Analyze performance, priorities, and workflow trends</p>
        </div>

        {/* Interactive Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex bg-dark-950/80 p-1 rounded-xl border border-dark-800">
            {[
              { id: 'All', label: 'All Time' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframeFilter(tf.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeframeFilter === tf.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Priority selector */}
          <div className="flex bg-dark-950/80 p-1 rounded-xl border border-dark-800">
            {[
              { id: 'All', label: 'All priorities' },
              { id: 'High', label: 'High' },
              { id: 'Medium', label: 'Medium' },
              { id: 'Low', label: 'Low' },
            ].map(pr => (
              <button
                key={pr.id}
                onClick={() => setPriorityFilter(pr.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  priorityFilter === pr.id
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/10'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-dark-800/40 h-64 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full skeleton-shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-dark-900/20 border border-dark-850 rounded-2xl p-12 text-center">
          <p className="text-sm text-red-400">Failed to load productivity insights.</p>
          <button onClick={fetchStats} className="mt-3 text-xs font-semibold text-brand-400 hover:text-brand-300">
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && totalTasks === 0 && (
        <div className="bg-dark-900/20 border border-dark-850 rounded-2xl p-12 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-dark-500 mb-3">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          <h3 className="text-base font-bold text-white mb-1">No productivity data found</h3>
          <p className="text-xs text-dark-500 max-w-xs mx-auto">
            Try adjusting your active timeframe or priority filters to analyze metrics.
          </p>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && totalTasks > 0 && (
        <div className="space-y-6">
          {/* Row 1: Donut + Bar share the row evenly — no dead space */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-5 border border-dark-800/40 hover:border-dark-700/30 transition-all flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Status Breakdown</h3>
                <p className="text-[11px] text-dark-500">Distribution of active task states</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <DonutChart data={donutData} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-dark-800/40 hover:border-dark-700/30 transition-all flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Priority Counts</h3>
                <p className="text-[11px] text-dark-500">Tasks categorized by priority level</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <BarChart data={barData} />
              </div>
            </div>
          </div>

          {/* Row 2: Line chart takes the full width */}
          <div className="glass-card rounded-2xl p-5 border border-dark-800/40 hover:border-dark-700/30 transition-all flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Task Creation Timeline</h3>
              <p className="text-[11px] text-dark-500">Velocity of tasks logged over time</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LineChart data={lineData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
