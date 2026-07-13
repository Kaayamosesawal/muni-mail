import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const PostHeader = ({ author }) => {
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.stopPropagation();
    const authorId = author.uid || author.id || author.authorId;
    
    if (authorId) {
      navigate(`/profile/${authorId}`);
    } else {
      console.warn("PostHeader: No author ID found for navigation", author);
    }
  };

  // Relative time formatter (consistent with NewsFeed)
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = Date.now();
    const postTime = timestamp?.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
    const diff = Math.floor((now - postTime) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex justify-between items-start mb-2 px-1">
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div 
          className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-50 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-all active:scale-95 flex-shrink-0"
          onClick={handleProfileClick}
        >
          <img 
            src={author.photoURL || `https://ui-avatars.com/api/?name=${author.displayName || 'Muni+Student'}`} 
            alt={author.displayName} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Author Info */}
        <div 
          className="cursor-pointer group select-none flex-1 min-w-0"
          onClick={handleProfileClick}
        >
          <div className="flex items-center gap-1.5">
            <h4 className="font-syne font-bold text-slate-900 dark:text-white leading-none group-hover:text-brand transition-colors truncate">
              {author.displayName || "Muni Student"}
            </h4>
            {author.isVerified && (
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand text-[10px] flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">
            <span>{author.category || 'Student'}</span>
            {author.role && (
              <>
                <span className="text-slate-300">•</span>
                <span>{author.role}</span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="font-normal text-slate-500">
              {formatRelativeTime(author.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Options Button */}
      <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-400 p-2 transition-colors">
        <FontAwesomeIcon icon={faEllipsisH} />
      </button>
    </div>
  );
};

export default PostHeader;