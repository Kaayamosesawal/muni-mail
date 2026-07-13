import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHistory, faTimes, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Firebase
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/index';

// Components
import ElectionHeader from '../components/voting/ElectionHeader';
import ElectionCard from '../components/voting/ElectionCard';
import ElectionAccessGuard from '../components/voting/ElectionAccessGuard';
import StudentBallot from '../components/voting/StudentBallot';
import BallotConfirmationModal from '../components/voting/BallotConfirmationModal';
import ClubElectionManager from '../components/voting/ClubElectionManager';
import VotingProgress from '../components/voting/VotingProgress';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useClubs } from '../context/ClubContext';
import { useToast } from '../context/ToastContext';

// ====================== CREATE ELECTION MODAL ======================
const makeEmptyCandidate = () => ({
  id: `cand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  position: '',
  party: ''
});

const CreateElectionModal = ({ isOpen, onClose, onSuccess, clubId, clubName, currentUserId }) => {
  const [title, setTitle] = useState('');
  const [endDate, setEndDate] = useState('');
  const [candidates, setCandidates] = useState([makeEmptyCandidate(), makeEmptyCandidate()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const updateCandidateField = (index, field, value) => {
    setCandidates(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addCandidateRow = () => setCandidates(prev => [...prev, makeEmptyCandidate()]);

  const removeCandidateRow = (index) => {
    setCandidates(prev => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !endDate) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const trimmedCandidates = candidates.map(c => ({
      ...c,
      name: c.name.trim(),
      position: c.position.trim(),
      party: c.party.trim()
    }));

    if (trimmedCandidates.some(c => !c.name || !c.position)) {
      showToast('Every candidate needs a name and a position.', 'error');
      return;
    }
    if (trimmedCandidates.length < 2) {
      showToast('Add at least two candidates.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCandidates = trimmedCandidates.map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        party: c.party || 'Independent',
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0D8ABC&color=fff`
      }));
      const positions = [...new Set(finalCandidates.map(c => c.position))];

      await addDoc(collection(db, 'elections'), {
        title: title.trim(),
        clubId,
        clubName: clubName || 'MuniCircle Club',
        status: 'Active',
        positions,
        endDate: new Date(endDate).toISOString(),
        createdBy: currentUserId,
        voters: [],
        voteCounts: {},
        candidates: finalCandidates,
        createdAt: serverTimestamp()
      });

      showToast('Election launched successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Firestore Error: ", error);
      showToast('Failed to launch election. Verify leader status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-syne font-black text-2xl uppercase tracking-tighter">New Election</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Election Title</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors" 
              placeholder="e.g., Executive Council 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">End Date & Time</label>
            <input 
              type="datetime-local" 
              className="w-full px-6 py-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Candidates</label>
              <button
                type="button"
                onClick={addCandidateRow}
                disabled={isSubmitting}
                className="text-[10px] font-black uppercase tracking-widest text-brand hover:opacity-70 transition-opacity"
              >
                + Add Candidate
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    className="w-full px-3 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors text-sm"
                    value={candidate.name}
                    onChange={(e) => updateCandidateField(index, 'name', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    placeholder="Position (e.g. President)"
                    className="w-full px-3 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors text-sm"
                    value={candidate.position}
                    onChange={(e) => updateCandidateField(index, 'position', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeCandidateRow(index)}
                    disabled={isSubmitting || candidates.length <= 2}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors p-2"
                    aria-label="Remove candidate"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <input
                    type="text"
                    placeholder="Party / affiliation (optional)"
                    className="col-span-2 w-full px-3 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors text-sm"
                    value={candidate.party}
                    onChange={(e) => updateCandidateField(index, 'party', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button variant="primary" type="submit" className="w-full py-5 rounded-2xl font-black uppercase tracking-widest" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                Launching...
              </>
            ) : 'Launch Election'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// ====================== MAIN VOTING VIEW ======================
const Voting = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { myClubs, loading: clubsLoading } = useClubs(); 
  const { showToast } = useToast();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [pendingSelections, setPendingSelections] = useState(null);

  // STRICT ACCESS CONFIGURATION: Explicitly isolating Club Leaders for layout dashboards
  const isClubLeader = profile?.role === 'Club Leader';

  const activeClubId = profile?.clubId || myClubs?.[0]?.id || "mock_club_id";
  const activeClubName = myClubs?.[0]?.name || "Your Primary Organization";

  const isMemberOf = (clubId) => {
    return myClubs?.some(club => club.id === clubId) || false;
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'elections'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setElections(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const currentElection = elections.find(e => e.id === selectedElectionId);

  const getSelectedCandidateContext = () => {
    if (!currentElection || !pendingSelections) return null;
    const firstPositionKey = Object.keys(pendingSelections)[0];
    const targetCandidateId = pendingSelections[firstPositionKey];
    const fallbackFlatCandidates = Array.isArray(currentElection.candidates)
      ? currentElection.candidates
      : Object.values(currentElection.candidates || {}).flat();
    return fallbackFlatCandidates.find(c => c.id === targetCandidateId);
  };

  // Multi-position ballots select more than one candidate; the confirmation
  // modal only has room to show one in detail, so we surface how many more
  // were selected alongside it rather than silently losing them.
  const getSelectedCandidatesSummary = () => {
    const entries = pendingSelections ? Object.entries(pendingSelections) : [];
    if (entries.length === 0) return { position: null, additionalSelections: 0 };
    const [firstPosition] = entries[0];
    return { position: firstPosition, additionalSelections: entries.length - 1 };
  };

  const handleBallotSubmit = async (selections) => {
    setPendingSelections(selections);
    setIsConfirmModalOpen(true);
    return true; 
  };

  const handleConfirmFinalVote = async () => {
    if (!pendingSelections || !selectedElectionId || !user) return;

    setIsSubmittingVote(true);
    try {
      const electionRef = doc(db, 'elections', selectedElectionId);
      const selectedCandidateIds = Object.values(pendingSelections);

      // Atomically bump each selected candidate's tally and record the voter.
      const tallyUpdates = {};
      selectedCandidateIds.forEach((candidateId) => {
        tallyUpdates[`voteCounts.${candidateId}`] = increment(1);
      });

      await updateDoc(electionRef, {
        ...tallyUpdates,
        voters: arrayUnion(user.uid)
      });

      // Immutable audit record of exactly what this voter selected.
      await addDoc(collection(db, 'elections', selectedElectionId, 'ballots'), {
        voterId: user.uid,
        selections: pendingSelections,
        castAt: serverTimestamp()
      });

      showToast('Your ballot has been securely signed and submitted!', 'success');
      setIsConfirmModalOpen(false);
      setPendingSelections(null);
      setSelectedElectionId(null);
      navigate('/history');
    } catch (error) {
      console.error("Ballot submission error:", error);
      showToast(error.message || 'Failed to submit your ballot. Please try again.', 'error');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  if (loading || clubsLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-slate-500 font-medium">
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-brand text-3xl mr-4" />
        Synchronizing with governance nodes...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-48 px-6 py-12 animate-in fade-in duration-500">
      
      {/* CONDITIONAL DASHBOARD: Hidden entirely from Members and System Admins */}
      {isClubLeader && (
        <ClubElectionManager 
          clubName={activeClubName}
          totalActive={elections.filter(e => e.status === 'Active').length}
          userRole={profile?.role}
          totalElections={elections.length}
          onCreateElection={() => setIsCreateModalOpen(true)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-syne font-black text-4xl tracking-tight uppercase">Available Ballots</h2>
            <p className="text-sm text-slate-400 mt-1">Select an election window to display structural options (Ongoing, Upcoming, or Closed)</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => navigate('/history')}>
            <FontAwesomeIcon icon={faHistory} className="mr-2" /> Voting History
          </Button>
        </div>

        {elections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {elections.map(election => (
              <ElectionCard
                key={election.id}
                election={election}
                currentUserId={user?.uid}
                isMember={isMemberOf(election.clubId)}
                userRole={profile?.role}
                onEnter={() => setSelectedElectionId(election.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-20 text-center border-dashed border-2">
            <p className="text-slate-400 font-medium text-lg">No elections recorded at present.</p>
          </Card>
        )}
      </div>

      {currentElection && (
        <div className="mt-20 border-t-2 pt-20 border-slate-100 dark:border-slate-800/60 scroll-mt-6">
          <ElectionAccessGuard
            userRole={profile?.role}
            isMember={isMemberOf(currentElection.clubId)}
            election={currentElection}
          >
            <ElectionHeader 
              clubName={currentElection.clubName}
              electionTitle={currentElection.title}
              endDate={currentElection.endDate}
              status={currentElection.status}
              userRole={profile?.role}
              isMember={isMemberOf(currentElection.clubId)}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 items-start">
              <div className="lg:col-span-2">
                <StudentBallot 
                  election={currentElection}
                  isMember={isMemberOf(currentElection.clubId)}
                  hasVotedInitial={currentElection.voters?.includes(user?.uid)}
                  isSubmitting={isSubmittingVote}
                  onVoteSubmit={handleBallotSubmit}
                />
              </div>

              <div className="sticky top-6">
                <VotingProgress candidates={currentElection.candidates} />
              </div>
            </div>
          </ElectionAccessGuard>
        </div>
      )}

      {isClubLeader && (
        <CreateElectionModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => setIsCreateModalOpen(false)}
          clubId={activeClubId}
          clubName={activeClubName}
          currentUserId={user?.uid}
        />
      )}

      <BallotConfirmationModal
        isOpen={isConfirmModalOpen}
        isSubmitting={isSubmittingVote}
        candidate={getSelectedCandidateContext()}
        position={getSelectedCandidatesSummary().position}
        additionalSelections={getSelectedCandidatesSummary().additionalSelections}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmFinalVote}
      />
    </div>
  );
};

export default Voting;