import { useEffect } from 'react';

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';
  const bgClass = isSuccess ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';
  const textClass = isSuccess ? 'text-green-400' : 'text-red-400';
  const icon = isSuccess ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div className={`glass border ${bgClass} rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg animate-fade-in-up min-w-[280px] max-w-sm`}>
      <span className={textClass}>{icon}</span>
      <p className={`text-sm font-medium ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>
        {toast.message}
      </p>
      <button 
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-dark-500 hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
