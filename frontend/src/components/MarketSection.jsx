import { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketContext.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { RefreshIcon, ClockIcon } from './Icons.jsx';
import SearchBar from './SearchBar.jsx';
import CryptoCard from './CryptoCard.jsx';
import LoadingSkeleton from './LoadingSkeleton.jsx';
import ErrorState from './ErrorState.jsx';
import EmptyState from './EmptyState.jsx';

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export default function MarketSection() {
  const { data, loading, error, lastUpdated, refetch } = useMarketData();
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useReveal();

  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  return (
    <section id="market-insights" className="py-20 sm:py-28 px-4">
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Data
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Live AI Market
            <span className="gradient-text"> Insights</span>
          </h2>
          <p className="text-lg text-dark-400">
            Real-time cryptocurrency market data powered by CoinGecko. 
            Track prices, market caps, and trends across the top 50 coins.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            resultCount={!loading && !error ? filteredCoins.length : undefined}
          />

          <div className="flex items-center gap-3 flex-shrink-0">
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-dark-500 bg-dark-800/50 px-3 py-2 rounded-lg border border-dark-700/30">
                <ClockIcon />
                <span>Updated {formatTime(lastUpdated)}</span>
              </div>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-lg text-sm font-medium text-dark-300 hover:text-white hover:border-dark-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshIcon className={loading ? 'animate-spin-slow' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Content States */}
        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {!loading && !error && data.length === 0 && (
          <EmptyState variant="market" actionLabel="Retry" onAction={refetch} />
        )}

        {!loading && !error && data.length > 0 && filteredCoins.length === 0 && (
          <EmptyState variant="market-filtered" />
        )}

        {!loading && !error && filteredCoins.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredCoins.map((coin, index) => (
              <CryptoCard key={coin.id} coin={coin} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
