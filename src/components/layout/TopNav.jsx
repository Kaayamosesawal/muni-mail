import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBars,
  faCalendarAlt,
  faNewspaper,
  faLifeRing,
  faChevronDown,
  faCheckToSlot,
  faShieldHalved,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const TopNav = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const menuItems = [
    { path: '/feed', icon: faNewspaper, label: 'Feeds' },
    { path: '/voting', icon: faCheckToSlot, label: 'Voting' },
    { path: '/events', icon: faCalendarAlt, label: 'Events' },
  ];

  // Notification Listener
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifData);
    }, (error) => {
      console.warn("Notification listener restricted:", error.message);
      if (error.code === 'permission-denied') setNotifications([]);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach((notif) => {
      if (notif.unread) {
        const nRef = doc(db, 'notifications', notif.id);
        batch.update(nRef, { unread: false });
      }
    });
    try { await batch.commit(); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-[9999] px-4 md:px-8 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2 md:gap-4">
        
        {/* Logo Section */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2 min-w-fit cursor-pointer group">
          <img src="/muni_2.png" alt="Logo" className="w-10 h-10 shrink-0 group-hover:scale-105 transition-transform" />
          <h1 className="text-xl font-syne font-bold text-slate-900 dark:text-slate-100 hidden lg:block">
            Muni<span className="text-brand">Circle</span>
          </h1>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-1 md:gap-4 shrink-0">
          
          {/* Admin Dashboard */}
          {profile?.role === 'Admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 md:w-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            >
              <FontAwesomeIcon icon={faShieldHalved} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Admin</span>
            </button>
          )}

          {/* Club Leader Portal - FIXED */}
          {profile?.role === 'Club Leader' && (
            <button
              onClick={() => navigate('/moderation')}   // ← Changed to correct route
              className="w-10 h-10 md:w-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 bg-brand text-white rounded-xl hover:bg-slate-900 transition-all shadow-md shadow-brand/10"
            >
              <FontAwesomeIcon icon={faUserShield} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Leadership</span>
            </button>
          )}

          {/* Navigation Menu Dropdown */}
          <div className="relative hidden lg:block" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isMenuOpen ? 'bg-brand text-white' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-brand'}`}
            >
              <FontAwesomeIcon icon={faBars} />
              <span>Menu</span>
              <FontAwesomeIcon icon={faChevronDown} className={`text-[8px] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-[10000]">
                {menuItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-brand/5 hover:text-brand transition-all"
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4 text-sm" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/help')}
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl text-slate-400 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <FontAwesomeIcon icon={faLifeRing} className="text-lg" />
          </button>

          {/* Notification System */}
          <div className="relative cursor-pointer group" ref={notifRef}>
            <div
              onClick={() => setShowNotifs(!showNotifs)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${showNotifs ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-brand/5 group-hover:text-brand'}`}
            >
              <FontAwesomeIcon icon={faBell} className="text-sm md:text-base" />
            </div>
           
            {unreadCount > 0 && !showNotifs && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}

            {showNotifs && (
              <div className="absolute top-full right-0 mt-3 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[10000] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Updates</h4>
                  <button onClick={markAllAsRead} className="text-[9px] font-bold text-brand uppercase hover:underline">Mark read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${notif.unread ? 'bg-brand/5' : ''}`}>
                        <p className={`text-xs ${notif.unread ? 'font-bold' : 'font-medium'} text-slate-800 dark:text-slate-200`}>
                          {notif.message || notif.text}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-dm">
                          {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs font-dm">No new updates.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div onClick={() => navigate('/settings')} className="flex items-center gap-3 cursor-pointer group pl-1 md:pl-2 border-l border-slate-100 dark:border-slate-800">
            <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.fullName || 'User'} className="w-9 h-9 md:w-10 md:h-10 rounded-xl shadow-sm shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;