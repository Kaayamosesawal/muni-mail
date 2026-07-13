import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faArrowLeft, 
  faEye,
  faLock,
  faFingerprint,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';

const ElectionAccessGuard = ({ 
  userRole, 
  isMember, 
  children, 
  election 
}) => {
  const navigate = useNavigate();

  // Official observers (can view but not vote)
  const isObserver = ['Staff', 'Alumni', 'Admin'].includes(userRole);

  /**
   * STATE 1: OFFICIAL OBSERVER MODE
   */
  if (isObserver && !isMember) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-orange-500/10 border border-orange-500/30 px-10 py-8 rounded-[3rem] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-3xl flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faEye} className="text-orange-600 dark:text-orange-400 text-4xl" />
            </div>
            <div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">
                OFFICIAL OBSERVER MODE
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                You can view results and standings but cannot cast votes.
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 px-8 py-4 bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-orange-500/20">
            <FontAwesomeIcon icon={faFingerprint} className="text-orange-500 text-xl" />
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest">VERIFIED MONITOR</span>
          </div>
        </div>
        
        {children}
      </div>
    );
  }

  /**
   * STATE 2: ACCESS DENIED - NON MEMBERS
   */
  if (!isMember) {
    return (
      <div className="text-center py-24 px-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
        
        <div className="absolute -right-24 -bottom-24 text-slate-100 dark:text-slate-800/10 -rotate-12 pointer-events-none">
          <FontAwesomeIcon icon={faLock} size="12x" />
        </div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[3rem] flex items-center justify-center mx-auto mb-12 border border-slate-200 dark:border-slate-700">
            <FontAwesomeIcon icon={faShieldAlt} size="5xl" className="opacity-40" />
          </div>
          
          <h3 className="font-syne font-black text-5xl text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
            Members Only
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-12">
            This election is restricted to verified members of <span className="font-semibold text-slate-700 dark:text-slate-300">{election?.clubName || 'the club'}</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              variant="primary" 
              className="px-14 py-7 rounded-3xl shadow-xl text-lg"
              onClick={() => navigate('/directory')}
            >
              Browse Clubs
            </Button>
            
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * STATE 3: FULL ACCESS - VERIFIED MEMBER
   */
  return (
    <div className="animate-in fade-in duration-700">
      {children}
    </div>
  );
};

export default ElectionAccessGuard;