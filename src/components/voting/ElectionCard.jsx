import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faClock, 
  faUserTie, 
  faArrowRight, 
  faUserCheck,
  faLock,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const ElectionCard = ({ 
  election, 
  isMember, 
  onEnter, 
  currentUserId, 
  userRole 
}) => {
  const isClosed = election.status === 'Closed';
  const isUpcoming = election.status === 'Upcoming';
  const isActive = election.status === 'Active';
  
  const isObserver = ['Staff', 'Alumni', 'Admin'].includes(userRole);
  const canEnter = isMember || isObserver;

  const hasUserVoted = election.voters?.includes(currentUserId) || false;

  const getTimeLabel = () => {
    if (isClosed) return 'Polls Closed';
    if (!election.endDate) return isActive ? 'Active Now' : 'Upcoming';
    
    const diff = new Date(election.endDate) - new Date();
    const hoursLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    
    if (diff <= 0) return 'Polls Closed';
    if (hoursLeft === 0) return 'Ending Soon';
    if (hoursLeft > 24) return `${Math.ceil(hoursLeft / 24)}d left`;
    return `${hoursLeft}h remaining`;
  };

  const candidateCount = election.candidates 
    ? (Array.isArray(election.candidates) 
        ? election.candidates.length 
        : Object.keys(election.candidates).length || Object.values(election.candidates).length)
    : 0;

  return (
    <Card 
      hoverable={canEnter && !isUpcoming} 
      className={`relative h-full flex flex-col justify-between group transition-all duration-500 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-8 hover:shadow-2xl hover:-translate-y-1 ${isActive ? 'hover:border-brand/30' : ''}`}
    >
      {/* Header: Status + Timer */}
      <div className="flex justify-between items-start mb-8">
        <Badge 
          variant={isActive ? 'brand' : isUpcoming ? 'warning' : 'slate'} 
          className="uppercase tracking-[0.2em] text-[9px] font-black px-5 py-2"
        >
          {election.status}
        </Badge>
        
        <div className={`flex items-center gap-3 ${isActive ? 'text-brand' : 'text-slate-400'}`}>
          <div className="relative flex h-3 w-3">
            {isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            )}
            <FontAwesomeIcon icon={faClock} size="sm" className="relative" />
          </div>
          <span className="text-xs font-black uppercase tracking-tighter">
            {getTimeLabel()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-10 flex-1">
        <p className="text-[10px] font-black text-brand uppercase tracking-[0.25em] mb-3">
          {election.clubName || 'University Election'}
        </p>
        <h3 className="font-syne font-black text-2xl text-slate-900 dark:text-white leading-tight mb-6 group-hover:text-brand transition-colors line-clamp-3">
          {election.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <FontAwesomeIcon icon={faUserTie} className="text-base opacity-50" />
            <span className="font-medium">
              {candidateCount} {candidateCount === 1 ? 'Candidate' : 'Candidates'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <FontAwesomeIcon 
              icon={hasUserVoted ? faUserCheck : faCheckCircle} 
              className={`text-base ${hasUserVoted ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`} 
            />
            <span className={`font-medium ${hasUserVoted ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>
              {election.voters?.length || 0} Ballots Cast
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
        {!canEnter ? (
          <div className="py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-center border border-dashed border-slate-200 dark:border-slate-600">
            <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-3">
              <FontAwesomeIcon icon={faLock} className="text-base" />
              Membership Required
            </p>
          </div>
        ) : (
          <Button 
            variant={hasUserVoted ? 'outline' : (isActive ? 'primary' : 'secondary')} 
            className={`w-full justify-between group/btn py-7 rounded-3xl transition-all duration-300 text-base font-black tracking-widest ${isUpcoming ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            onClick={() => !isUpcoming && onEnter()}
            disabled={isUpcoming}
          >
            <span className="flex items-center gap-3">
              {isObserver && !isMember && <FontAwesomeIcon icon={faEye} className="text-orange-500" />}
              {isClosed ? 'View Final Results' : 
               hasUserVoted ? 'Live Standings' : 
               isObserver && !isMember ? 'Enter as Observer' :
               isUpcoming ? 'Opening Soon' : 'Enter Election'}
            </span>
            {!isUpcoming && (
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="text-lg group-hover/btn:translate-x-1 transition-transform" 
              />
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ElectionCard;