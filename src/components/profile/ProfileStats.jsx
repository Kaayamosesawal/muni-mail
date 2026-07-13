import React from 'react';

/**
 * A clean, typography-focused component for displaying 
 * user metrics (Posts, Followers, Circles joined).
 */
const ProfileStat = ({ label, value, onClick }) => {
  return (
    <div 
      className={`text-center px-4 py-2 transition-all rounded-2xl ${
        onClick ? 'cursor-pointer hover:bg-slate-50 active:scale-95' : ''
      }`}
      onClick={onClick}
    >
      <p className="text-xl md:text-2xl font-syne font-extrabold text-slate-900 leading-none">
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5">
        {label}
      </p>
    </div>
  );
};

export default ProfileStat;