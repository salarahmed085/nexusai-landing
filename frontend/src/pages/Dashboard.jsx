import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { useMarketData } from '../context/MarketContext.jsx';
import { Logo } from '../components/Icons.jsx';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AvatarUpload from '../components/AvatarUpload.jsx';
import AnalyticsSection from '../components/AnalyticsSection.jsx';
import AIInsightsPanel from '../components/AIInsightsPanel.jsx';
import { API_ORIGIN } from '../config.js';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketData();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Task stats
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  // Top 3 coins
  const topCoins = marketData.slice(0, 3);

  const isLoading = tasksLoading && marketLoading;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-dark-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold">NexusAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/billing" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Billing
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 text-sm font-medium transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Show skeleton while both data sources are loading */}
      {isLoading && <DashboardSkeleton />}

      {!isLoading && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-dark-500 text-sm">Your personal overview</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-brand-500/10 border border-brand-500/20 rounded-2xl p-6 mb-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setShowUpload(!showUpload)}
                  className="relative w-16 h-16 rounded-full overflow-hidden border border-brand-500/30 flex-shrink-0 group cursor-pointer"
                  title="Click to update profile photo"
                >
                  {user?.avatarPath ? (
                    <img 
                      src={`${API_ORIGIN}${user.avatarPath}`} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-white truncate">
                    Welcome back, {user?.name || 'User'}
                  </p>
                  <p className="text-dark-400 text-sm truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => setShowUpload(!showUpload)}
                className="self-start sm:self-center px-4 py-2 text-xs font-semibold text-dark-200 bg-dark-900/50 hover:bg-dark-800 border border-dark-800 hover:border-dark-700 rounded-lg transition-all flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {showUpload ? 'Close Uploader' : 'Update Photo'}
              </button>
            </div>

            {/* Collapsible Upload Panel */}
            {showUpload && (
              <div className="mt-6 pt-6 border-t border-dark-800/40 animate-fade-in-up">
                <AvatarUpload />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          {!tasksLoading && !tasksError && totalTasks > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Tasks', value: totalTasks, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                { label: 'Completed', value: completed, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'In Progress', value: inProgress, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Pending', value: pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-xl p-5 border border-dark-800/30 animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-xs sm:text-sm text-dark-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Two-column widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Task Summary Widget */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Task Summary
                </h2>
                <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  View all →
                </Link>
              </div>

              {tasksLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 rounded skeleton-shimmer" style={{ width: `${80 - i * 15}%` }} />
                  ))}
                </div>
              )}

              {tasksError && !tasksLoading && (
                <p className="text-sm text-red-400">Failed to load tasks</p>
              )}

              {!tasksLoading && !tasksError && totalTasks === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-sm text-dark-400">No tasks yet</p>
                  <p className="text-xs text-dark-500 mt-1">Create a project, then add your first ticket</p>
                </div>
              )}

              {!tasksLoading && !tasksError && totalTasks > 0 && (
                <>
                  <div className="space-y-3 mb-5">
                    {[
                      { label: 'Completed', value: completed, color: 'bg-green-400' },
                      { label: 'In Progress', value: inProgress, color: 'bg-blue-400' },
                      { label: 'Pending', value: pending, color: 'bg-yellow-400' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                        <span className="text-sm text-dark-300 flex-1">{item.label}</span>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-dark-500">Completion</span>
                      <span className="text-xs font-semibold text-white">{completionRate}%</span>
                    </div>
                    <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-400 transition-all duration-700 ease-out"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Market Overview Widget */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-400">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Market Overview
                </h2>
                <Link to="/market" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  View all →
                </Link>
              </div>

              {marketLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-20 rounded skeleton-shimmer" />
                        <div className="h-3 w-12 rounded skeleton-shimmer" />
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="h-4 w-16 rounded skeleton-shimmer" />
                        <div className="h-3 w-12 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {marketError && !marketLoading && (
                <p className="text-sm text-red-400">Failed to load market data</p>
              )}

              {!marketLoading && !marketError && topCoins.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <p className="text-sm text-dark-400">No market data</p>
                  <p className="text-xs text-dark-500 mt-1">Market data is temporarily unavailable</p>
                </div>
              )}

              {!marketLoading && !marketError && topCoins.length > 0 && (
                <div className="space-y-4">
                  {topCoins.map((coin, i) => {
                    const priceChange = coin.price_change_percentage_24h || 0;
                    const isPositive = priceChange >= 0;
                    return (
                      <div
                        key={coin.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center text-[8px] font-bold text-dark-400">
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{coin.name}</p>
                          <p className="text-xs text-dark-500 uppercase">{coin.symbol}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-white">
                            ${coin.current_price?.toLocaleString()}
                          </p>
                          <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AI Task Insights */}
          <div className="mb-8">
            <AIInsightsPanel />
          </div>

          {/* Productivity & Analytics Section */}
          <div className="mb-8">
            <AnalyticsSection />
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'New Ticket',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ),
                  color: 'text-brand-400',
                  bg: 'bg-brand-500/10',
                  href: '/projects',
                },
                {
                  label: 'Market Data',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                  color: 'text-green-400',
                  bg: 'bg-green-500/10',
                  href: '/market',
                },
                {
                  label: 'Pricing',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                  color: 'text-yellow-400',
                  bg: 'bg-yellow-500/10',
                  href: '/#pricing',
                },
                {
                  label: 'Request Demo',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                  href: '/#request-demo',
                },
              ].map(action => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`${action.bg} rounded-xl p-4 border border-dark-800/30 hover:border-dark-700/50 transition-all group`}
                >
                  <div className={`${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
                    {action.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
