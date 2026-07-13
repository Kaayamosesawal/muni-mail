import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faChevronRight,
  faChevronLeft,
  faFingerprint
} from '@fortawesome/free-solid-svg-icons';

import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const StudentBallot = ({
  election,
  onVoteSubmit,   // async (selections: { [position]: candidateId }) => boolean
  isSubmitting,
  hasVotedInitial,
  isMember
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [hasVotedLocally, setHasVotedLocally] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const positions = election.positions || ['General'];
  const currentPosition = positions[currentStep];

  const allCandidates = election.candidates
    ? (Array.isArray(election.candidates)
        ? election.candidates
        : Object.values(election.candidates).flat())
    : [];

  const positionCandidates = allCandidates.filter(c => c.position === currentPosition);

  // Check all positions have a selection before allowing review
  const allPositionsSelected = positions.every(p => selections[p]);

  const handleFinalSubmit = async () => {
    if (!allPositionsSelected) {
      alert("Please select a candidate for all positions.");
      return;
    }
    // onVoteSubmit opens the confirmation modal in the parent (Voting.jsx)
    // It returns false — we don't mark voted here; the parent confirms and calls the API
    await onVoteSubmit(selections);
    // hasVotedLocally is set to true only after the API responds successfully
    // That is handled by the parent navigating away after success
  };

  // Success State
  if (hasVotedInitial || hasVotedLocally) {
    return (
      <Card className="p-20 text-center rounded-[3.5rem] border-emerald-100 bg-emerald-50/30 animate-in zoom-in duration-700 shadow-2xl shadow-emerald-200/20">
        <div className="w-28 h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 text-5xl animate-bounce shadow-xl shadow-emerald-500/40">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h2 className="text-4xl font-syne font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">Ballot Confirmed</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Your vote has been securely recorded.</p>
      </Card>
    );
  }

  // Review Step
  if (isReviewing) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="text-center space-y-4">
          <Badge variant="brand" className="px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-brand/20">
            Step 3: Final Review
          </Badge>
          <h2 className="text-5xl font-syne font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
            Confirm Your Choices
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">This action is final and cannot be changed.</p>
        </div>

        <div className="space-y-6">
          {positions.map((pos) => {
            const selectedCandidate = allCandidates.find(c => c.id === selections[pos]);
            return (
              <div key={pos} className="flex items-center justify-between p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[3rem] shadow-sm hover:border-brand/30 transition-all">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{pos}</p>
                  <p className="text-2xl font-syne font-black text-slate-900 dark:text-white">
                    {selectedCandidate?.name || <span className="text-red-400">Not Selected</span>}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsReviewing(false);
                    setCurrentStep(positions.indexOf(pos));
                  }}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-black uppercase text-brand hover:bg-brand hover:text-white transition-all"
                >
                  Change
                </button>
              </div>
            );
          })}
        </div>

        <footer className="flex gap-6 items-center bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl mt-8">
          <Button
            variant="ghost"
            onClick={() => setIsReviewing(false)}
            className="flex-1 text-white border border-slate-700 rounded-[2rem] py-7 font-black uppercase tracking-widest"
          >
            ← Back to Ballot
          </Button>
          <Button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || !isMember || !allPositionsSelected}
            className="flex-[2] bg-brand hover:bg-white hover:text-brand py-7 rounded-[2rem] font-black uppercase tracking-widest text-lg transition-all"
          >
            {isSubmitting ? 'Casting Secure Vote...' : 'Sign & Cast Ballot'}
            <FontAwesomeIcon icon={faFingerprint} className="ml-4" />
          </Button>
        </footer>
      </div>
    );
  }

  // Main Voting Step
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Progress Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase text-brand tracking-[0.3em]">
            POSITION {currentStep + 1} OF {positions.length}
          </p>
          <h2 className="text-4xl font-syne font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {currentPosition}
          </h2>
        </div>
        <div className="flex gap-3">
          {positions.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-12 rounded-full transition-all duration-700 ${
                i <= currentStep
                  ? 'bg-brand scale-x-110 shadow-lg shadow-brand/30'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {positionCandidates.length > 0 ? (
          positionCandidates.map(candidate => (
            <button
              key={candidate.id}
              disabled={!isMember}
              onClick={() => setSelections({ ...selections, [currentPosition]: candidate.id })}
              className={`text-left p-10 rounded-[3rem] border-2 transition-all duration-300 flex items-center gap-8 group relative overflow-hidden hover:shadow-xl ${
                selections[currentPosition] === candidate.id
                  ? 'border-brand bg-brand/5 ring-4 ring-brand/10 scale-[1.02]'
                  : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className={`w-28 h-28 rounded-3xl overflow-hidden shadow-2xl border-4 transition-transform duration-500 group-hover:scale-110 ${
                selections[currentPosition] === candidate.id ? 'border-brand' : 'border-white dark:border-slate-700'
              }`}>
                <img src={candidate.photoURL} alt={candidate.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-syne font-black uppercase text-3xl group-hover:text-brand transition-colors text-slate-900 dark:text-white mb-2">
                  {candidate.name}
                </p>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  {candidate.party || 'Independent'}
                </p>
              </div>
              {selections[currentPosition] === candidate.id && (
                <div className="absolute top-8 right-8 w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center animate-in zoom-in">
                  <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-dashed">
            No candidates available for this position.
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <footer className="flex justify-between items-center bg-slate-900 dark:bg-black text-white p-10 rounded-[3.5rem] shadow-2xl border border-white/5">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 0}
          className="text-white disabled:opacity-30 font-black uppercase tracking-widest px-12 py-6 text-lg"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-4" /> Previous
        </Button>

        {currentStep === positions.length - 1 ? (
          <Button
            onClick={() => setIsReviewing(true)}
            disabled={!selections[currentPosition]}
            className="bg-brand text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl shadow-brand/40 hover:scale-105 active:scale-95 transition-all"
          >
            Review Ballot <FontAwesomeIcon icon={faChevronRight} className="ml-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(s => s + 1)}
            disabled={!selections[currentPosition]}
            className="bg-white text-slate-900 px-16 py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg hover:scale-105 active:scale-95 transition-all"
          >
            Next Position <FontAwesomeIcon icon={faChevronRight} className="ml-4" />
          </Button>
        )}
      </footer>
    </div>
  );
};

export default StudentBallot;
