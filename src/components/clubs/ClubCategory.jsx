import React from 'react';

const ClubCategory = ({ activeCategory, onCategoryChange }) => {
  // Updated to match the categories available in your ClubManagement creation form
  const categories = ['All', 'Academic', 'Social', 'Sports', 'Religious', 'Entrepreneurship', 'Faculty'];

  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border
              ${isActive 
                ? 'bg-brand text-white border-brand shadow-xl shadow-brand/20 scale-105' 
                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-brand/30 hover:text-brand dark:hover:text-brand'
              }
            `}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default ClubCategory;