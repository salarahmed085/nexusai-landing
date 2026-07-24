import { API_ORIGIN } from '../config.js';

const statusConfig = {
  'Pending': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  'In Progress': { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
  'Completed': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
};

const priorityConfig = {
  'Low': { bg: 'bg-dark-700/50', text: 'text-dark-400' },
  'Medium': { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  'High': { bg: 'bg-red-500/10', text: 'text-red-400' },
};

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskCard({ task, index, onEdit, onDelete }) {
  const status = statusConfig[task.status] || statusConfig['Pending'];
  const priority = priorityConfig[task.priority] || priorityConfig['Medium'];

  return (
    <div 
      className="group glass-card rounded-2xl p-5 hover:border-brand-500/20 card-glow transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 pr-2">
          {task.ticketKey && (
            <span className="inline-block mb-1 text-[11px] font-mono font-semibold text-dark-500 tracking-wide">
              {task.ticketKey}
            </span>
          )}
          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-brand-400 transition-colors">
            {task.title}
          </h3>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg text-dark-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-dark-400 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
          {task.status}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${priority.bg} ${priority.text}`}>
          {task.priority} Priority
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-dark-800/50">
        <div className="flex items-center gap-1.5 text-xs text-dark-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(task.createdAt)}
        </div>
        {task.attachmentPath && (
          <a
            href={`${API_ORIGIN}${task.attachmentPath}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
            title={task.attachmentName}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            Attachment
          </a>
        )}
      </div>
    </div>
  );
}
