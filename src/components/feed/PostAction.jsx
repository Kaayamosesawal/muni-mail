import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThumbsUp, 
  faThumbsDown, 
  faSmile, 
  faFrown, 
  faLaugh, 
  faSurprise, 
  faShareAlt 
} from '@fortawesome/free-solid-svg-icons';

const PostAction = ({ votes, reactions, userVote, onVote, onReaction }) => {
  // Optimized vote calculations
  const upvotes = Object.values(votes || {}).filter(v => v === 'up').length;
  const downvotes = Object.values(votes || {}).filter(v => v === 'down').length;
  const netScore = upvotes - downvotes;

  const reactionList = [
    { icon: faSmile, color: 'text-yellow-400', key: 'happy' },
    { icon: faFrown, color: 'text-blue-400', key: 'sad' },
    { icon: faLaugh, color: 'text-orange-400', key: 'funny' },
    { icon: faSurprise, color: 'text-pink-400', key: 'surprised' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between mt-3 pt-2 border-t-[0.5px] border-slate-100/50 gap-4 px-1">
      <div className="flex items-center gap-4">
        
        {/* Voting Pill */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => onVote('up')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              userVote === 'up' 
                ? 'text-green-500 bg-white shadow-sm' 
                : 'text-slate-400 hover:text-green-500 hover:bg-white/50'
            }`}
          >
            <FontAwesomeIcon icon={faThumbsUp} size="sm" />
          </button>
          
          <span className={`text-xs font-bold px-2 min-w-[24px] text-center font-syne ${
            netScore > 0 ? 'text-green-500' : netScore < 0 ? 'text-red-500' : 'text-slate-500'
          }`}>
            {netScore}
          </span>

          <button 
            onClick={() => onVote('down')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              userVote === 'down' 
                ? 'text-red-500 bg-white shadow-sm' 
                : 'text-slate-400 hover:text-red-500 hover:bg-white/50'
            }`}
          >
            <FontAwesomeIcon icon={faThumbsDown} size="sm" />
          </button>
        </div>

        {/* Emoji Reactions */}
        <div className="flex gap-1.5">
          {reactionList.map((emoji) => (
            <button 
              key={emoji.key}
              onClick={() => onReaction(emoji.key)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 transition-all group active:scale-95"
            >
              <FontAwesomeIcon 
                icon={emoji.icon} 
                className={`${emoji.color} group-hover:scale-110 transition-transform`} 
                size="sm"
              />
              <span className="text-[11px] font-bold text-slate-500">
                {reactions?.[emoji.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <button className="w-10 h-10 rounded-xl text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-all flex items-center justify-center">
        <FontAwesomeIcon icon={faShareAlt} size="sm" />
      </button>
    </div>
  );
};

export default PostAction;