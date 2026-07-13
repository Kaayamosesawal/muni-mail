import React from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostAction from './PostAction';
import useAuth from '../hooks/useAuth';

const Post = ({ data, onVote, onReaction }) => {
  const { user } = useAuth();

  if (!data) return null;

  // Enhanced author normalization for better compatibility
  const headerAuthor = {
    uid: data.authorId || data.author?.uid || data.author?.id,
    displayName: data.authorName || data.author?.displayName,
    photoURL: data.authorPhoto || data.author?.photoURL,
    isVerified: data.isVerified || false,
    timestamp: data.createdAt || data.timestamp,
    category: data.faculty || data.author?.category || 'Student',
    role: data.authorRole || data.author?.role || 'Student'
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border-[0.5px] border-slate-50 dark:border-slate-800/50 mb-6 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PostHeader author={headerAuthor} />
      
      <PostContent 
        content={data.content} 
        image={data.imageUrl || data.image} 
      />
      
      <PostAction 
        votes={data.votes} 
        reactions={data.reactions}
        userVote={data.votes?.[user?.uid]} 
        onVote={(type) => onVote(data.id, type, data.votes)}
        onReaction={(type) => onReaction(data.id, type)}
      />
    </article>
  );
};

export default Post;