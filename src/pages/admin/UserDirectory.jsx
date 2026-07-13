// src/pages/admin/UserDirectory.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserGraduate, faCheckCircle, faUser } from '@fortawesome/free-solid-svg-icons';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const q = query(collection(db, "users"), orderBy("joinedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setUsers(userList);
    } catch (err) {
      console.error(err);
      showToast("Error loading users.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update user role
  const updateRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { 
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      
      showToast(`User role updated to ${newRole}`, "success");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error(err);
      showToast("Permission denied. Only Admins can do this.", "error");
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const postTime = timestamp?.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
    const diff = Math.floor((now - postTime) / 1000);

    if (diff < 86400) return 'Recently';
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-slate-400">Loading User Directory...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tight">
            User Directory
          </h1>
          <p className="text-slate-500 text-sm">Manage roles and permissions • {users.length} total</p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Last updated: {formatRelativeTime(users[0]?.updatedAt || users[0]?.joinedAt)}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Role</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} 
                      alt="" 
                      className="w-9 h-9 rounded-2xl object-cover border border-slate-100" 
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {u.displayName || u.username}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {u.faculty || 'General'}
                  </span>
                </td>
                <td className="px-6 py-4 text-[11px] text-slate-500">
                  {formatRelativeTime(u.joinedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      u.role === 'Admin' ? 'bg-red-500' : 
                      u.role === 'Staff' ? 'bg-amber-500' : 
                      u.role === 'Club Leader' ? 'bg-brand' : 'bg-slate-400'
                    }`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {u.role || 'Student'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {u.role !== 'Admin' && (
                    <button 
                      onClick={() => updateRole(u.id, 'Admin')}
                      className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all inline-flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faUserShield} />
                      Make Admin
                    </button>
                  )}
                  
                  {u.role === 'Member' || !u.role && (
                    <button 
                      onClick={() => updateRole(u.id, 'Club Leader')}
                      className="text-[10px] font-black uppercase tracking-widest bg-brand/10 text-brand px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-all inline-flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faUserGraduate} />
                      Make Leader
                    </button>
                  )}

                  {(u.role === 'Admin' || u.role === 'Club Leader' || u.role === 'Staff') && (
                    <button 
                      onClick={() => updateRole(u.id, 'Member')}
                      className="text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-400 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDirectory;