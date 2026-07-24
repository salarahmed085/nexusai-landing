import { AlertIcon, RefreshIcon } from './Icons.jsx';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
          <span className="text-red-400">
            <AlertIcon />
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3">
          Unable to load live market data
        </h3>

        <p className="text-dark-400 mb-6 leading-relaxed">
          {message || "Something went wrong while fetching the latest cryptocurrency data. Please try again."}
        </p>

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20"
        >
          <RefreshIcon />
          Try Again
        </button>
      </div>
    </div>
  );
}
