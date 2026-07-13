import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faFingerprint, 
  faExclamationTriangle, 
  faCircleNotch,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';

const BallotConfirmationModal = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting,
  position // optional: for multi-position context
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        
        <div className="p-12 text-center">
          {/* Icon Header */}
          <div className="w-24 h-24 mx-auto mb-10 bg-gradient-to-br from-brand to-brand/70 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand/30">
            <FontAwesomeIcon 
              icon={isSubmitting ? faCircleNotch : faFingerprint} 
              size="3xl" 
              className={isSubmitting ? 'animate-spin' : ''} 
            />
          </div>

          <h3 className="font-syne font-black text-4xl text-slate-900 dark:text-white tracking-tighter mb-4">
            Confirm Your Vote
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed text-lg">
            You are about to cast your official vote for{' '}
            <span className="font-black text-slate-900 dark:text-white">"{candidate.name}"</span>
            {position && <span className="block text-sm mt-3 text-slate-500">for {position}</span>}
          </p>

          {/* Warning Box */}
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-3xl p-8 mb-12 text-left">
            <div className="flex gap-5">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-1 text-2xl flex-shrink-0" />
              <div>
                <p className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest text-xs mb-3">Irreversible Action</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  This vote is final and cannot be changed.<br />
                  Your identity is encrypted and protected.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-5">
            <Button 
              variant="primary" 
              className="py-7 rounded-3xl shadow-xl shadow-brand/30 text-lg font-black uppercase tracking-widest w-full"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-4" /> 
                  Casting Your Ballot...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-4" /> 
                  Confirm & Cast Vote
                </>
              )}
            </Button>
            
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-base font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-6 transition-colors flex items-center justify-center gap-3"
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel & Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallotConfirmationModal;