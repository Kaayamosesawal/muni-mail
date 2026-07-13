// src/pages/AdminPortal.jsx
import React from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, 
  faUsers, 
  faUniversity, 
  faGears, 
  faArrowLeft,
  faShieldHalved,
  faTasks 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const AdminPortal = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-slate-400 font-dm text-sm">
        Verifying admin access...
      </div>
    );
  }

  const ALLOWED_ROLES = ['Admin', 'System Admin', 'Staff'];
  if (!ALLOWED_ROLES.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  const adminLinks = [
    { path: '/admin', icon: faChartPie, label: 'Overview' },
    { path: '/admin/clubs', icon: faUniversity, label: 'Manage Clubs' },
    { path: '/admin/users', icon: faUsers, label: 'User Directory' },
    { path: '/admin/settings', icon: faGears, label: 'System Settings' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)] gap-8 animate-in fade-in duration-500">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-28">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <div>
              <span className="font-syne font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 block">
                SYSTEM ADMIN
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {profile?.displayName || 'Administrator'}
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-lg dark:bg-brand dark:text-black' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
              >
                <FontAwesomeIcon icon={link.icon} className="w-4" />
                {link.label}
              </NavLink>
            ))}

            {profile?.clubId && (
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">My Club Assignment</p>
                <NavLink
                  to={`/club-management/${profile.clubId}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-brand bg-brand/5 hover:bg-brand/10 transition-all"
                >
                  <FontAwesomeIcon icon={faTasks} className="w-4" />
                  Manage {profile.clubName || 'My Club'}
                </NavLink>
              </div>
            )}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Exit Admin Portal
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 pb-12 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default AdminPortal;