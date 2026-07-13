import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faMedal, 
  faChartLine, 
  faCheckCircle,
  faRankingStar 
} from '@fortawesome/free-solid-svg-icons';

const VotingProgress = ({ candidates = [] }) => {
  const candidateArray = Array.isArray(candidates) 
    ? candidates 
    : Object.values(candidates || {});

  const totalVotes = candidateArray.reduce((sum, c) => 
    sum + (c.votes || c.voteCount || 0), 0
  );

  const sortedCandidates = [...candidateArray].sort((a, b) => 
    (b.votes || b.voteCount || 0) - (a.votes || a.voteCount || 0)
  );
  
  const maxVotes = sortedCandidates.length > 0 
    ? (sortedCandidates[0].votes || sortedCandidates[0].voteCount || 0) 
    : 0;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-brand/10 flex items-center justify-center text-brand">
            <FontAwesomeIcon icon={faRankingStar} size="lg" />
          </div>
          <h4 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-lg">
            LIVE STANDINGS
          </h4>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            REAL-TIME UPDATES
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {sortedCandidates.length > 0 ? (
          sortedCandidates.map((c, index) => {
            const votes = c.votes || c.voteCount || 0;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const rank = index + 1;
            const isLeading = votes > 0 && votes === maxVotes;

            const rankThemes = {
              1: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30',
              2: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
              3: 'text-orange-600 bg-orange-600/10 border-orange-600/30',
            };

            return (
              <div 
                key={c.id || c.name} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 transition-all hover:shadow-xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black border-2 ring-4 shadow-sm transition-all hover:scale-110 ${rankThemes[rank] || 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-transparent'}`}>
                      {rank === 1 ? <FontAwesomeIcon icon={faTrophy} /> : rank}
                    </div>
                    
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block text-2xl">
                        {c.name}
                      </span>
                      {isLeading && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">CURRENT LEADER</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-4xl font-black text-brand tabular-nums tracking-tighter">
                      {pct}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden p-1 border border-slate-200 dark:border-slate-700 mb-5">
                  <div 
                    className={`h-full rounded-3xl transition-all duration-1000 ${rank === 1 ? 'bg-brand' : rank <= 3 ? 'bg-slate-600' : 'bg-slate-400 dark:bg-slate-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center px-2">
                  <p className="text-sm text-slate-500 font-medium">
                    {votes} {votes === 1 ? 'VERIFIED BALLOT' : 'VERIFIED BALLOTS'}
                  </p>
                  
                  {rank <= 3 && votes > 0 && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <FontAwesomeIcon icon={faMedal} className="text-lg" />
                      <span className="text-xs font-black uppercase tracking-widest">PODIUM #{rank}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8 text-slate-300">
              <FontAwesomeIcon icon={faChartLine} size="3xl" />
            </div>
            <p className="text-lg font-medium text-slate-400">Awaiting first verified ballots...</p>
          </div>
        )}
      </div>

      {totalVotes > 0 && (
        <div className="pt-10 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 p-10 rounded-[3rem]">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">TOTAL TURNOUT</p>
            <p className="text-sm text-slate-500">Cumulative Digital Signatures</p>
          </div>
          <div className="px-12 py-6 bg-slate-900 dark:bg-brand text-white rounded-3xl text-4xl font-black tabular-nums shadow-lg">
            {totalVotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingProgress;