import React, { useState } from "react";

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface NeoBarChartProps {
  data: BarChartData[];
  color?: string;
}

export const NeoBarChart: React.FC<NeoBarChartProps> = ({
  data,
  color = "#3b82f6"
}) => {
  // Limit to top 8 items
  const limitedData = data.slice(0, 8);
  const max = Math.max(...limitedData.map(d => d.value)) * 1.1;

  // Track which bar is being hovered
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="h-56 flex flex-col">
      {/* Full Property Name Display - Above Chart */}
      <div
        className="px-4 mb-4"
        style={{
          height: '32px',
          visibility: hoveredIndex !== null ? 'visible' : 'hidden'
        }}
      >
        <div className="flex items-center justify-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-1.5">
            <span className="text-sm font-semibold text-slate-800">
              {hoveredIndex !== null ? limitedData[hoveredIndex]?.label : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="flex-1 flex items-end justify-between gap-3 px-4">
        {limitedData.map((item, i) => {
          const height = (item.value / max) * 100;
          const barColor = item.color || color;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-3 group h-full justify-end cursor-pointer"
              style={{ minWidth: 0, maxWidth: '80px' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative w-full max-w-[36px] h-full flex items-end mx-auto">
                <div className="absolute bottom-0 w-full h-full bg-slate-100/50 rounded-sm"></div>
                <div
                  className="w-full rounded-t-sm relative transition-all duration-300 group-hover:brightness-110"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}cc 100%)`,
                    borderTop: `1px solid rgba(255,255,255,0.5)`,
                    animation: `growUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${i * 0.05}s`,
                    transformOrigin: 'bottom',
                    transform: 'scaleY(0)'
                  }}
                >
                  {/* Value tooltip on top of bar */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10 shadow-xl">
                    {item.value}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              {/* Show abbreviated label, fade when hovering */}
              <span
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center transition-opacity duration-200"
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  opacity: isHovered ? 0.3 : 1
                }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>



      <style>{`
        @keyframes growUp { to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
};
