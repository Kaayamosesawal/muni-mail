import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faUserShield, 
  faInfoCircle, 
  faCheckCircle, 
  faEye,
  faCircleNodes
} from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';

const ElectionHeader = ({ 
  clubName, 
  electionTitle, 
  endDate, 
  totalVoters, 
  status, 
  userRole, 
  isMember 
}) => {
  const [timeLeft, setTimeLeft] = useState({ hrs: '00', min: '00', sec: '00' });
  const isClosed = status === 'Closed';
  const isActive = status === 'Active';
  
  const isObserver = ['Staff', 'Alumni', 'Admin'].includes(userRole) && !isMember;

  // Real-time Countdown
  useEffect(() => {
    if (!endDate || isClosed) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(endDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hrs: '00', min: '00', sec: '00' });
        return false;
      }

      const hrs = Math.floor((difference / (1000 * 60 * 60)));
      const min = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hrs: hrs.toString().padStart(2, '0'),
        min: min.toString().padStart(2, '0'),
        sec: sec.toString().padStart(2, '0')
      });
      return true;
    };

    calculateTime();
    const timer = setInterval(() => {
      const isRunning = calculateTime();
      if (!isRunning) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, isClosed]);

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
            {clubName || 'MuniCircle Election'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleNodes} className="text-brand text-[10px]" />
            <span className="text-[10px] font-black text-brand uppercase tracking-[0.25em]">
              GOVERNANCE
            </span>
          </div>
        </div>
        
        {isObserver && (
          <div className="flex items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-3xl backdrop-blur-sm">
            <FontAwesomeIcon icon={faEye} size="sm" className="text-orange-500" />
            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              OFFICIAL OBSERVER
            </span>
          </div>
        )}
      </div>

      <Card className="bg-slate-900 border-none shadow-2xl relative overflow-hidden p-10 md:p-16 rounded-[3.5rem]">
        {/* Background Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-14">
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-syne font-black text-white leading-tight mb-10 tracking-tighter">
              {electionTitle}
            </h2>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
              <div className="flex items-center gap-4 px-8 py-4 bg-white/5 rounded-3xl border border-white/10 text-slate-300 text-sm font-medium shadow-inner">
                <FontAwesomeIcon icon={faUserShield} className="text-brand" />
                <span>Verified Members Only</span>
              </div>

              <div className="flex items-center gap-5 text-slate-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-2xl bg-slate-700 border-2 border-slate-900" />
                  ))}
                </div>
                <div className="leading-none">
                  <span className="text-white font-black text-3xl tabular-nums">{totalVoters || 0}</span> 
                  <span className="uppercase tracking-widest text-xs font-black ml-3 block opacity-70">BALLOTS CAST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown / Status Block */}
          <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-3xl text-center min-w-[340px] shadow-2xl relative">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl ${isClosed ? 'bg-emerald-500 text-white' : isActive ? 'bg-brand text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
              {isClosed ? 'ELECTION CONCLUDED' : isActive ? 'LIVE VOTING' : 'UPCOMING'}
            </div>

            <p className={`text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center justify-center gap-3 ${isClosed ? 'text-emerald-400' : 'text-slate-400'}`}>
              <FontAwesomeIcon icon={isClosed ? faCheckCircle : faClock} className="text-base" />
              {isClosed ? 'FINAL RESULTS' : 'CLOSES IN'}
            </p>
            
            {isClosed ? (
              <div className="py-8">
                <span className="text-5xl font-syne font-black text-white uppercase tracking-tighter">Polls Closed</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8">
                <TimeUnit value={timeLeft.hrs} label="HRS" />
                <span className="text-white/20 font-syne text-5xl">:</span>
                <TimeUnit value={timeLeft.min} label="MIN" />
                <span className="text-white/20 font-syne text-5xl">:</span>
                <TimeUnit value={timeLeft.sec} label="SEC" />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Security Protocol Bar */}
      <div className="mt-10 flex items-start gap-6 px-10 py-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:border-brand/30 transition-all">
        <div className="w-14 h-14 rounded-3xl bg-brand/10 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={faInfoCircle} className="text-brand text-3xl" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="text-brand font-black tracking-widest">SECURE PROTOCOL v2.0 • </span> 
          All votes are cryptographically signed. Only verified club members can cast ballots. 
          Observers can monitor in real-time.
        </p>
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }) => (
  <div className="text-center w-20">
    <span className="block text-6xl font-syne font-black text-white leading-none tabular-nums tracking-tighter">
      {value}
    </span>
    <span className="text-xs text-slate-400 uppercase font-black tracking-[0.2em] mt-4 block">{label}</span>
  </div>
);

export default ElectionHeader;