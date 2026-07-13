// src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faNewspaper, 
  faCalendarAlt, 
  faCheckToSlot, 
  faUserCircle,
  faTasks // Added icon for Club Management
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const BottomNav = () => {
  const { profile } = useAuth();

  // 1. Base links for every student
  const navLinks = [
    { path: '/', icon: faHome, label: 'Home' },
    { path: '/feed', icon: faNewspaper, label: 'Feeds' },
    { path: '/events', icon: faCalendarAlt, label: 'Events' },
    { path: '/voting', icon: faCheckToSlot, label: 'Vote' },
  ];

  
  // 3. Add Profile/Settings at the end
  navLinks.push({ path: '/settings', icon: faUserCircle, label: 'Profile' });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 z-[9999] md:hidden shadow-[0_-2px_15px_rgba(0,0,0,0.05)] transition-colors">
      <div className="flex items-center justify-between gap-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 w-full transition-all duration-300 relative
              ${isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <FontAwesomeIcon icon={link.icon} className="text-lg mb-0.5" />
                
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none">
                  {link.label}
                </span>

                <ActiveIndicator isActive={isActive} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const ActiveIndicator = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute -bottom-1 w-1 h-1 bg-brand rounded-full animate-pulse" />
  );
};

export default BottomNav;