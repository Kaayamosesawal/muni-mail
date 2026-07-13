import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCalendarCheck, 
  faCog, 
  faChartPie,
  faGavel
} from '@fortawesome/free-solid-svg-icons';

// Firebase
import { db } from '../firebase/index';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ClubElectionManager from '../components/voting/ClubElectionManager';

// Hooks & Utils
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatNumber } from '../utils/formatter';

const ClubLeaderPortal = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [clubData, setClubData] = useState(null);
  const [activeElectionsCount, setActiveElectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- ROLE-BASED ACCESS CONTROL ---
  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        navigate('/login');
        return;
      }
      
      const isAuthorized = ['Club Leader', 'Admin'].includes(profile.role);

      if (!isAuthorized) {
        showToast("Access Denied: Leader permissions required", "error");
        navigate('/feed'); 
      }
    }
  }, [profile, authLoading, navigate, showToast]);

  // --- FETCH PORTAL DATA ---
  const fetchPortalData = useCallback(async () => {
    if (!profile?.clubId) {
        setLoading(false);
        return;
    };
    
    try {
      // 1. Fetch Club Details
      const clubDoc = await getDoc(doc(db, "clubs", profile.clubId));
      if (clubDoc.exists()) setClubData(clubDoc.data());

      // 2. Fetch Active Elections for this club
      const electionQuery = query(
        collection(db, "elections"),
        where("clubId", "==", profile.clubId),
        where("status", "==", "Active")
      );
      const electionSnap = await getDocs(electionQuery);
      setActiveElectionsCount(electionSnap.size);

    } catch (error) {
      console.error("Portal Fetch Error:", error);
      showToast("Error loading portal data", "error");
    } finally {
      setLoading(false);
    }
  }, [profile?.clubId, showToast]);

  useEffect(() => {
    if (!authLoading && profile?.clubId) {
        fetchPortalData();
    }
  }, [profile, authLoading, fetchPortalData]);

  const handleCreateElection = () => {
    navigate('/governance/create', { state: { clubId: profile.clubId } });
  };

  if (authLoading || loading) return (
    <div className="h-96 flex items-center justify-center text-slate-400 font-syne font-bold uppercase tracking-[0.3em] animate-pulse">
      Verifying Governance Rights...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0">
      
      {/* Leader Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="brand" className="px-4 py-1 rounded-lg">
              {clubData?.name || 'Organization'} Leader
            </Badge>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Verified Session
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Leader Console
          </h1>
          <p className="text-slate-500 font-dm mt-2 text-lg">
            Direct administrative control for <span className="text-slate-900 dark:text-brand font-bold">{clubData?.name}</span>.
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Link to="/moderation" className="flex-1">
            <Button className="w-full bg-brand hover:bg-brand/90 text-blue rounded-2xl px-8 py-5 shadow-xl shadow-brand/30 transition-all duration-300">
              <FontAwesomeIcon icon={faCog} className="mr-3 opacity-75" />
              Leadership Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            label: "Member Base", 
            val: clubData?.memberCount || 0, 
            icon: faUsers, 
            color: "text-blue-500", 
            bg: "bg-blue-50/50" 
          },
          { 
            label: "Live Elections", 
            val: activeElectionsCount, 
            icon: faGavel, 
            color: "text-brand", 
            bg: "bg-brand/5" 
          },
          { 
            label: "Event Velocity", 
            val: "High", 
            icon: faChartPie, 
            color: "text-orange-500", 
            bg: "bg-orange-50/50" 
          }
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-none shadow-sm flex items-center gap-6 p-8 rounded-[2.5rem] hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 ${stat.bg} dark:bg-white/5 ${stat.color} rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-syne font-black text-slate-900 dark:text-white tracking-tighter">
                {typeof stat.val === 'number' ? formatNumber(stat.val) : stat.val}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* --- ELECTION MANAGEMENT SECTION --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <h2 className="font-syne font-black text-sm uppercase tracking-[0.2em] text-slate-400">
            Governance & Voting
          </h2>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        
        <ClubElectionManager 
          clubName={clubData?.name} 
          totalActive={activeElectionsCount}
          onCreateElection={handleCreateElection}
        />
      </section>

      <div className="pt-10 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
          Secure Management Portal • Encrypted TLS v1.3
        </p>
      </div>
    </div>
  );
};

export default ClubLeaderPortal;