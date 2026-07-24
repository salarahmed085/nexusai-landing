import { useState, useEffect } from 'react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

function deriveKey(name) {
  return name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
}

export default function ProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', description: '', color: COLORS[0] });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const derivedKey = deriveKey(form.name);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    else if (derivedKey.length < 2) errs.name = 'Name needs at least 2 letters (used to build the ticket key)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: form.name.trim(), description: form.description.trim(), color: form.color });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) => `w-full px-4 py-3 bg-dark-800/80 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
    errors[field] ? 'border-red-500/50' : 'border-dark-700/50 hover:border-dark-600'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">New Project</h3>
          <button onClick={onClose} className="text-dark-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Project Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Website Redesign"
              className={inputClass('name')}
              autoFocus
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
            {!errors.name && form.name.trim() && (
              <p className="mt-1.5 text-xs text-dark-500">
                Tickets in this project will look like <span className="font-mono text-brand-400">{derivedKey}-1</span>, <span className="font-mono text-brand-400">{derivedKey}-2</span>...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What is this project about?"
              rows={3}
              className={inputClass('description') + ' resize-none'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color }))}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Choose color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-dark-300 bg-dark-800/80 border border-dark-700 rounded-xl hover:bg-dark-800 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
