import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config'; // Verified configuration path alignment
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where,
  setDoc
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUniversity, faUserTie, faLink, faPlusCircle, faTimes, faIdCard,
  faBan, faTrash, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Fixed missing import

const ClubManagement = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [clubs, setClubs] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(null);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', category: 'Academic', description: '' });

  const isAuthorized = profile?.role === 'Admin' || profile?.role === 'Staff' || profile?.role === 'Club Leader';

  useEffect(() => {
    if (!authLoading && profile) {
      if (!isAuthorized) {
        showToast("Unauthorized Access", "error");
        navigate('/dashboard');
      }
    }
  }, [profile, authLoading, navigate, showToast, isAuthorized]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const clubSnap = await getDocs(collection(db, "clubs"));
      setClubs(clubSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const leaderQuery = query(
        collection(db, "users"), 
        where("role", "in", ["Club Leader", "Staff", "Student"]) // Added student so you can promote them to leader
      );
      const leaderSnap = await getDocs(leaderQuery);
      setLeaders(leaderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      showToast("Error loading registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!authLoading && profile && isAuthorized) {
      fetchData(); 
    }
  }, [authLoading, profile, isAuthorized]);

  const handleToggleStatus = async (clubId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await updateDoc(doc(db, "clubs", clubId), { status: newStatus });
      showToast(`Club ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`, "success");
      fetchData();
    } catch (error) {
      showToast("Failed to update club status", "error");
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${clubName}? This action cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, "clubs", clubId));
      showToast(`${clubName} has been removed from the registry`, "success");
      fetchData();
    } catch (error) {
      showToast("Failed to delete club", "error");
    }
  };

  const handleRegisterClub = async (e) => {
    e.preventDefault();
    try {
      const slug = newClub.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      await addDoc(collection(db, "clubs"), {
        ...newClub,
        slug,
        leaderId: null,
        leaderName: 'Unassigned',
        memberCount: 0,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      showToast(`${newClub.name} registered!`, "success");
      setShowRegisterModal(false);
      setNewClub({ name: '', category: 'Academic', description: '' });
      fetchData();
    } catch (err) {
      showToast("Failed to register club", "error");
    }
  };

  const assignLeaderToClub = async (clubId, leaderId, leaderName) => {
    try {
      // 1. Update the Club Document details and increment the initial member count
      await updateDoc(doc(db, "clubs", clubId), { 
        leaderId, 
        leaderName,
        memberCount: 1 
      });
      
      // 2. Map the User collection data details
      await updateDoc(doc(db, "users", leaderId), { 
        clubId,
        role: "Club Leader" 
      });

      // 3. Document write inside the mappings: Makes the leader the first club member
      const memberDocId = `${clubId}_${leaderId}`;
      await setDoc(doc(db, "members", memberDocId), {
        memberId: leaderId,
        clubId: clubId,
        memberName: leaderName,
        role: "Club Leader",
        joinedAt: serverTimestamp()
      });

      showToast("Leader linked and registered as member!", "success");
      setIsAssigning(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast("Update assignment failed", "error");
    }
  };

  if (authLoading || loading) return (
    <div className="h-96 flex items-center justify-center animate-pulse text-slate-400 font-syne font-bold uppercase tracking-widest">
      Checking Registry Permissions...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tight">Club Registry</h1>
          <p className="text-slate-500 font-dm">System-wide management of student organizations.</p>
        </div>
        
        {isAuthorized && (
          <Button 
            onClick={() => setShowRegisterModal(true)}
            className="rounded-2xl px-6 py-4 bg-brand text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-transform"
          >
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Register New Club
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map(club => (
          <Card key={club.id} className={`p-8 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] transition-opacity ${club.status === 'disabled' ? 'opacity-60' : ''}`}>
             <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${club.status === 'disabled' ? 'bg-slate-200 text-slate-500' : 'bg-brand/5 text-brand'} rounded-2xl flex items-center justify-center text-xl`}>
                  <FontAwesomeIcon icon={faUniversity} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${club.status === 'disabled' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {club.status === 'disabled' ? 'Disabled' : club.category}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleStatus(club.id, club.status)}
                      className={`p-2 rounded-lg text-xs transition-colors ${club.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={club.status === 'active' ? 'Disable Club' : 'Enable Club'}
                    >
                      <FontAwesomeIcon icon={club.status === 'active' ? faBan : faCheckCircle} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClub(club.id, club.name)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 text-xs transition-colors"
                      title="Delete Club"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-syne font-black text-slate-900 dark:text-white mb-2 uppercase">{club.name}</h3>
              
              <div className="flex items-center gap-3 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <FontAwesomeIcon icon={faUserTie} className="text-slate-400 text-sm" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Current Leader</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{club.leaderName || 'Unassigned'}</p>
                </div>
              </div>

              {isAssigning === club.id ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <select 
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-brand/20 rounded-2xl text-xs font-bold outline-none ring-4 ring-brand/5 dark:text-white"
                    onChange={(e) => {
                        const selected = leaders.find(l => l.id === e.target.value);
                        if(selected) assignLeaderToClub(club.id, selected.id, selected.displayName || selected.username);
                    }}
                  >
                    <option value="">Select a promoted leader...</option>
                    {leaders.map(l => (
                      <option key={l.id} value={l.id}>{l.displayName || 'No Name'} (@{l.username || 'user'})</option>
                    ))}
                  </select>
                  <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-400" onClick={() => setIsAssigning(null)}>Cancel</Button>
                </div>
              ) : (
                isAuthorized && (
                  <Button onClick={() => setIsAssigning(club.id)} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-brand text-white text-[11px] font-black uppercase tracking-widest dark:text-black">
                    <FontAwesomeIcon icon={faLink} className="mr-2" />
                    {club.leaderId ? 'Change Leader' : 'Assign Leader'}
                  </Button>
                )
              )}
          </Card>
        ))}
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-brand transition-colors">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <header className="mb-8">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center text-2xl mb-4">
                <FontAwesomeIcon icon={faIdCard} />
              </div>
              <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tight">New Club</h2>
              <p className="text-slate-500 text-sm font-dm">Establish a new organization in the Circle.</p>
            </header>

            <form onSubmit={handleRegisterClub} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Club Name</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none ring-4 ring-transparent focus:ring-brand/5 font-bold dark:text-white"
                  placeholder="e.g. Muni Tech Society"
                  value={newClub.name}
                  onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                <select 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold appearance-none cursor-pointer dark:text-white"
                  value={newClub.category}
                  onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                >
                  <option>Academic</option>
                  <option>Sports</option>
                  <option>Religious</option>
                  <option>Social</option>
                  <option>Entrepreneurship</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-medium resize-none dark:text-white"
                  placeholder="What is the purpose of this club?"
                  value={newClub.description}
                  onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full py-5 rounded-[2rem] bg-brand text-white font-syne font-black uppercase tracking-widest shadow-xl shadow-brand/20">
                Establish Organization
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;