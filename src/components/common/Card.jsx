import React from 'react';

/**
 * An ultra-compact container component
 * Minimalist padding and borders for high-density UIs.
 */
const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  noPadding = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-slate-900 
      rounded-lg
      border border-slate-200/60 dark:border-slate-800
      shadow-sm 
      overflow-hidden 
      transition-all 
      duration-200
      ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : ''}
      ${className}
    `}>
      <div className={noPadding ? '' : 'p-2'}>
        {children}
      </div>
    </div>
  );
};

// Sub-component for Card Headers
export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-center justify-between mb-2 ${className}`}>
    <div>
      <h3 className="font-syne font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Sub-component for Card Footers
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 ${className}`}>
    {children}
  </div>
);

export default Card;