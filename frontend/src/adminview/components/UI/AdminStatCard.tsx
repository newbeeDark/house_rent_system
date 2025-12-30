import React from "react";
import { Card } from "./AdminCard";

export interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon: Icon, className = "" }) => (
  <Card className={`hover:shadow-lg transition-shadow duration-300 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-sm">
        <Icon width={24} height={24} />
      </div>
      <div className={`admin-badge ${trendUp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
    </div>
  </Card>
);

