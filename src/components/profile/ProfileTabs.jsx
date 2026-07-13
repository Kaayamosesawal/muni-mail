import React from 'react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = ['Posts', 'Clubs', 'Media', 'Documents'];

  return (
    <div className="flex gap-8 border-b border-slate-100 mb-6 px-4 overflow-x-auto no-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === tab ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full animate-in slide-in-from-bottom-1" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;