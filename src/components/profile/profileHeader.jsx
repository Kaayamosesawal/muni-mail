import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const ProfileHeader = ({ profile, isOwnProfile, onEditClick }) => {
  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-slate-200 rounded-[2.5rem] overflow-hidden relative group">
        {profile?.coverURL ? (
          <img src={profile.coverURL} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand to-brand-deep opacity-80" />
        )}
        {isOwnProfile && (
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100">
            <FontAwesomeIcon icon={faCamera} />
          </button>
        )}
      </div>

      {/* Profile Info Overlay */}
      <div className="px-8 -mt-16 flex flex-col md:flex-row items-end justify-between gap-6">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="relative">
            <Avatar 
              src={profile?.photoURL} 
              name={profile?.displayName} 
              size="xl" 
              className="border-8 border-bg shadow-2xl"
            />
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center border-4 border-bg shadow-lg">
                <FontAwesomeIcon icon={faCamera} size="xs" />
              </button>
            )}
          </div>

          <div className="mb-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-syne font-bold text-slate-900">
                {profile?.displayName}
              </h2>
              {profile?.isVerified && (
                <FontAwesomeIcon icon={faCheckCircle} className="text-brand text-xl" />
              )}
            </div>
            <p className="text-slate-500 font-dm font-medium">@{profile?.username || 'student'}</p>
          </div>
        </div>

        {isOwnProfile ? (
          <Button 
            variant="secondary" 
            icon={faEdit} 
            onClick={onEditClick}
            className="mb-4"
          >
            Edit Profile
          </Button>
        ) : (
          <Button variant="primary" className="mb-4">Follow Circle</Button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex gap-8 px-8 mt-6">
        {[
          { label: 'Posts', value: profile?.stats?.posts || 0 },
          { label: 'Followers', value: profile?.stats?.followers || 0 },
          { label: 'Clubs', value: profile?.stats?.clubs || 0 }
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-xl font-syne font-bold text-slate-900 leading-none">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;