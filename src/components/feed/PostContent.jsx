import React from 'react';

const PostContent = ({ content, image }) => {
  return (
    <div className="space-y-3 px-1">
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-dm text-[15px] whitespace-pre-wrap">
        {content}
      </p>
      
      {image && (
        <div className="rounded-[1.5rem] overflow-hidden border-[0.5px] border-slate-100/50 bg-slate-50 dark:bg-slate-900">
          <img 
            src={image} 
            alt="Post content" 
            className="w-full h-auto max-h-[450px] object-cover" 
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default PostContent;