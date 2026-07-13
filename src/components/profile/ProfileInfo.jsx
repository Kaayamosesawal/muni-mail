import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';

const ProfileInfo = ({ profile }) => {
  return (
    <Card className="sticky top-24">
      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">About</h4>
          <p className="text-slate-600 text-sm leading-relaxed font-dm">
            {profile?.bio || "No bio added yet. This student is busy transforming the future!"}
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-brand/60">
              <FontAwesomeIcon icon={faGraduationCap} size="sm" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Faculty</p>
              <p className="text-xs font-bold text-slate-700">{profile?.faculty || 'Not Specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-brand/60">
              <FontAwesomeIcon icon={faCalendarAlt} size="sm" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Year of Study</p>
              <p className="text-xs font-bold text-slate-700">Year {profile?.year || '1'}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileInfo;