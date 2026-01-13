
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  colorClass: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, colorClass, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {subValue && <span className="text-xs font-medium text-slate-400">{subValue}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
