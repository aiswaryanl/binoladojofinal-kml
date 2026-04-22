import React from 'react';

interface DashboardCardProps {
  value: number | string;
  label: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ value, label, color }) => (
  <div className={`group relative overflow-hidden rounded-3xl px-8 py-8 flex flex-col items-start w-full h-full min-h-[160px] justify-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] ${color}`}>
    
    {/* Animated background glows */}
    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/40 rounded-full blur-3xl group-hover:scale-150 group-hover:opacity-80 transition-transform duration-700 pointer-events-none"></div>
    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 delay-75 pointer-events-none"></div>

    <div className="relative z-10 w-full font-sans">
      <div className="text-5xl font-black text-gray-800 tracking-tighter mb-2 drop-shadow-sm transform group-hover:scale-105 group-hover:text-blue-900 transition-all duration-300 origin-left">{value}</div>
      <div className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em] opacity-90 group-hover:opacity-100 transition-opacity">{label}</div>
    </div>
  </div>
);

export default DashboardCard;