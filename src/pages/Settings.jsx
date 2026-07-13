import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoon, faSun, faShieldAlt, 
  faSignOutAlt, faPhone, faEnvelope, faGraduationCap, 
  faUniversity, faBook, faPen, faBriefcase, faUserTag
} from '@fortawesome/free-solid-svg-icons';

// Firebase
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/index';

// Components
import Card from '../components/common/Card';

// Hooks & Context
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { showToast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    secondaryEmail: profile?.secondaryEmail || '',
    photoURL: user?.photoURL || profile?.photoURL || ''
  });

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      // Only these specific fields are allowed by Firestore rules for standard users
      await updateDoc(userRef, {
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone,
        secondaryEmail: formData.secondaryEmail,
        updatedAt: new Date()
      });
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out safely.");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };

  // Helper for Read-Only Institutional Data
  const InstitutionalField = ({ label, value, icon }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
      <div className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-none rounded-2xl px-5 py-4 text-xs font-bold flex items-center justify-between cursor-not-allowed">
        {value || 'Not Specified'}
        <FontAwesomeIcon icon={icon} className="text-[10px] opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl md:text-md font-syne font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">Settings</h1>
        <p className="text-slate-500 font-dm mt-1">Manage your account and preferences.</p>
      </header>

      {/* --- INSTITUTIONAL IDENTITY (ROLE-BASED & READ-ONLY) --- */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Verified Identity</h3>
        <Card className="p-8 space-y-6 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InstitutionalField label="Assigned Role" value={profile?.role} icon={faUserTag} />
            <InstitutionalField label="Status" value={profile?.communityStatus} icon={faShieldAlt} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InstitutionalField label="Faculty / School" value={profile?.faculty} icon={faUniversity} />
            {/* Show Year of Study only for Students */}
            {profile?.role === 'Student' && (
              <InstitutionalField label="Year of Study" value={`Year ${profile?.yearOfStudy}`} icon={faGraduationCap} />
            )}
            {/* Show Department for Staff/Admin */}
            {(profile?.role === 'Staff' || profile?.role === 'Admin') && (
              <InstitutionalField label="Department" value={profile?.department} icon={faBriefcase} />
            )}
          </div>
          
          <InstitutionalField label="Primary Program / Unit" value={profile?.program} icon={faBook} />
          
          <p className="text-[9px] text-center text-slate-400 font-medium italic">
            Institutional data is verified and can only be changed by administration.
          </p>
        </Card>
      </section>

      {/* --- PUBLIC PROFILE (EDITABLE) --- */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Public Profile</h3>
        <Card className="p-8 space-y-8 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white dark:border-slate-800 shadow-lg">
              <img 
                src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.username}&background=random`} 
                className="w-full h-full object-cover" 
                alt="Avatar" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Username</label>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bio</label>
                <FontAwesomeIcon icon={faPen} className="text-[9px] text-brand opacity-40" />
              </div>
              <textarea 
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell the community about yourself..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-none rounded-[1.5rem] px-5 py-4 text-xs font-medium focus:ring-4 focus:ring-brand/10 outline-none resize-none transition-all"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* --- CONTACT & SECURITY --- */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Contact details</h3>
        <Card className="p-8 space-y-6 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Phone Number</label>
              <div className="relative">
                <FontAwesomeIcon icon={faPhone} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-none rounded-2xl pl-12 pr-5 py-4 text-xs font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Recovery Email</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
                <input 
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData({...formData, secondaryEmail: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-none rounded-2xl pl-12 pr-5 py-4 text-xs font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleProfileUpdate}
            disabled={isUpdating}
            className="w-full bg-slate-900 dark:bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 mt-4"
          >
            {isUpdating ? 'Saving...' : 'Update Settings'}
          </button>
        </Card>
      </section>

      {/* --- PREFERENCES & SESSION --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-2 border-none bg-white dark:bg-slate-900 rounded-[2rem]">
          <div onClick={toggleTheme} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.5rem] cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-400'}`}>
                <FontAwesomeIcon icon={darkMode ? faMoon : faSun} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Dark mode</p>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${darkMode ? 'bg-brand' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
            </div>
          </div>
        </Card>

        <Card className="p-2 border-none bg-white dark:bg-slate-900 rounded-[2rem]">
          <div onClick={handleLogout} className="flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[1.5rem] cursor-pointer group transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Logout</p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Settings;