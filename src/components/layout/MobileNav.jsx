// src/components/layout/MobileNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faVoteYea, 
  faLifeRing,
  faShieldHalved,
  faUserShield 
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth';

const MobileNav = () => {
  const { profile } = useAuth();

  // 1. Standard items available to all authenticated users
  const navItems = [
    { path: '/feed', icon: faHome, label: 'Home' },
    { path: '/clubs', icon: faUsers, label: 'Clubs' },
    { path: '/elections', icon: faVoteYea, label: 'Vote' },
  ];

  // 2. Dynamic Injection: Add Admin button if user has Admin privileges
  if (profile?.role === 'Admin') {
    navItems.push({ path: '/admin', icon: faShieldHalved, label: 'Admin' });
  }

  // 3. Dynamic Injection: Add Portal button if user is a Club Leader
  if (profile?.role === 'Club Leader') {
    navItems.push({ path: '/leader-portal', icon: faUserShield, label: 'Portal' });
  }

  // 4. Always ensure Help/Support is the final item in the row
  navItems.push({ path: '/help', icon: faLifeRing, label: 'Help' });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 h-16 flex items-center justify-around px-2 lg:hidden z-[100]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 w-full h-full transition-all
            ${isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'}
          `}
        >
          <FontAwesomeIcon icon={item.icon} className="text-lg" />
          <span className="text-[8px] font-bold uppercase tracking-tighter">
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;