import React, { createContext, useState, useCallback, useContext, useRef } from 'react';
import Toast from '../components/common/Toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null); // Ref to track the active timer across renders

  const hideToast = useCallback(() => {
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    // Clear any existing timer before starting a new one
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type });

    // Auto-remove after 4 seconds
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
};

// Custom hook for easy access
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};