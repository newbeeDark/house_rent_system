import React, { useMemo, useState, useEffect } from "react";

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const describeArcShape = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
  return d;
}

const CountUp = ({ end, duration = 1000 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(ease * end));
      if (progress < duration) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <>{count}</>;
};

export interface DonutChartData { label: string; value: number; color: string; }
export interface NeoDonutChartProps { data: DonutChartData[]; }

export const NeoDonutChart: React.FC<NeoDonutChartProps> = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const size = 300, center = size / 2, innerRadius = 55, baseThickness = 25, variableThickness = 35;
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const runtime = timestamp - start;
      const p = Math.min(runtime / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setProgress(ease);
      if (runtime < duration) requestAnimationFrame(animate);
      else setShowLegend(true);
    };
    requestAnimationFrame(animate);
  }, []);

  const segments = useMemo(() => {
    let cumulativeAngle = 0;
    const wipeAngle = progress * 360;
    return data.map((item, _i) => {
      const sweepAngle = (item.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sweepAngle;
      cumulativeAngle += sweepAngle;
      let visibleStart = startAngle;
      let visibleEnd = endAngle;
      if (visibleStart > wipeAngle) visibleEnd = visibleStart;
      else if (visibleEnd > wipeAngle) visibleEnd = wipeAngle;
      const isVisible = visibleEnd > visibleStart;
      const thickness = baseThickness + (item.value / maxVal) * variableThickness;
      const outerRadius = innerRadius + thickness;
      const midAngle = startAngle + sweepAngle / 2;
      return { ...item, startAngle: visibleStart, endAngle: visibleEnd, outerRadius, midAngle, thickness, isVisible, originalEnd: endAngle };
    });
  }, [data, total, progress, maxVal]);

  return (
    <div className="flex items-center w-full h-full gap-2">
      <div className="w-[120px] flex flex-col justify-center items-end text-right pr-2 shrink-0 h-full relative">
        <div className="flex flex-col items-end transition-opacity duration-300 absolute right-2" style={{ opacity: hoveredIndex !== null ? 1 : 0 }}>
          {activeItem && (
            <>
              <div className="text-3xl font-black tracking-tighter" style={{ color: activeItem.color }}>
                {activeItem.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 break-words w-full">
                {activeItem.label}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="relative flex-1 h-full flex items-center justify-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible" style={{ maxWidth: '300px' }}>
          <circle cx={center} cy={center} r={innerRadius - 5} fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={center + (innerRadius - 10) * Math.cos(i * 30 * Math.PI / 180)}
              y1={center + (innerRadius - 10) * Math.sin(i * 30 * Math.PI / 180)}
              x2={center + (innerRadius - 2) * Math.cos(i * 30 * Math.PI / 180)}
              y2={center + (innerRadius - 2) * Math.sin(i * 30 * Math.PI / 180)}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          ))}
          {segments.map((seg, i) => {
            if (!seg.isVisible) return null;
            const isHovered = hoveredIndex === i;
            const d = describeArcShape(center, center, innerRadius, seg.outerRadius, seg.startAngle, seg.endAngle);
            const startP = polarToCartesian(center, center, seg.outerRadius + 4, seg.midAngle);
            // Indicator line calculation
            const lineStart = polarToCartesian(center, center, seg.outerRadius + 8, seg.midAngle);
            // We want the line to point to the left side where the text is displayed
            // The text is vertically centered in the left column.
            // The SVG is centered. So we point to (0, center) or slightly outside to the left (-40, center).
            const lineEnd = { x: -20, y: center };

            return (
              <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                <path d={d} fill={seg.color} stroke="white" strokeWidth="1.5" className="transition-all duration-200" style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.3 : 1,
                  transformOrigin: `${center}px ${center}px`,
                  transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                  filter: isHovered ? `drop-shadow(0 4px 6px ${seg.color}66)` : 'none'
                }} />
                <circle cx={startP.x} cy={startP.y} r="2.8" fill={seg.color} opacity={0.9} />
                <circle cx={startP.x} cy={startP.y} r="1.2" fill="white" />

                {/* Indicator Line (Only when hovered) */}
                {isHovered && (
                  <>
                    <path d={`M ${lineStart.x},${lineStart.y} L ${lineEnd.x},${lineEnd.y}`}
                      fill="none" stroke="black" strokeWidth="1.5"
                      strokeDasharray="300" strokeDashoffset="0"
                      className="animate-draw-line"
                    >
                      <animate attributeName="stroke-dashoffset" from="300" to="0" dur="0.4s" fill="freeze" />
                    </path>
                    <circle cx={lineStart.x} cy={lineStart.y} r="2" fill="black" />
                    <circle cx={lineEnd.x} cy={lineEnd.y} r="2" fill="black" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-black tracking-tight text-slate-800">
              <CountUp end={total} duration={1200} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </div>
          </div>
        </div>
      </div>
      <div className="w-[180px] shrink-0 h-full flex flex-col justify-center pl-2">
        <div className="space-y-2 transition-opacity duration-500" style={{ opacity: showLegend ? 1 : 0 }}>
          {segments.slice(0, 11).map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}></span>
              <span className="text-xs font-bold text-slate-600 truncate">{seg.label}</span>
              <span className="ml-auto text-xs text-slate-400">{Math.round(seg.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
