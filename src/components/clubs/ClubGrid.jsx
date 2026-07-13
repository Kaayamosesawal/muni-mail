import React from 'react';
import ClubCard from './ClubCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const ClubGrid = ({ clubs, joinedIds, onJoinClub, isLoading }) => {
  
  // 1. Loading State (Skeleton Loaders)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  // 2. Empty State (No clubs found/filtered)
  if (!clubs || clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
          <FontAwesomeIcon icon={faSearch} size="2xl" />
        </div>
        <h3 className="text-xl font-syne font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          No Circles Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-dm max-w-xs mt-2">
          We couldn't find any organizations matching your current filters.
        </p>
      </div>
    );
  }

  // 3. Main Grid Render
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {clubs.map(club => (
        <ClubCard 
          key={club.id} 
          club={club} 
          isJoined={joinedIds?.includes(club.id)}
          onJoin={onJoinClub}
        />
      ))}
    </div>
  );
};

export default ClubGrid;