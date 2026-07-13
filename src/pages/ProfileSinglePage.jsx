import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faShareAlt, faCertificate, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import ProfileStat from '../components/profile/ProfileStat';
import SkillCom from '../components/profile/SkillCom';
import PostCard from '../components/feed/PostCard';

// Hooks & Context
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const ProfileSinglePage = () => {
  const { profile, user } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Posts');

  // Mock Skills - in production, these come from profile.skills array
  const skills = [
    { name: 'React.js', level: 'Advanced' },
    { name: 'Public Speaking', level: 'Intermediate' },
    { name: 'UI/UX Design', level: 'Expert' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Profile Header Card */}
      <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
        {/* Cover Image Placeholder */}
        <div className="h-48 w-full bg-gradient-to-r from-brand to-indigo-600 relative">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-16 mb-6">
            <div className="p-2 bg-white rounded-[3rem] shadow-xl">
              <Avatar 
                src={user?.photoURL} 
                name={profile?.displayName} 
                size="2xl" 
                className="w-32 h-32 md:w-40 md:h-40 border-4 border-white"
              />
            </div>
            
            <div className="flex-1 pb-4 text-center md:text-left">
              <h1 className="text-3xl font-syne font-black text-slate-900 leading-none">
                {profile?.displayName || 'Muni Student'}
              </h1>
              <p className="text-slate-500 font-dm mt-2 font-medium">
                {profile?.faculty || 'Faculty of Technoscience'} • Class of 2027
              </p>
            </div>

            <div className="flex gap-3 pb-4">
              <Button variant="outline" icon={faShareAlt} circle />
              <Button variant="primary" icon={faEdit}>Edit Profile</Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 py-6 border-t border-slate-50">
            <ProfileStat label="Circle Posts" value={12} />
            <ProfileStat label="Clubs Joined" value={4} />
            <ProfileStat label="Appreciation" value="1.2k" />
            <ProfileStat label="Circle Points" value={profile?.points || 450} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Skills */}
        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-syne font-bold text-slate-900 mb-4 uppercase tracking-widest">About Me</h3>
            <p className="text-sm text-slate-600 font-dm leading-relaxed">
              {profile?.bio || "Building the future of Muni University, one line of code at a time. Passionate about community and innovation."}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-syne font-bold text-slate-900 uppercase tracking-widest">Skills & Expertise</h3>
              <FontAwesomeIcon icon={faCertificate} className="text-brand text-xs" />
            </div>
            <div className="space-y-3">
              {skills.map((s, idx) => (
                <SkillCom key={idx} skill={s.name} level={s.level} />
              ))}
            </div>
          </Card>
        </aside>

        {/* Right Column: Content Feed */}
        <main className="lg:col-span-2 space-y-6">
          {/* Internal Tabs */}
          <div className="flex gap-8 border-b border-slate-100 px-2">
            {['Posts', 'Projects', 'Medals'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  activeTab === tab ? 'text-brand' : 'text-slate-400'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="space-y-6 pt-2">
            {activeTab === 'Posts' ? (
              <>
                <PostCard 
                  post={{
                    id: 'p_own_1',
                    authorName: profile?.displayName,
                    content: 'Just finished the UI for the new voting system! What do you guys think? 🎨',
                    timestamp: new Date(),
                    likes: 42,
                    comments: 3
                  }}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <FontAwesomeIcon icon={faProjectDiagram} className="text-slate-300 text-3xl mb-4" />
                <p className="text-slate-400 font-dm italic text-sm">No items added to {activeTab} yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSinglePage;