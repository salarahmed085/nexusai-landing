import { Link } from 'react-router-dom';
import MarketSection from '../components/MarketSection.jsx';
import { Logo } from '../components/Icons.jsx';

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <nav className="border-b border-dark-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold">NexusAI</span>
          </Link>
          <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>
      <MarketSection />
    </div>
  );
}
