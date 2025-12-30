import React from "react";

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

  return (
    <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4">
      {limitedData.map((item, i) => {
        const height = (item.value / max) * 100;
        const barColor = item.color || color;
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end cursor-pointer">
             <div className="relative w-full max-w-[36px] h-full flex items-end">
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
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10 shadow-xl">
                        {item.value}
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                </div>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center group-hover:text-slate-600 transition-colors">
                 {item.label}
             </span>
          </div>
        )
      })}
      <style>{`
        @keyframes growUp { to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
};
