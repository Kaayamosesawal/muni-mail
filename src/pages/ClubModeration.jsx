import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserPlus, faFileExport, 
  faCamera, faCheck, faTimes, faTrash, faBan, faShieldAlt,
  faCircleNotch, faCheckCircle, faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';

// Firebase Services
import { db, uploadImage } from '../firebase/index'; 
import { 
  doc, collection, query, where, onSnapshot, 
  serverTimestamp, updateDoc, setDoc, deleteDoc
} from 'firebase/firestore';

// jsPDF Core & AutoTable Plugin
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utils & Hooks
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ClubModeration = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Unified Realtime Subscriptions
  useEffect(() => {
    if (!profile?.clubId || !['Club Leader', 'Admin', 'Staff'].includes(profile?.role)) {
      setLoading(false);
      return;
    }

    const clubId = profile.clubId;
    let isMounted = true;

    const unsubClub = onSnapshot(doc(db, "clubs", clubId), (snap) => {
      if (snap.exists() && isMounted) {
        setClub({ id: snap.id, ...snap.data() });
      }
    });

    const unsubMembers = onSnapshot(
      query(collection(db, "members"), where("clubId", "==", clubId)), 
      (snap) => {
        if (isMounted) {
          setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }
    );

    const unsubReqs = onSnapshot(
      query(collection(db, "joinRequests"), where("clubId", "==", clubId), where("status", "==", "pending")), 
      (snap) => {
        if (isMounted) {
          setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }
      }
    );

    return () => { 
      isMounted = false;
      unsubClub(); 
      unsubMembers(); 
      unsubReqs(); 
    };
  }, [profile?.clubId, profile?.role]);

  // Clean, Uncomplicated Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP, and GIF images are allowed", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large! Maximum limit is 2MB.", "error");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Direct, Non-complex Logo Upload Pipeline
  const handleCommitLogo = async () => {
    if (!imageFile || !club) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await uploadImage(imageFile);
      
      await updateDoc(doc(db, "clubs", club.id), { 
        image: compressedBase64,
        updatedAt: serverTimestamp() 
      });

      showToast("Club logo updated successfully!", "success");
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Logo Upload Error:", err);
      showToast("Failed to update logo. Please try a different image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // FIXED: Reliable Join Request Processing
  const handleProcessRequest = async (request, approved) => {
    if (!request?.id || !club?.id) {
      showToast("Invalid request data", "error");
      return;
    }

    try {
      if (approved) {
        const memberId = `${request.userId}_${club.id}`;

        // 1. Create member document
        try {
          await setDoc(doc(db, "members", memberId), {
            userId: request.userId,
            clubId: club.id,
            clubName: club.name,
            clubImage: club.image || '',
            fullName: request.userName || 'Unknown User',
            email: request.userEmail || '',
            joinedAt: serverTimestamp(),
            isSuspended: false,
            role: 'Member'
          });
          console.log(`✅ Member created successfully: ${memberId}`);
        } catch (memberErr) {
          console.error("Failed to create member document:", memberErr);
          throw new Error("Failed to add member to club");
        }

        // 2. Try to update user profile (often blocked by security rules - handled gracefully)
        try {
          await updateDoc(doc(db, "users", request.userId), { 
            clubId: club.id, 
            clubName: club.name,
            clubImage: club.image || '' 
          });
          console.log(`✅ User profile updated for: ${request.userId}`);
        } catch (userErr) {
          console.warn("Could not update user profile (security rules may restrict this):", userErr);
          // This is acceptable - we still added them to members
        }
      }

      // 3. Delete the join request
      try {
        await deleteDoc(doc(db, "joinRequests", request.id));
        console.log(`✅ Join request processed and deleted: ${request.id}`);
      } catch (deleteErr) {
        console.warn("Failed to delete join request (may already be gone):", deleteErr);
      }

      showToast(
        approved 
          ? `${request.userName} has been successfully added to the club!` 
          : `Request from ${request.userName} was declined.`,
        approved ? "success" : "info"
      );

    } catch (err) {
      console.error("Process Request Error:", err);
      showToast("Action failed. Please try again or check console.", "error");
    }
  };

  // Clean, Seamless jsPDF Export Engine
  const exportRosterPDF = () => {
    if (!club || members.length === 0) {
      showToast("No records available to export.", "error");
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`${club.name.toUpperCase()} - ROSTER`, 14, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Official Membership Listing | Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    
    const tableHeaders = [["Index", "Full Name", "Email Address", "Status"]];
    const tableRows = members.map((member, index) => [
      index + 1,
      member.fullName || 'N/A',
      member.email || 'N/A',
      member.isSuspended ? 'Suspended' : 'Active'
    ]);

    autoTable(doc, {
      startY: 32,
      head: tableHeaders,
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { font: "Helvetica", fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 15 }, 3: { cellWidth: 30 } }
    });

    doc.save(`${club.name.replace(/\s+/g, '_')}_membership_roster.pdf`);
    showToast("Roster PDF downloaded successfully!", "success");
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center font-syne text-[10px] font-black tracking-[0.4em] text-slate-400 animate-pulse">
        SYNCHRONIZING AUTHORITY...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Club Identity Header */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl flex flex-col lg:flex-row gap-10 items-center border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className={`w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-inner transition-all duration-500 ${isUploading ? 'opacity-40 scale-95' : 'opacity-100'}`}>
              <img 
                src={previewUrl || club?.image || `https://ui-avatars.com/api/?name=${club?.name || 'C'}&background=0066FF&color=fff`} 
                className="w-full h-full object-cover" 
                alt="Club Logo"
              />
            </div>
            <label className="absolute inset-0 bg-brand/80 rounded-[2.5rem] flex items-center justify-center cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100">
              <FontAwesomeIcon 
                icon={isUploading ? faCircleNotch : faCamera} 
                className={`text-white text-2xl ${isUploading ? 'animate-spin' : ''}`} 
              />
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={isUploading} 
              />
            </label>
          </div>
          
          <p className="text-[8px] font-black uppercase tracking-tighter text-slate-400">
            {imageFile ? `Selected: ${(imageFile.size / 1024).toFixed(0)}KB` : 'Click Logo to Change'}
          </p>
        </div>
        
        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-full">Circle Verified</span>
            {imageFile && (
              <button 
                onClick={handleCommitLogo}
                disabled={isUploading}
                className="px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                {isUploading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-syne font-black uppercase tracking-tighter dark:text-white mb-2">{club?.name}</h1>
          <p className="text-slate-500 font-dm font-medium text-lg italic">"Directing the future of this organization."</p>
        </div>

        <Button 
          onClick={exportRosterPDF} 
          className="bg-slate-900 dark:bg-brand text-white px-10 py-5 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-2xl transition-all hover:-translate-y-1"
        >
          <FontAwesomeIcon icon={faFileExport} className="mr-3" /> Export Roster
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Incoming Requests */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-brand flex items-center gap-2 px-2">
            <FontAwesomeIcon icon={faUserPlus} /> Incoming Requests ({requests.length})
          </h3>
          
          <div className="space-y-4">
            {requests.length > 0 ? requests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                <div className="min-w-0 mr-2">
                  <p className="font-black text-sm dark:text-white truncate">{req.userName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{req.userEmail}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleProcessRequest(req, true)} 
                    className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button 
                    onClick={() => handleProcessRequest(req, false)} 
                    className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                No pending join requests
              </p>
            )}
          </div>
        </div>

        {/* Member Roster Table */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
            <FontAwesomeIcon icon={faShieldAlt} /> Official Membership Roster ({members.length})
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-6">Member Profile</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {members.map(m => (
                  <tr key={m.id} className="group hover:bg-slate-50/50 dark:hover:bg-brand/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-syne font-bold text-slate-400 uppercase">
                          {m.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-white">{m.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-tight">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-9 h-9 text-slate-300 hover:text-brand transition-colors"><FontAwesomeIcon icon={faBan} /></button>
                        <button className="w-9 h-9 text-slate-300 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubModeration;