const variants = {
  tasks: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-400">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'No tasks yet',
    description: 'Create your first task to start organizing your work. Track progress, set priorities, and stay productive.',
    gradient: 'from-brand-500/10 to-purple-500/10',
    ring: 'ring-brand-500/20',
  },
  'tasks-filtered': {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-yellow-400">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'No matching tasks',
    description: 'Try adjusting your search query or clearing the active filters to see your tasks.',
    gradient: 'from-yellow-500/10 to-orange-500/10',
    ring: 'ring-yellow-500/20',
  },
  market: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-green-400">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'No market data available',
    description: "We couldn't load any market data right now. This could be a temporary issue with the data provider.",
    gradient: 'from-green-500/10 to-emerald-500/10',
    ring: 'ring-green-500/20',
  },
  'market-filtered': {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dark-400">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'No coins found',
    description: "Try adjusting your search query to find the cryptocurrency you're looking for.",
    gradient: 'from-dark-800/50 to-dark-800/30',
    ring: 'ring-dark-700/30',
  },
  dashboard: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-purple-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: 'Nothing here yet',
    description: 'Your dashboard will come alive as you start creating tasks and exploring market data.',
    gradient: 'from-purple-500/10 to-pink-500/10',
    ring: 'ring-purple-500/20',
  },
};

export default function EmptyState({ variant = 'tasks', actionLabel, onAction }) {
  const config = variants[variant] || variants.tasks;

  return (
    <div className="text-center py-16 animate-fade-in-up">
      {/* Icon container */}
      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${config.gradient} ring-1 ${config.ring} mb-6`}>
        {config.icon}
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
      <p className="text-dark-400 max-w-sm mx-auto mb-6 leading-relaxed">{config.description}</p>

      {/* CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
