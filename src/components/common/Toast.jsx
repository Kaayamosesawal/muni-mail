import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  const styles = {
    success: "bg-slate-900 text-white border-slate-800",
    error: "bg-red-600 text-white border-red-500",
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[300] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${styles[type]}`}>
      <span className="text-sm font-bold font-dm">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">×</button>
    </div>
  );
};

export default Toast;