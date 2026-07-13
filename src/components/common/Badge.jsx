import React from 'react';

const Badge = ({ children, variant = 'brand', className = '' }) => {
  const variants = {
    brand: "bg-brand-light text-brand",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-500"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;