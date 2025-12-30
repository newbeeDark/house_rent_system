import React, { useMemo, useState, useCallback } from "react";

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface NeoLineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

export const NeoLineChart: React.FC<NeoLineChartProps> = ({ 
  data, 
  labels = [],
  color = "#4f46e5", 
  height = 240 
}) => {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 1000;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const max = Math.max(...data) * 1.2 || 10;
  const min = 0;
  const chartId = useMemo(() => generateId(), []);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((val - min) / (max - min)) * chartHeight;
    return [x, y];
  }), [data, chartHeight, chartWidth, max, min]);

  const svgPath = (points: number[][], command: (point: number[], i: number, a: number[][]) => string) => {
    return points.reduce((acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`, "");
  };

  const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return { length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)), angle: Math.atan2(lengthY, lengthX) };
  };

  const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  const bezierCommand = (point: number[], i: number, a: number[][]) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  };

  const pathD = useMemo(() => svgPath(points, bezierCommand), [points]);
  
  // Guard against empty data
  if (points.length === 0) {
      return (
        <div className="w-full relative overflow-hidden rounded-xl bg-slate-50/50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm" style={{ height }}>
            No data available
        </div>
      );
  }

  const fillD = `${pathD} L ${points[points.length-1][0]},${padding.top + chartHeight} L ${points[0][0]},${padding.top + chartHeight} Z`;

  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left * (rect.width / width);
    const effectiveWidth = rect.width * (chartWidth / width);
    
    if (x < 0 || x > effectiveWidth) return;
    
    const idx = Math.round((x / effectiveWidth) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setHoverIndex(clamped);
  }, [data.length, chartWidth, width]);

  const onLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  return (
    <div className="w-full relative overflow-hidden rounded-xl bg-slate-50/50 border border-slate-100" style={{ height }}>
       <div className="absolute inset-0 opacity-20" 
            style={{ 
                backgroundImage: `linear-gradient(${color}20 1px, transparent 1px), linear-gradient(90deg, ${color}20 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}>
       </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full relative z-10 overflow-visible" onMouseMove={onMove} onMouseLeave={onLeave}>
        <defs>
          <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="90%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`clip-${chartId}`}>
             <rect width={width} height={height}>
                <animate attributeName="width" from="0" to={`${width}`} dur="1.4s" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
             </rect>
          </clipPath>
        </defs>
        
        {/* Axes */}
        <g className="text-xs text-slate-400">
            {/* Y Axis */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" opacity="0.2" />
            {/* X Axis */}
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" opacity="0.2" />
            
            {/* Y Labels */}
            {[0, 0.5, 1].map(t => {
                const val = Math.round(min + (max - min) * t);
                const y = padding.top + chartHeight - (t * chartHeight);
                return (
                    <text key={t} x={padding.left - 8} y={y + 4} textAnchor="end" fill="currentColor" fontSize="10">
                        {val}
                    </text>
                );
            })}

            {/* X Labels - show max 5-6 labels */}
            {labels.length > 0 && labels.map((label, i) => {
                const step = Math.ceil(labels.length / 6);
                if (i % step !== 0 && i !== labels.length - 1) return null;
                const x = points[i][0];
                return (
                    <text key={i} x={x} y={height - padding.bottom + 16} textAnchor="middle" fill="currentColor" fontSize="10">
                        {label}
                    </text>
                );
            })}
        </g>

        <g clipPath={`url(#clip-${chartId})`}>
            <path d={fillD} fill={`url(#grad-${chartId})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </g>
        {hoverIndex !== null && (
          <>
            <line x1={points[hoverIndex][0]} y1={points[hoverIndex][1]} x2={points[hoverIndex][0]} y2={height - padding.bottom} stroke={color} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
            <circle cx={points[hoverIndex][0]} cy={points[hoverIndex][1]} r="5" fill={color} />
            <circle cx={points[hoverIndex][0]} cy={points[hoverIndex][1]} r="2" fill="white" />
          </>
        )}
      </svg>
      {hoverIndex !== null && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold bg-white/90 border border-slate-200 text-slate-600 shadow-sm">
          {data[hoverIndex]}
        </div>
      )}
    </div>
  );
};
