import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-dm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-brand/10 focus:bg-white focus:border-brand/20 outline-none transition-all ${error ? 'border-red-200 bg-red-50/30' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default Input;