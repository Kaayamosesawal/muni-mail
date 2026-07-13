import React from 'react';
import Avatar from '../common/Avatar';

const Story = ({ user, isUnread, onOpen }) => {
  return (
    <div 
      onClick={onOpen}
      className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group"
    >
      <div className={`p-1 rounded-[1.5rem] border-2 transition-all ${
        isUnread 
          ? 'border-brand ring-2 ring-brand/30' 
          : 'border-slate-100 group-hover:border-slate-200'
      }`}>
        <Avatar 
          src={user.photoURL} 
          name={user.displayName} 
          size="lg" 
          className="border-2 border-white"
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500 font-dm truncate w-16 text-center">
        {user.displayName?.split(' ')[0] || 'User'}
      </span>
    </div>
  );
};

export default Story;