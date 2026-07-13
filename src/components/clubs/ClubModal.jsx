import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUsers, 
  faInfoCircle, 
  faBullhorn, 
  faUserShield 
} from '@fortawesome/free-solid-svg-icons';

const ClubModal = ({ club, isOpen, onClose, onJoin, isJoined }) => {
  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800">
        
        {/* Header/Cover Section */}
        <div className="h-32 bg-brand relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 -mt-12 relative flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl p-1 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[1.2rem] flex items-center justify-center">
                {club.logo ? (
                   <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-3xl font-syne font-bold text-brand">{club.name[0]}</span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => !isJoined && onJoin(club.id)}
              disabled={isJoined}
              className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                isJoined 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-brand text-white hover:bg-brand-deep shadow-brand/20'
              }`}
            >
              {isJoined ? 'Already a Member' : 'Join this Circle'}
            </button>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-2xl font-syne font-bold text-slate-900 dark:text-white">{club.name}</h2>
              <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold uppercase rounded-md tracking-widest">
                {club.category}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-dm">{club.tagline || "Official University Organization"}</p>
          </div>

          {/* Detailed Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-brand" />
                  About
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-dm">
                  {club.description || "This club hasn't provided a detailed description yet."}
                </p>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullhorn} className="text-brand" />
                  Latest Activity
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {club.latestUpdate || "No recent announcements available."}
                  </p>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-brand" />
                  Membership
                </h4>
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                      ))}
                   </div>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {club.memberCount || 0} Members joined
                   </span>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserShield} className="text-brand" />
                  Leadership
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-sm shadow-brand/20">
                      {club.leaderName ? club.leaderName.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Club Leader</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{club.leaderName || 'Assigning soon...'}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubModal;