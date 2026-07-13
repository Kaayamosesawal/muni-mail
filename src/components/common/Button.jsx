import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl";
  
  const variants = {
    primary: "bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-deep",
    secondary: "bg-surface-soft text-slate-700 hover:bg-slate-100 border border-slate-100",
    accent: "bg-accent text-white shadow-lg shadow-accent/20 hover:opacity-90",
    outline: "bg-transparent border-2 border-slate-100 text-slate-600 hover:border-brand hover:text-brand",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon && (
        <FontAwesomeIcon icon={icon} className={children ? "mr-1" : ""} />
      )}
      {children}
    </button>
  );
};

export default Button;