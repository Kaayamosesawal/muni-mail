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
import useAuth from '../hooks/useAuth';
import PostHeader from './PostHeader';

const PostCard = ({ post, onVote, onReaction }) => {
  const { user } = useAuth();

  // Enhanced data normalization
  const userVote = post.votes?.[user?.uid];
  const upvotes = Object.values(post.votes || {}).filter(v => v === 'up').length;
  const downvotes = Object.values(post.votes || {}).filter(v => v === 'down').length;
  const netScore = upvotes - downvotes;

  const reactions = [
    { icon: faSmile, color: 'text-yellow-400', key: 'happy' },
    { icon: faFrown, color: 'text-blue-400', key: 'sad' },
    { icon: faLaugh, color: 'text-orange-400', key: 'funny' },
    { icon: faSurprise, color: 'text-pink-400', key: 'surprised' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border-[0.5px] border-slate-100 dark:border-slate-800 mb-6 transition-all hover:shadow-md">
      
      <PostHeader 
        author={{
          uid: post.authorId,
          displayName: post.authorName,
          photoURL: post.authorPhoto,
          isVerified: post.isVerified || false,
          timestamp: post.createdAt,
          category: post.faculty || 'Student',
          role: post.authorRole
        }} 
      />

      {/* Post Content */}
      <div className="space-y-4 mt-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-dm">
          {post.content}
        </p>
        
        {post.imageUrl && (
          <div className="rounded-[1.5rem] overflow-hidden border-[0.5px] border-slate-50 dark:border-slate-800">
            <img src={post.imageUrl} alt="Post Attachment" className="w-full h-auto" />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          
          {/* Vote Pill */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => onVote?.(post.id, 'up', post.votes)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                userVote === 'up' ? 'text-green-500 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-green-500'
              }`}
            >
              <FontAwesomeIcon icon={faThumbsUp} size="sm" />
            </button>
            
            <span className="text-xs font-bold px-2 min-w-[20px] text-center dark:text-white font-syne">
              {netScore}
            </span>

            <button 
              onClick={() => onVote?.(post.id, 'down', post.votes)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                userVote === 'down' ? 'text-red-500 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-red-500'
              }`}
            >
              <FontAwesomeIcon icon={faThumbsDown} size="sm" />
            </button>
          </div>

          {/* Reaction Icons */}
          <div className="flex gap-1">
            {reactions.map((react) => (
              <button 
                key={react.key}
                onClick={() => onReaction?.(post.id, react.key)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
              >
                <FontAwesomeIcon 
                  icon={react.icon} 
                  className={`${react.color} group-hover:scale-110 transition-transform`} 
                  size="sm" 
                />
                <span className="text-[10px] font-bold text-slate-400">
                  {post.reactions?.[react.key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all">
          <FontAwesomeIcon icon={faShareAlt} size="sm" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;