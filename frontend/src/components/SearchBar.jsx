import { useState } from 'react';
import { SearchIcon } from './Icons.jsx';

export default function SearchBar({ value, onChange, resultCount }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div 
        className={`relative flex items-center transition-all duration-300 rounded-xl ${
          isFocused 
            ? 'ring-2 ring-brand-500/50 shadow-lg shadow-brand-500/10' 
            : 'ring-1 ring-dark-700/50'
        }`}
      >
        <div className="absolute left-4 text-dark-500">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search coins by name or symbol..."
          className="w-full pl-12 pr-4 py-3.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 text-dark-500 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {resultCount !== undefined && (
        <div className="mt-3 text-center">
          <span className="text-sm text-dark-500">
            Showing <span className="text-brand-400 font-semibold">{resultCount}</span> results
          </span>
        </div>
      )}
    </div>
  );
}
