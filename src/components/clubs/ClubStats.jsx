import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ClubStats = ({ label, value, icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all shadow-sm hover:shadow-md">
      {/* The colorClass prop should pass both background and text colors 
          e.g., "bg-brand/10 text-brand" or "bg-blue-50 dark:bg-blue-500/10 text-blue-500" 
      */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClass}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
          {label}
        </p>
        <p className="text-xl font-syne font-black text-slate-900 dark:text-white leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};

export default ClubStats;