import { Logo } from './Icons.jsx';

export default function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 gap-6">
      {/* Animated logo ring */}
      <div className="relative">
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-brand-500/20 animate-ping" 
             style={{ animationDuration: '2s' }} />
        <div className="relative w-20 h-20 rounded-full bg-dark-900/80 border border-dark-800/50 flex items-center justify-center backdrop-blur-sm">
          <div className="animate-pulse-slow">
            <Logo />
          </div>
        </div>
      </div>

      {/* Spinner dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-400"
            style={{
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Message */}
      <p className="text-sm text-dark-400 font-medium animate-pulse">{message}</p>
    </div>
  );
}
