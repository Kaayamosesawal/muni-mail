import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faPlusCircle, faSearch, faTimes, 
  faArrowRight, faHourglassHalf, faCheckCircle, faShieldHalved,
  faCalendarCheck, faUsers, faTrophy
} from '@fortawesome/free-solid-svg-icons';

// Firebase
import { 
  collection, query, where, onSnapshot, 
  addDoc, serverTimestamp, getDocs, limit, doc, updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/index';

// Components & Hooks
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProfileStats from '../components/profile/ProfileStats';
import ElectionCard from '../components/voting/ElectionCard';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [allClubs, setAllClubs] = useState([]);
  const [myActiveClubs, setMyActiveClubs] = useState([]);
  const [myPendingRequests, setMyPendingRequests] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Listeners
  useEffect(() => {
    const safeUid = profile?.uid || user?.uid;
    if (!safeUid) return;

    // 1. All Clubs
    const qClubs = query(collection(db, "clubs"));
    const unsubClubs = onSnapshot(qClubs, (snapshot) => {
      setAllClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Clubs listener error:", error);
    });

    // 2. User's Active Memberships
    const qMyMemberships = query(
      collection(db, "members"), 
      where("memberId", "==", safeUid)
    );
    const unsubMembers = onSnapshot(qMyMemberships, (snapshot) => {
      setMyActiveClubs(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }, (error) => {
      console.error("Members listener error:", error);
    });

    // 3. User's Pending Requests Tracker
    const qMyRequests = query(
      collection(db, "joinRequests"),
      where("userId", "==", safeUid),
      where("status", "==", "pending")
    );
    const unsubPendingReqs = onSnapshot(qMyRequests, (snapshot) => {
      setMyPendingRequests(snapshot.docs.map(doc => doc.data().clubId));
    }, (error) => {
      console.error("Requests listener error:", error);
    });

    // 4. Live + Upcoming Elections
    const qElections = query(
      collection(db, "elections"), 
      where("status", "in", ["Active", "Upcoming"]),
      limit(4)
    );
    const unsubElections = onSnapshot(qElections, (snapshot) => {
      setActiveElections(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })).sort((a, b) => {
        const order = { 'Active': 1, 'Upcoming': 2 };
        return order[a.status] - order[b.status];
      }));
    }, (error) => {
      console.error("Elections listener error:", error);
    });

    return () => {
      unsubClubs();
      unsubMembers();
      unsubPendingReqs();
      unsubElections();
    };
  }, [profile?.uid, user?.uid]);

  // Join Club Request Handling
  const handleJoinRequest = async (club) => {
    const safeUid = profile?.uid || user?.uid;
    if (!safeUid) return showToast("Please sign in", "error");
    
    setRequestingId(club.id);

    try {
      const q = query(
        collection(db, "joinRequests"),
        where("userId", "==", safeUid),
        where("clubId", "==", club.id),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        showToast("Request already pending", "info");
        return;
      }

      // Safe parameter sanitization against undefined crashes
      const safeName = profile?.fullName || profile?.displayName || user?.displayName || "Scholar";
      const safeEmail = profile?.email || user?.email || "";

      await addDoc(collection(db, "joinRequests"), {
        userId: safeUid,
        userName: safeName,
        userEmail: safeEmail,
        clubId: club.id,
        clubName: club.name || "Unknown Club",
        status: "pending",
        requestedAt: serverTimestamp()
      });

      // Award +10 Reputation safely
      const userRef = doc(db, "users", safeUid);
      await updateDoc(userRef, {
        points: (profile?.points || 0) + 10
      });

      showToast(`Applied to ${club.name} (+10 Rep!)`, "success");
    } catch (err) {
      console.error("Submission crash caught:", err);
      showToast("Submission failed", "error");
    } finally {
      // FIXED: Corrected spelling from 'finaly' to 'finally'
      setRequestingId(null);
    }
  };

  // FIXED: Explicit structural alignment for the filter loop
  const filteredRegistry = allClubs.filter(club => {
    const isMember = myActiveClubs.some(m => m.clubId === club.id);
    const matchesSearch = (club.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (club.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return !isMember && matchesSearch;
  });

  const canCreate = ['Admin', 'Club Leader', 'Staff'].includes(profile?.role);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
      
      {/* Dynamic Header */}
      <header className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 overflow-hidden border-2 border-slate-50 dark:border-slate-800">
            <img 
              src={profile?.clubImage || user?.photoURL || `https://ui-avatars.com/api/?name=${profile?.fullName || 'Scholar'}&background=0066FF&color=fff`} 
              className="w-full h-full object-cover" 
              alt="Profile" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-syne font-black uppercase tracking-tighter dark:text-white leading-none">
              Hi, {profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'}!
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Muni University • {profile?.role || 'Member'}
            </p>
          </div>
        </div>

        <div className="flex gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <ProfileStats label="Active Hubs" value={myActiveClubs.length} icon={faUsers} />
          <ProfileStats label="Reputation" value={profile?.points || 0} icon={faTrophy} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-12">
          
          {/* My Active Hubs */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faRocket} className="text-brand" /> My Active Hubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveClubs.length > 0 ? myActiveClubs.map(club => (
                <div 
                  key={club.id} 
                  onClick={() => navigate(`/clubs/${club.clubId}`)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-brand/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <img 
                      src={club.clubImage || club.image || `https://ui-avatars.com/api/?name=${club.clubName || 'Club'}`} 
                      className="w-full h-full object-cover" 
                      alt={club.clubName || 'Club Hub'} 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-syne font-bold text-sm dark:text-white">{club.clubName || 'Assigned Circle'}</h4>
                    <p className="text-emerald-500 text-[9px] font-black flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      ACTIVE MEMBER
                    </p>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-center">
                  <p className="text-slate-400 font-dm text-sm">You haven't joined any circles yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Discover Circles */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <FontAwesomeIcon icon={faPlusCircle} className="text-emerald-500" /> Discover Circles
              </h2>
              <div className="relative w-full md:w-80">
                <FontAwesomeIcon icon={searchQuery ? faTimes : faSearch} 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" />
                <input 
                  type="text" 
                  placeholder="Search clubs..." 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand outline-none dark:text-white"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredRegistry.length > 0 ? filteredRegistry.map(club => {
                const isRequested = myPendingRequests.includes(club.id);
                return (
                  <div key={club.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                      <img 
                        src={club.image || `https://ui-avatars.com/api/?name=${club.name || 'Muni'}`} 
                        className="w-14 h-14 rounded-2xl object-cover" 
                        alt={club.name} 
                      />
                      <div>
                        <h4 className="font-bold dark:text-white">{club.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{club.description}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleJoinRequest(club)}
                      disabled={requestingId === club.id || isRequested}
                      className={`px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        isRequested 
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                          : "bg-slate-900 hover:bg-brand text-white dark:bg-brand dark:text-black dark:hover:bg-white disabled:opacity-50"
                      }`}
                    >
                      {requestingId === club.id ? "Requesting..." : isRequested ? "Sent" : "Join"}
                    </button>
                  </div>
                );
              }) : (
                <p className="text-center py-10 text-slate-400 font-dm text-sm">No more clubs to discover at the moment.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-brand" /> Live & Upcoming
            </h2>
            
            {activeElections.length > 0 ? (
              activeElections.map(election => (
                <ElectionCard 
                  key={election.id}
                  election={election}
                  isMember={true}
                  currentUserId={profile?.uid || user?.uid}
                  userRole={profile?.role}
                  onEnter={() => navigate(`/voting/${election.id}`)}
                />
              ))
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center">
                <p className="text-slate-400 text-sm font-dm">No active or upcoming elections right now.</p>
              </div>
            )}
          </section>

          {/* Leadership Portal */}
          {canCreate && (
            <div 
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-br from-brand to-brand/90 p-8 rounded-[2.5rem] text-white cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden shadow-xl"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="text-3xl mb-4" />
              <h3 className="font-syne font-black text-xl uppercase tracking-tight">Leadership Portal</h3>
              <p className="text-sm opacity-90 font-dm">Manage your campus circle registry</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;