import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faCheck, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

const ClubCard = ({ club, isJoined, onJoin, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all group relative overflow-hidden"
    >
      {/* Decorative Background Glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors" />

      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 shadow-inner">
          {club.logo ? (
            <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-syne font-black text-brand">{club.name[0]}</span>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1 bg-brand/10 dark:bg-brand/20 text-brand text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">
            {club.category}
          </span>
          {isJoined && (
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
              <FontAwesomeIcon icon={faCheck} className="text-[8px]" /> Member
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-syne font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand transition-colors leading-tight">
          {club.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-dm line-clamp-2 leading-relaxed italic">
          {club.tagline || "University Organization"}
        </p>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
            <span className="text-[11px] font-bold uppercase tracking-tight">
              {club.memberCount || 0} <span className="font-medium">Members</span>
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Quick Join Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isJoined) onJoin(club.id);
            }}
            disabled={isJoined}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              isJoined 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 cursor-default' 
                : 'bg-slate-900 dark:bg-brand text-white hover:scale-110 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none'
            }`}
            title={isJoined ? "Already Joined" : "Join Club"}
          >
            <FontAwesomeIcon icon={isJoined ? faCheck : faPlus} />
          </button>

          {/* View Details Button (Triggers Modal) */}
          <button 
            onClick={() => onClick && onClick(club)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand dark:hover:text-brand transition-colors border border-slate-100 dark:border-slate-700"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;