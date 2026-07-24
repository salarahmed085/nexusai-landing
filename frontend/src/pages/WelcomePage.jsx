import { Link } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">You're all set 🎉</h1>
        <p className="text-dark-400 mb-8">
          Thanks for subscribing! Your plan is now active — it may take a few seconds to reflect on your dashboard.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
