import { useState, useRef } from 'react';

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

export default function LineChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);

  // Dimension details
  const width = 500;
  const height = 240;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-dark-500 text-sm">
        No timeline data available
      </div>
    );
  }

  const values = data.map(d => d.value);
  const rawMax = Math.max(...values, 0);
  const maxVal = getNiceMax(rawMax);
  const yTickCount = Math.min(4, maxVal || 1);
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  // Compute points: X & Y relative coordinates
  const points = data.map((item, idx) => {
    const x = paddingLeft + stepX * idx;
    const y = height - paddingBottom - (item.value / maxVal) * chartHeight;
    return { x, y, label: item.label, value: item.value };
  });

  // Construct SVG Path strings
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    // 1. Line Path
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // 2. Area Path (closed polygon for background gradient fill)
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  // Handle pointer interactions to find nearest node
  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    // Convert clientX to SVG viewBox space ratio
    const svgXRatio = clientX / rect.width;
    const currentSvgX = svgXRatio * width;

    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((pt, i) => {
      const diff = Math.abs(pt.x - currentSvgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setActiveIndex(closestIdx);
  };

  const activePt = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveIndex(null)}
        className="overflow-visible select-none cursor-crosshair"
      >
        <defs>
          {/* Neon line glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Under-line fill gradient */}
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Gridlines */}
        {Array.from({ length: yTickCount + 1 }).map((_, i) => {
          const val = Math.round((maxVal / yTickCount) * i);
          const y = height - paddingBottom - (chartHeight / yTickCount) * i;

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
                className="text-[10px] fill-dark-500 font-semibold"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis Line */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#2d2d35"
          strokeWidth="1.5"
          className="opacity-60"
        />

        {/* Render filled area under the line */}
        {areaPath && (
          <path d={areaPath} fill="url(#areaGrad)" />
        )}

        {/* Render line path */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* X Axis Labels */}
        {points.map((pt, i) => {
          // Display maximum 6 labels on X axis to avoid text overlapping
          const shouldShowLabel = points.length <= 6 || i % Math.ceil(points.length / 6) === 0 || i === points.length - 1;
          if (!shouldShowLabel) return null;

          return (
            <text
              key={i}
              x={pt.x}
              y={height - paddingBottom + 20}
              textAnchor="middle"
              className="text-[10px] fill-dark-400 font-medium"
            >
              {pt.label}
            </text>
          );
        })}

        {/* Interactive Pointer Tracker Crosshair */}
        {activePt && (
          <g>
            {/* Vertical crosshair line */}
            <line
              x1={activePt.x}
              y1={paddingTop}
              x2={activePt.x}
              y2={height - paddingBottom}
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="opacity-80"
            />

            {/* Glowing active point circle */}
            <circle
              cx={activePt.x}
              cy={activePt.y}
              r="6"
              fill="#c084fc"
              stroke="#8b5cf6"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 3px #8b5cf6)' }}
            />

            {/* Float Tooltip inside SVG */}
            <g className="animate-fade-in">
              <rect
                x={activePt.x > width / 2 ? activePt.x - 90 : activePt.x + 10}
                y={activePt.y - 30}
                width="80"
                height="34"
                rx="6"
                fill="#1b1b22"
                stroke="#2d2d35"
                strokeWidth="1"
              />
              <text
                x={activePt.x > width / 2 ? activePt.x - 50 : activePt.x + 50}
                y={activePt.y - 18}
                textAnchor="middle"
                className="text-[9px] fill-dark-400 font-bold"
              >
                {activePt.label}
              </text>
              <text
                x={activePt.x > width / 2 ? activePt.x - 50 : activePt.x + 50}
                y={activePt.y - 6}
                textAnchor="middle"
                className="text-[11px] fill-white font-extrabold"
              >
                {activePt.value} task{activePt.value !== 1 ? 's' : ''}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
