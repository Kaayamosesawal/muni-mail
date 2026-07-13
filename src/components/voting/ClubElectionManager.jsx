import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faChartBar, 
  faUserCheck, 
  faShieldHalved, 
  faUsers,
  faFingerprint,
  faSatelliteDish
} from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';
import Button from '../common/Button';
import CreateElectionModal from './CreateElectionModal'; // Ensure correct mapping directory path

const ClubElectionManager = ({ 
  clubId,
  clubName, 
  onElectionCreated, 
  totalActive, 
  userRole 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isClubLeader = userRole === 'Club Leader';

  if (!isClubLeader) return null;

  return (
    <>
      <Card className="bg-slate-50 dark:bg-brand/5 border border-slate-200 dark:border-brand/20 border-dashed mb-12 relative overflow-hidden p-10 md:p-14 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-300">
        
        {/* Decorative Background */}
        <div className="absolute -right-16 -bottom-16 opacity-[0.04] dark:opacity-5 text-brand rotate-12 pointer-events-none">
          <FontAwesomeIcon icon={faShieldHalved} size="10x" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Authority Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand/80 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand/30 transition-all hover:rotate-6 duration-500">
                <FontAwesomeIcon icon={faUserCheck} size="2xl" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-900 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                <FontAwesomeIcon icon={faFingerprint} className="text-sm" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-tighter text-3xl">
                  Governance Console
                </h3>
                <span className="px-6 py-2 text-xs font-black text-white uppercase rounded-full shadow-lg tracking-widest bg-brand">
                  CLUB LEADER
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-3 text-sm">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Organization: <span className="font-black text-brand">{clubName || 'MuniCircle'}</span>
                </p>
                <div className="hidden md:block w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <FontAwesomeIcon icon={faUsers} className="text-lg" />
                  <span className="font-black uppercase tracking-widest">
                    {totalActive || 0} Eligible Voters
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Management Actions */}
          <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 lg:flex-none border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-6 px-10 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
              icon={faChartBar}
            >
              Audit Logs
            </Button>

            <Button 
              variant="primary" 
              className="flex-1 lg:flex-none shadow-2xl shadow-brand/30 py-6 px-12 rounded-3xl group/btn hover:-translate-y-1 transition-all duration-300 text-lg font-black tracking-widest"
              icon={faPlus} 
              onClick={() => setModalOpen(true)}
            >
              New Election
            </Button>
          </div>
        </div>

        {/* Security Status Footer */}
        <div className="mt-12 pt-10 border-t border-slate-200/70 dark:border-brand/10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6">
            <div className="px-6 py-3 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex items-center gap-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                SECURE NODE ACTIVE
              </p>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
              <FontAwesomeIcon icon={faSatelliteDish} className="text-sm animate-bounce" />
              ENCRYPTION PROTOCOL v2.8
            </p>
          </div>
          
          <div className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-2xl border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-600" />
              ))}
            </div>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
              ENCRYPTED LEADER SESSION
            </span>
          </div>
        </div>
      </Card>

      {/* Embedded Creator Engine Modal Container Hook */}
      <CreateElectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        clubId={clubId}
        clubName={clubName}
        onElectionCreated={onElectionCreated}
      />
    </>
  );
};

export default ClubElectionManager;