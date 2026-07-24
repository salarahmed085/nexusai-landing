import { TrendingUpIcon, TrendingDownIcon } from './Icons.jsx';

function formatPrice(price) {
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(6);
}

function formatMarketCap(marketCap) {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
}

export default function CryptoCard({ coin, index }) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeBg = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <div 
      className="group glass-card rounded-2xl p-5 hover:border-brand-500/30 card-glow transition-all duration-300 animate-fade-in-up cursor-default"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Header: Logo + Name */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img 
            src={coin.image} 
            alt={coin.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-dark-700/50 group-hover:ring-brand-500/30 transition-all"
            loading="lazy"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-[8px] font-bold text-dark-400">
            {coin.market_cap_rank}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white truncate group-hover:text-brand-400 transition-colors">
            {coin.name}
          </h3>
          <p className="text-sm text-dark-500 font-medium uppercase tracking-wide">
            {coin.symbol}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-xs text-dark-500 mb-1">Current Price</p>
        <p className="text-2xl font-bold text-white">
          ${formatPrice(coin.current_price)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* Market Cap */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">Market Cap</span>
          <span className="text-sm font-semibold text-dark-200">
            {formatMarketCap(coin.market_cap)}
          </span>
        </div>

        {/* 24h Change */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">24h Change</span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${changeBg}`}>
            <span className={changeColor}>
              <TrendIcon />
            </span>
            <span className={`text-sm font-bold ${changeColor}`}>
              {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">24h Volume</span>
          <span className="text-sm font-semibold text-dark-200">
            {formatMarketCap(coin.total_volume)}
          </span>
        </div>
      </div>

      {/* Sparkline Bar (visual decoration) */}
      <div className="mt-4 h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${isPositive ? 'bg-gradient-to-r from-green-500/60 to-green-400/60' : 'bg-gradient-to-r from-red-500/60 to-red-400/60'}`}
          style={{ width: `${Math.min(Math.abs(coin.price_change_percentage_24h) * 3, 100)}%` }}
        />
      </div>
    </div>
  );
}
