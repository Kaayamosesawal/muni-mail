import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. INITIALIZE: Check localStorage with a fallback
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('muni-theme');
    // Default to light if nothing is saved
    return saved === 'dark';
  });

  // 2. SIDE EFFECT: Update the DOM and LocalStorage whenever darkMode changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark'); 
      localStorage.setItem('muni-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('muni-theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. HOOK: Export for use in components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};