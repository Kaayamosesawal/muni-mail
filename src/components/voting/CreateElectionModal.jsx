import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCheckCircle, 
  faChevronRight, 
  faChevronLeft, 
  faPlus, 
  faTrashAlt, 
  faUpload,
  faCircleNotch,
  faFingerprint,
  faDatabase,
  faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateElectionModal = ({ isOpen, onClose, onElectionCreated, clubId, clubName }) => {
  if (!isOpen) return null;

  const API_BASE_URL = "https://municircle-api.onrender.com/api/v1";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [overview, setOverview] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  const [positions, setPositions] = useState(['President', 'Vice President', 'Secretary']);
  const [newPosition, setNewPosition] = useState('');

  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: 'President',
    slogan: '',
    photoURL: ''
  });

  // Steps Configuration
  const steps = [
    { id: 1, label: 'Overview' },
    { id: 2, label: 'Positions' },
    { id: 3, label: 'Candidates' },
    { id: 4, label: 'Review Ballot' },
    { id: 5, label: 'Launch' }
  ];

  // Handler helpers
  const handleOverviewChange = (e) => {
    setOverview({ ...overview, [e.target.name]: e.target.value });
  };

  const addPosition = () => {
    if (newPosition.trim() && !positions.includes(newPosition.trim())) {
      setPositions([...positions, newPosition.trim()]);
      setNewPosition('');
    }
  };

  const removePosition = (posToRemove) => {
    setPositions(positions.filter(pos => pos !== posToRemove));
    setCandidates(candidates.filter(c => c.position !== posToRemove));
  };

  const addCandidate = () => {
    if (!newCandidate.name.trim()) return;
    setCandidates([...candidates, { ...newCandidate, id: 'cand_' + Date.now() }]);
    setNewCandidate({
      name: '',
      position: positions[0] || '',
      slogan: '',
      photoURL: ''
    });
  };

  const removeCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  // Mock photo upload handler 
  const handlePhotoPlaceholder = () => {
    const urls = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    ];
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    setNewCandidate({ ...newCandidate, photoURL: randomUrl });
  };

  // Step 5 Submit Strategy: Database deployment passing directly through the client parameters
  const launchElectionToDatabase = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    
    const electionPayload = {
      title: overview.title,
      location: overview.location,
      startDate: overview.startDate,
      endDate: overview.endDate,
      clubId: clubId || 'default_club',
      clubName: clubName || 'MuniCircle Hub',
      positions: positions,
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        slogan: c.slogan,
        photoURL: c.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        votes: 0
      })),
      status: 'Active', // Set active automatically upon generation launch
      voters: []
    };

    try {
      const response = await fetch(`${API_BASE_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(electionPayload)
      });

      if (!response.ok) throw new Error('Failed to launch and sync election parameters.');
      
      const result = await response.json();
      if (onElectionCreated) onElectionCreated(result);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Server tracking error during node configuration pipeline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl bg-slate-950/80 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden my-auto">
        
        {/* Modal Header Framework */}
        <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] block mb-1">Governance Deck</span>
            <h3 className="font-syne font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Smart Election</h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Global Structural Process Progress Indicator */}
        <div className="px-10 py-6 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Pipeline Checkpoint</span>
            <div className="flex gap-2 flex-1 md:justify-end max-w-xl w-full">
              {steps.map((step) => (
                <div key={step.id} className="flex-1 text-center group">
                  <div className={`h-2 rounded-full transition-all duration-500 ${step.id <= currentStep ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-tight mt-2 block ${step.id === currentStep ? 'text-brand' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Step Form Fields */}
        <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 text-red-500 text-sm rounded-2xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: OVERVIEW SETTINGS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Election Name *</label>
                  <input type="text" name="title" value={overview.title} onChange={handleOverviewChange} placeholder="e.g., Executive Board General Elections" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand transition-colors text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Polling Location / Node *</label>
                  <input type="text" name="location" value={overview.location} onChange={handleOverviewChange} placeholder="e.g., Virtual (MuniCircle Secure Ledger)" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand transition-colors text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Start Timestamp *</label>
                  <input type="datetime-local" name="startDate" value={overview.startDate} onChange={handleOverviewChange} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand transition-colors text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Closure Timestamp *</label>
                  <input type="datetime-local" name="endDate" value={overview.endDate} onChange={handleOverviewChange} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand transition-colors text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AVAILABLE POSITIONS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex gap-4">
                <input type="text" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} placeholder="Add Custom Authority Seat..." className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand transition-colors text-slate-900 dark:text-white" />
                <button type="button" onClick={addPosition} className="px-6 bg-brand text-white rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-2 font-bold text-sm uppercase tracking-wider"><FontAwesomeIcon icon={faPlus} /> Insert</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                {positions.map((pos) => (
                  <div key={pos} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl flex justify-between items-center group">
                    <span className="font-syne font-bold text-slate-800 dark:text-slate-200">{pos}</span>
                    <button type="button" onClick={() => removePosition(pos)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><FontAwesomeIcon icon={faTrashAlt} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CANDIDATES MANAGEMENT */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                  <input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="Nominee full name" className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Seat</label>
                  <select value={newCandidate.position} onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })} className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white">
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Campaign Slogan / Motto</label>
                  <input type="text" value={newCandidate.slogan} onChange={(e) => setNewCandidate({ ...newCandidate, slogan: e.target.value })} placeholder="Campaign punchline statement..." className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white" />
                </div>
                <div className="md:col-span-2 flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePhotoPlaceholder} className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border ${newCandidate.photoURL ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-700 text-slate-500'} flex items-center gap-2`}><FontAwesomeIcon icon={faUpload} /> {newCandidate.photoURL ? 'Avatar Configured ✓' : 'Upload Display Photo'}</button>
                  <button type="button" onClick={addCandidate} className="px-6 py-2.5 bg-slate-900 dark:bg-brand text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90">Enlist Nominee</button>
                </div>
              </div>

              {/* Candidates Feed Enlisted */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Registered Roster ({candidates.length})</span>
                {candidates.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No candidates assigned to active positions yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {candidates.map((cand) => (
                      <div key={cand.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 relative group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                          <img src={cand.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold font-syne text-slate-900 dark:text-white text-base leading-tight">{cand.name}</p>
                          <p className="text-[10px] text-brand font-black uppercase tracking-widest">{cand.position}</p>
                        </div>
                        <button type="button" onClick={() => removeCandidate(cand.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><FontAwesomeIcon icon={faTrashAlt} size="sm" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & BALLOT VERIFICATION */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-6 border border-white/5 relative overflow-hidden">
                <div className="absolute right-6 top-6 text-white/5 pointer-events-none"><FontAwesomeIcon icon={faFileSignature} size="6x" /></div>
                <div>
                  <span className="text-[9px] font-black uppercase text-brand tracking-[0.25em]">Cryptographic Manifest Review</span>
                  <h4 className="text-2xl font-syne font-black tracking-tight">{overview.title || 'Untitled Assembly Ballot'}</h4>
                  <p className="text-xs text-slate-400 mt-1">Target Endpoint: <span className="font-mono text-brand">{overview.location || 'Not Specified'}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/15">
                  <div>
                    <span className="text-slate-400 block font-bold">LIVESTREAM POLLS FROM</span>
                    <span className="font-mono font-bold text-slate-200">{overview.startDate ? new Date(overview.startDate).toLocaleString() : 'Immediate Action'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">CEASE COLLECTION AT</span>
                    <span className="font-mono font-bold text-slate-200">{overview.endDate ? new Date(overview.endDate).toLocaleString() : 'Manual Disconnect'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ballot Structural Assembly</span>
                {positions.map(pos => {
                  const matchingCands = candidates.filter(c => c.position === pos);
                  return (
                    <div key={pos} className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-syne font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">{pos}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{matchingCands.length} enrollees registered</p>
                      </div>
                      <div className="flex -space-x-2">
                        {matchingCands.map(c => (
                          <div key={c.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden" title={c.name}>
                            <img src={c.photoURL} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: DEPLOYMENT AND LAUNCH READY */}
          {currentStep === 5 && (
            <div className="text-center py-8 space-y-6 max-w-md mx-auto animate-in zoom-in-95 duration-400">
              <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand/80 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-brand/30">
                <FontAwesomeIcon icon={isSubmitting ? faCircleNotch : faFingerprint} size="3xl" className={isSubmitting ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-2">
                <h4 className="font-syne font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tighter">Ready for Launch</h4>
                <p className="text-sm text-slate-500 leading-relaxed">You are about to transmit this complete election structure payload into the distributed live environment database framework.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 font-mono text-[11px] text-left text-slate-400 space-y-1">
                <p className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2"><FontAwesomeIcon icon={faDatabase} className="text-brand" /> PROD_TARGET_URI:</p>
                <p className="overflow-x-auto whitespace-nowrap text-brand font-bold bg-white dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-800">{API_BASE_URL}/elections</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Control Strip Footer */}
        <div className="p-8 md:p-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
          <Button variant="ghost" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1 || isSubmitting} className="font-black uppercase tracking-widest text-xs px-6 py-4 rounded-xl disabled:opacity-30">
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" /> Back
          </Button>

          {currentStep < 5 ? (
            <Button variant="primary" onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))} className="font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg shadow-brand/20">
              Continue <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
            </Button>
          ) : (
            <Button variant="primary" onClick={launchElectionToDatabase} disabled={isSubmitting || !overview.title} className="font-black uppercase tracking-widest text-xs px-10 py-4 rounded-xl shadow-2xl shadow-brand/30 bg-emerald-600 hover:bg-emerald-500 border-none text-white">
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" /> Structuring Ledger Nodes...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Sign & Launch live
                </>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateElectionModal;