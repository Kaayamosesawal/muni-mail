import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    sm: "w-8 h-8 rounded-xl text-[10px]",
    md: "w-11 h-11 rounded-2xl text-sm",
    lg: "w-16 h-16 rounded-[1.5rem] text-xl",
    xl: "w-24 h-24 rounded-[2rem] text-3xl"
  };

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'M';

  return (
    <div className={`flex-shrink-0 overflow-hidden bg-brand/5 border border-slate-100 flex items-center justify-center font-syne font-bold text-brand ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;