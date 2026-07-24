import { useState } from 'react';

// Picks a sensible axis ceiling instead of forcing a flat "min 4" on every
// chart — small counts (1, 2, 3) now scale to their own true axis instead of
// being squashed against an oversized fixed ceiling.
function getNiceMax(rawMax) {
  const max = Math.max(rawMax, 1);
  if (max <= 4) return max;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const residual = max / magnitude;
  let niceResidual = 10;
  if (residual <= 1) niceResidual = 1;
  else if (residual <= 2) niceResidual = 2;
  else if (residual <= 5) niceResidual = 5;
  return niceResidual * magnitude;
}

export default function BarChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SVG dimensions
  const width = 450;
  const height = 240;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const rawMax = Math.max(...data.map(d => d.value), 0);
  const maxVal = getNiceMax(rawMax);
  const yTicks = Math.min(4, maxVal || 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-dark-500 text-sm">
        No bar chart data available
      </div>
    );
  }

  // Calculate coordinates for bars
  const stepX = chartWidth / data.length;
  const barWidth = Math.min(30, stepX * 0.5);

  return (
    <div className="relative w-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Horizontal gridlines & Y axis labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = Math.round((maxVal / yTicks) * i);
          const y = height - paddingBottom - (chartHeight / yTicks) * i;

          return (
            <g key={i} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#2d2d35"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-dark-500 font-medium font-sans"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X axis line */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#2d2d35"
          strokeWidth="1.5"
          className="opacity-60"
        />

        {/* Bars and labels */}
        {data.map((item, idx) => {
          const valRatio = item.value / maxVal;
          const barHeight = chartHeight * valRatio;
          const x = paddingLeft + stepX * idx + (stepX - barWidth) / 2;
          const y = height - paddingBottom - barHeight;

          const isHovered = hoveredIndex === idx;

          return (
            <g key={item.label}>
              {/* Bar shadow/glow when hovered */}
              {isHovered && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={barWidth + 4}
                  height={barHeight + 2}
                  rx="6"
                  fill={item.color}
                  className="opacity-20 blur-[3px] transition-all duration-300"
                />
              )}

              {/* Main Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)} // Minimum 2px height so zero-values are slightly visible
                rx="4"
                fill={item.color || '#3b82f6'}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Value label above the bar, always visible */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-[11px] fill-dark-300 font-semibold font-sans"
              >
                {item.value}
              </text>

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-dark-400 font-medium font-sans"
              >
                {item.label}
              </text>

              {/* Interactive Tooltip showing above the hovered bar */}
              {isHovered && (
                <g className="animate-fade-in">
                  <rect
                    x={x + barWidth / 2 - 25}
                    y={y - 30}
                    width="50"
                    height="20"
                    rx="6"
                    fill="#1b1b22"
                    stroke="#2d2d35"
                    strokeWidth="1"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 17}
                    textAnchor="middle"
                    className="text-[10px] fill-white font-bold"
                  >
                    {item.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
