import React from 'react';

const FeedControls = ({ 
  activeFilter, 
  activeStatusFilter, 
  onFilterChange, 
  onStatusChange 
}) => {
  const mainFilters = ['Global', 'My Faculty'];
  const statusFilters = ['All', 'Student', 'Staff', 'Alumni'];

  return (
    <div className="mb-8 space-y-4">
      {/* Main Filters: Global / My Faculty */}
      <div className="flex gap-3 justify-center flex-wrap">
        {mainFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeFilter === filter 
                ? 'bg-brand text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'
            }`}
          >
            {filter === 'My Faculty' ? 'My Faculty' : filter}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 justify-center flex-wrap">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeStatusFilter === status 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedControls;