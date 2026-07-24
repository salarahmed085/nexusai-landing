import { useState } from 'react';

export default function DonutChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Circle properties
  const radius = 50;
  const strokeWidth = 14;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-dark-500">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={innerRadius}
            fill="none"
            stroke="#2d2d35"
            strokeWidth={strokeWidth}
          />
        </svg>
        <span className="text-xs mt-3">No status data</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* Chart container */}
      <div className="relative w-44 h-44 flex-shrink-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {data.map((item, idx) => {
            const percent = item.value / total;
            const strokeLength = percent * circumference;
            const strokeOffset = circumference - (accumulatedPercent * circumference);
            accumulatedPercent += percent;

            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r={innerRadius}
                fill="none"
                stroke={item.color || '#3b82f6'}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer origin-center"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 4px ${item.color})` : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredIndex !== null ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
                {data[hoveredIndex].label}
              </span>
              <span className="text-2xl font-bold text-white">
                {data[hoveredIndex].value}
              </span>
              <span className="text-[10px] text-dark-500 font-medium">
                {((data[hoveredIndex].value / total) * 100).toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">
                Total Tasks
              </span>
              <span className="text-3xl font-extrabold text-white">
                {total}
              </span>
              <span className="text-[10px] text-dark-500 font-medium">
                Combined
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legends column */}
      <div className="space-y-2 flex-1 min-w-[120px]">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                isHovered ? 'bg-dark-800/60' : 'hover:bg-dark-800/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-dark-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="text-right pl-4">
                <span className="text-sm font-semibold text-white mr-1.5">{item.value}</span>
                <span className="text-xs text-dark-500">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
