import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVoteYea, 
  faLock, 
  faCheckCircle, 
  faQuoteLeft, 
  faEye 
} from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const CandidateCard = ({ 
  candidate, 
  onVote, 
  hasVoted, 
  canVote, 
  isObserver 
}) => {
  return (
    <Card 
      hoverable={canVote && !hasVoted} 
      className={`relative group transition-all duration-500 overflow-hidden h-full border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 hover:shadow-2xl hover:-translate-y-1 ${
        hasVoted 
          ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-500/5 shadow-emerald-500/10' 
          : 'hover:border-slate-200 dark:hover:border-slate-600'
      }`}
    >
      {/* Left Accent Bar */}
      <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 rounded-r-3xl ${
        hasVoted 
          ? 'bg-emerald-500' 
          : canVote 
            ? 'bg-brand opacity-0 group-hover:opacity-100' 
            : 'bg-slate-200 dark:bg-slate-700'
      }`} />

      <div className="flex flex-col items-center text-center h-full">
        <div className="relative mb-10">
          <Avatar 
            src={candidate.photoURL} 
            name={candidate.name} 
            size="xl" 
            className={`shadow-2xl transition-all duration-500 ${canVote && !hasVoted ? 'group-hover:scale-110' : ''} ${(!canVote && !hasVoted) ? 'grayscale-[0.6] opacity-75' : ''}`}
          />
          
          {/* Voted Success Badge */}
          {hasVoted && (
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 text-white rounded-3xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl animate-in zoom-in">
              <FontAwesomeIcon icon={faCheckCircle} size="xl" />
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h3 className="font-syne font-black text-3xl text-slate-900 dark:text-white tracking-tighter mb-3">
            {candidate.name}
          </h3>
          <p className="text-xs font-black text-brand uppercase tracking-[0.2em] bg-brand/5 dark:bg-brand/10 px-6 py-2 rounded-full inline-block">
            {candidate.position || 'Candidate'}
          </p>
        </div>

        {/* Manifesto / Slogan */}
        <div className="relative px-6 mb-12 min-h-[100px] flex items-center flex-1">
          <FontAwesomeIcon icon={faQuoteLeft} className="absolute -left-2 top-2 text-slate-100 dark:text-slate-800 text-5xl opacity-40" />
          <p className="text-base text-slate-600 dark:text-slate-400 font-dm italic leading-relaxed text-center">
            {candidate.slogan || candidate.manifesto || "Committed to serving the community with integrity and transparency."}
          </p>
        </div>

        {/* Action Area */}
        <div className="w-full mt-auto">
          {hasVoted ? (
            <div className="py-8 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-3xl flex items-center justify-center gap-4 text-emerald-600 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCheckCircle} size="lg" />
              <span className="font-black uppercase tracking-widest">Vote Confirmed</span>
            </div>
          ) : isObserver ? (
            <div className="py-8 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/30 rounded-3xl flex items-center justify-center gap-4 text-orange-600 dark:text-orange-400">
              <FontAwesomeIcon icon={faEye} size="lg" />
              <span className="font-black uppercase tracking-widest">Observer Mode - View Only</span>
            </div>
          ) : canVote ? (
            <Button 
              variant="primary" 
              className="w-full py-8 rounded-3xl shadow-xl shadow-brand/30 hover:shadow-brand/50 transition-all duration-300 text-lg font-black tracking-widest" 
              icon={faVoteYea} 
              onClick={() => onVote(candidate.id)}
            >
              Cast Vote
            </Button>
          ) : (
            <div className="py-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center gap-4 text-slate-400">
              <FontAwesomeIcon icon={faLock} size="lg" />
              <span className="font-black uppercase tracking-widest">Access Restricted</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CandidateCard;