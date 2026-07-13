import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faVoteYea, 
  faCalendarAlt, 
  faFileAlt, 
  faCog,
  faScrewdriverWrench, // Added for Leader
  faShieldHalved      // Added for Admin
} from '@fortawesome/free-solid-svg-icons';

// Hooks
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { profile } = useAuth();

  const navItems = [
    { name: 'Home Feed', path: '/feed', icon: faHome },
    { name: 'Clubs', path: '/clubs', icon: faUsers },
    { name: 'Elections', path: '/elections', icon: faVoteYea },
    { name: 'Events', path: '/events', icon: faCalendarAlt },
    { name: 'Documents', path: '/documents', icon: faFileAlt },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-slate-100 p-6 hidden lg:flex flex-col overflow-y-auto no-scrollbar">
      <nav className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4 mb-4">
          Main Menu
        </p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all
              ${isActive 
                ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <FontAwesomeIcon icon={item.icon} className="w-5" />
            <span className="font-syne text-sm">{item.name}</span>
          </NavLink>
        ))}

        {/* --- PRIVILEGED ACCESS SECTION --- */}
        {(profile?.role === 'Staff' || profile?.role === 'Admin' || profile?.role === 'Club Leader') && (
          <div className="pt-4 mt-4 border-t border-slate-50 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2">
              Management
            </p>
            
            {/* Leader Console Link */}
            <NavLink
              to="/leader-portal"
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-emerald-600 hover:bg-emerald-50'}
              `}
            >
              <FontAwesomeIcon icon={faScrewdriverWrench} className="w-5" />
              <span className="font-syne text-sm">Leader Console</span>
            </NavLink>

            {/* Optional: Admin Link specifically for Registry/Management */}
            {profile?.role === 'Admin' && (
              <NavLink
                to="/club-management"
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                <FontAwesomeIcon icon={faShieldHalved} className="w-5" />
                <span className="font-syne text-sm">Club Registry</span>
              </NavLink>
            )}
          </div>
        )}
      </nav>

      <div className="mt-10 pt-10 border-t border-slate-50">
        <NavLink
          to="/settings"
          className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-slate-900 font-bold transition-all"
        >
          <FontAwesomeIcon icon={faCog} className="w-5" />
          <span className="font-syne text-sm">Settings</span>
        </NavLink>
      </div>

      {/* Institutional Branding / Motto */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-[10px] font-bold text-slate-300 italic">
          Education for Transformation
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;