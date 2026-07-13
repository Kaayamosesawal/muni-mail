import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faUserCircle, faGraduationCap, 
  faUsers, faEnvelope, faIdBadge, faFilter 
} from '@fortawesome/free-solid-svg-icons';

// Firebase
import { db } from '../firebase/index';
import { collection, query, getDocs, where, limit, orderBy } from 'firebase/firestore';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MemberDirectory = () => {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [loading, setLoading] = useState(true);

  // Optimized fetch function
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "users"), 
        orderBy("joinedAt", "desc"), 
        limit(30)
      );
      
      if (selectedFaculty !== 'All') {
        q = query(
          collection(db, "users"), 
          where("faculty", "==", selectedFaculty),
          orderBy("joinedAt", "desc"), 
          limit(30)
        );
      }

      const querySnapshot = await getDocs(q);
      let userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        userList = userList.filter(user => 
          user.displayName?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
        );
      }

      setMembers(userList);
    } catch (error) {
      console.error("Error fetching directory:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFaculty, searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const faculties = ['All', 'FSTE', 'Faculty of Health Sciences', 'Faculty of Education', 'Faculty of Agriculture'];

  // Relative time helper (consistent with NewsFeed)
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const postTime = timestamp?.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
    const diff = Math.floor((now - postTime) / 1000);

    if (diff < 86400) return 'Recently';
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      
      {/* Header & Search Bar */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="z-10 text-center md:text-left">
          <h1 className="text-4xl font-syne font-black text-white uppercase tracking-tighter mb-2">Member Directory</h1>
          <p className="text-slate-400 font-dm">Connect with {members.length}+ peers across Muni.</p>
        </div>

        <div className="w-full md:w-1/2 relative z-10">
          <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name or @username..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-dm focus:bg-white/10 focus:ring-4 focus:ring-brand/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {faculties.map((fac) => (
          <button
            key={fac}
            onClick={() => setSelectedFaculty(fac)}
            className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedFaculty === fac 
                ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
            }`}
          >
            {fac}
          </button>
        ))}
      </div>

      {/* Member Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.length > 0 ? members.map((member) => (
            <Card key={member.id} className="p-0 border-none bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden">
              <div className="h-24 bg-slate-50 dark:bg-slate-800 relative">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
              </div>

              <div className="px-6 pb-8 -mt-12 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 p-1.5 shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={member.photoURL || `https://ui-avatars.com/api/?name=${member.displayName}&background=random`} 
                    className="w-full h-full object-cover rounded-[1.7rem]" 
                    alt={member.displayName} 
                  />
                </div>

                <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                  {member.displayName}
                </h3>
                <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">
                  @{member.username || 'muni_student'}
                </p>

                <div className="space-y-3 w-full mb-6">
                  <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[10px]" />
                    <span className="text-[11px] font-bold font-dm">{member.faculty || 'General'}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                    <span className="text-[11px] font-medium">
                      {member.clubName || 'Independent'}
                    </span>
                  </div>

                  {member.role && (
                    <div className="flex items-center justify-center gap-2">
                      <span className={`inline-block px-3 py-0.5 text-[10px] font-black rounded-full ${
                        member.role === 'Admin' ? 'bg-red-100 text-red-600' : 
                        member.role === 'Staff' ? 'bg-amber-100 text-amber-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button variant="outline" className="rounded-xl py-3 border-slate-100 dark:border-slate-800 hover:bg-brand hover:text-white group-hover:border-brand transition-all">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </Button>
                  <Button variant="secondary" className="rounded-xl py-3 text-[9px] font-black uppercase">
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-slate-200 mb-4"><FontAwesomeIcon icon={faUserCircle} size="4x" /></div>
              <h3 className="text-xl font-syne font-bold text-slate-400 uppercase">No members found</h3>
              <p className="text-slate-400 font-dm text-sm mt-2">Try a different faculty or search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;