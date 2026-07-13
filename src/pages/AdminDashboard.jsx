// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/index';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, 
  faUsers, 
  faCrown, 
  faExclamationTriangle,
  faPlusCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AdminPortal from './AdminPortal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ADMIN_ROLES = ['Admin', 'System Admin', 'Staff'];

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({ users: 0, clubs: 0, reports: 0 });
  const [pendingClubs, setPendingClubs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [permissionIssues, setPermissionIssues] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const isAuthorized = ADMIN_ROLES.includes(profile?.role);

  const loadDashboardData = useCallback(async () => {
    // Only query collections that actually exist with rules that allow
    // this admin to read them. "reports" isn't a built feature yet (no
    // collection, no rule) — querying it just produces a permanent
    // permission-denied error with no way to fix it from the frontend.
    // Re-add it here once the reports feature and its Firestore rule
    // actually exist.
    const sources = [
      { key: 'users', label: 'Users' },
      { key: 'clubs', label: 'Clubs' }
    ];

    const results = await Promise.allSettled(
      sources.map(s => getDocs(collection(db, s.key)))
    );

    const nextStats = { users: 0, clubs: 0, reports: 0 };
    const denied = [];
    let nextPendingClubs = [];

    results.forEach((result, i) => {
      const { key, label } = sources[i];
      if (result.status === 'fulfilled') {
        if (key === 'clubs') {
          const allClubs = result.value.docs.map(d => ({ id: d.id, ...d.data() }));
          nextPendingClubs = allClubs.filter(c => c.status === 'Pending');
          nextStats.clubs = allClubs.filter(c => c.status !== 'Pending').length;
        } else {
          nextStats[key] = result.value.size;
        }
      } else {
        // Surface exactly which collection + rule is the problem instead
        // of a single opaque "failed to load" for the whole page.
        console.error(`Admin stats: "${key}" read denied —`, result.reason?.code || result.reason);
        denied.push(label);
      }
    });

    setStats(nextStats);
    setPendingClubs(nextPendingClubs);
    setPermissionIssues(denied);
    setLastUpdated(new Date());

    if (denied.length > 0) {
      showToast(
        `Missing permissions for: ${denied.join(', ')}. Check Firestore rules for this admin's role.`,
        'error'
      );
    }
  }, [showToast]);

  useEffect(() => {
    // Don't fire a single Firestore read until auth has actually finished
    // restoring the session AND we've confirmed the profile's role.
    // onAuthStateChanged resolves asynchronously — querying before it does
    // sends requests with no auth token attached, which security rules
    // reject as "Missing or insufficient permissions" even for a real
    // admin. This is a timing bug, not a rules bug, and it's easy to
    // mistake for one.
    if (authLoading || !user || !isAuthorized) return;
    loadDashboardData();
  }, [authLoading, user, isAuthorized, loadDashboardData]);

  const handleApproveClub = async (clubId) => {
    try {
      await updateDoc(doc(db, "clubs", clubId), {
        status: 'Active',
        approvedBy: user?.uid,
        approvedAt: serverTimestamp()
      });
      showToast('Club approved and now live.', 'success');
      loadDashboardData();
    } catch (err) {
      console.error("Approve club error:", err);
      showToast('Failed to approve club.', 'error');
    }
  };

  const handleRejectClub = async (clubId) => {
    if (!window.confirm('Reject and remove this club application?')) return;
    try {
      await deleteDoc(doc(db, "clubs", clubId));
      showToast('Club application rejected.', 'success');
      loadDashboardData();
    } catch (err) {
      console.error("Reject club error:", err);
      showToast('Failed to reject club.', 'error');
    }
  };

  const formatRelativeTime = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <AdminPortal>
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-slate-900 text-brand rounded-2xl shadow-lg shadow-brand/10">
          <FontAwesomeIcon icon={faUserShield} size="2xl" />
        </div>
        <div>
          <h1 className="text-4xl font-syne font-black text-slate-900 dark:text-white tracking-tight">Admin Protocol</h1>
          <p className="text-slate-500 font-dm font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            Global Circle Oversight 
            {lastUpdated && (
              <span className="text-[9px] text-slate-400 font-normal">• Updated {formatRelativeTime(lastUpdated)}</span>
            )}
          </p>
        </div>
      </div>

      {permissionIssues.length > 0 && (
        <div className="mb-8 flex items-start gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-700 dark:text-red-400">
              Couldn't load: {permissionIssues.join(', ')}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">
              Firestore denied these reads for the signed-in admin. Check that this account's role
              matches what your security rules expect, and that a "list" rule actually exists for
              each collection above (a rule that only allows reading a single doc by ID won't
              cover a collection-wide query like this one).
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={faUsers} label="Total Students" value={stats.users} color="text-blue-500" />
        <StatCard icon={faCrown} label="Active Circles" value={stats.clubs} color="text-amber-500" />
        <StatCard icon={faExclamationTriangle} label="Reports" value={stats.reports} color="text-red-500" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Registration Section */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-syne font-black text-xl text-slate-900 dark:text-white">Register New Club</h3>
              <FontAwesomeIcon icon={faPlusCircle} className="text-brand text-xl" />
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-500 text-sm font-dm mb-4">Initialize a new campus circle and assign its founding leader.</p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-brand/20"
              >
                Open Registration Form
              </button>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm">
            <h3 className="font-syne font-black text-xl mb-6 text-slate-900 dark:text-white">Pending Approvals</h3>
            {pendingClubs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-400 font-dm text-sm">No new applications to the circles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClubs.map(club => (
                  <div key={club.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">{club.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{club.leaderEmail}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveClub(club.id)}
                        className="px-4 py-2 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClub(club.id)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Developer / System Logs Section */}
        <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-syne font-black text-xl">Developer Logs</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-green-500 opacity-50"></span>
            </div>
          </div>
          
          <ul className="space-y-6 font-dm text-xs">
            <LogItem label="Firebase Auth Gateway" status="ONLINE" statusColor="text-green-500" />
            <LogItem label="Storage Bucket (PWA Icons)" status="ACTIVE" statusColor="text-green-500" />
            <LogItem label="Muni Domain Restriction" status="STRICT" statusColor="text-brand" />
            <LogItem label="Cloud Firestore Rules" status="ENFORCED" statusColor="text-brand" />
          </ul>

          <div className="mt-12 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Environment Info</p>
            <code className="text-brand text-[10px]">Production v1.0.0-stable</code>
          </div>
        </Card>

      </div>

      <RegisterClubModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={loadDashboardData}
        adminUid={user?.uid}
      />
    </AdminPortal>
  );
};

const RegisterClubModal = ({ isOpen, onClose, onSuccess, adminUid }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !leaderEmail.trim()) {
      showToast('Club name and founding leader email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'clubs'), {
        name: name.trim(),
        description: description.trim(),
        leaderEmail: leaderEmail.trim().toLowerCase(),
        status: 'Pending',
        memberCount: 0,
        createdBy: adminUid,
        createdAt: serverTimestamp()
      });

      showToast('Club submitted for approval.', 'success');
      setName('');
      setDescription('');
      setLeaderEmail('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Club registration error:", err);
      showToast('Failed to register club.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-syne font-black text-2xl uppercase tracking-tighter">Register Club</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Club Name</label>
            <input
              type="text"
              className="w-full px-6 py-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors"
              placeholder="e.g., Robotics Guild"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
            <textarea
              rows="3"
              className="w-full px-6 py-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors resize-none"
              placeholder="What does this circle do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Founding Leader Email</label>
            <input
              type="email"
              className="w-full px-6 py-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:border-brand transition-colors"
              placeholder="leader@muni.ac.ug"
              value={leaderEmail}
              onChange={(e) => setLeaderEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button variant="primary" type="submit" className="w-full py-5 rounded-2xl font-black uppercase tracking-widest" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <Card className="p-8 flex items-center gap-6 border-none shadow-sm hover:translate-y-[-4px] transition-all duration-300 group">
    <div className={`text-3xl ${color} group-hover:scale-110 transition-transform`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white">{value}</h2>
    </div>
  </Card>
);

const LogItem = ({ label, status, statusColor }) => (
  <li className="flex justify-between items-center border-b border-slate-800 pb-3">
    <span className="text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={`${statusColor} font-black tracking-tighter`}>{status}</span>
  </li>
);

export default AdminDashboard;