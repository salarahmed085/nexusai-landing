import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../services/api.js';

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.getInsights();
      setInsight(res.data.insight);
      setAiEnabled(res.data.aiEnabled);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-brand-500/20 bg-gradient-to-br from-brand-500/5 via-purple-500/5 to-transparent animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-purple-400">
            <path d="M12 2L14.5 9H21.5L15.5 13.5L18 20.5L12 16L6 20.5L8.5 13.5L2.5 9H9.5L12 2Z" />
          </svg>
          AI Task Insights
        </h2>
        <button
          onClick={fetchInsight}
          disabled={loading}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-4/5 rounded skeleton-shimmer" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-400">Couldn't generate insights right now.</p>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm text-dark-200 leading-relaxed">{insight}</p>
          {!aiEnabled && (
            <p className="mt-3 text-xs text-dark-500">
              Add a <span className="font-mono">GROQ_API_KEY</span> in <span className="font-mono">server/.env</span> to enable live LLM-generated insights.
            </p>
          )}
        </>
      )}
    </div>
  );
}
