import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCheck, 
  faGraduationCap, 
  faIdCard, 
  faMagic, 
  faQuoteLeft,
  faCalendarAlt,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Components
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Utils & Hooks
import { FACULTIES, USER_ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CompleteProfile = () => {
  const { user, profile: currentUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams(); // Capture the ID from the URL (e.g., /profile/123)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Logic: If no userId is in URL, or the ID matches the logged-in user, it's "Own Profile"
  const isOwnProfile = !userId || userId === user?.uid;

  const [formData, setFormData] = useState({
    displayName: '',
    faculty: '',
    role: 'Student',
    bio: '',
    yearOfStudy: '1',
    program: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          // Case 1: Loading current user's data from auth context or Firestore
          if (currentUserProfile) {
            setFormData({
              displayName: currentUserProfile.displayName || user?.displayName || '',
              faculty: currentUserProfile.faculty || '',
              role: currentUserProfile.role || 'Student',
              bio: currentUserProfile.bio || '',
              yearOfStudy: currentUserProfile.yearOfStudy || '1',
              program: currentUserProfile.program || ''
            });
          }
        } else {
          // Case 2: Fetching another user's profile from Firestore
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData({
              displayName: data.displayName || 'Muni Student',
              faculty: data.faculty || '',
              role: data.role || 'Student',
              bio: data.bio || '',
              yearOfStudy: data.yearOfStudy || '1',
              program: data.program || ''
            });
          } else {
            showToast("User profile not found", "error");
            navigate('/feed');
          }
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        showToast("Error loading profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUserProfile, user, isOwnProfile, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile || !user?.uid) return;
    
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      showToast("Identity updated successfully!", "success");
      navigate('/profile'); 
    } catch (error) {
      showToast("Failed to save changes", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="font-syne font-black text-slate-400 uppercase tracking-widest text-xs">Scanning Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Back Button - Essential for navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 text-slate-400 hover:text-brand transition-colors flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Sanctuary
      </button>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-brand text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20">
          <FontAwesomeIcon icon={isOwnProfile ? faMagic : faIdCard} size="2xl" />
        </div>
        <h1 className="text-4xl font-syne font-black text-slate-900 tracking-tight">
          {isOwnProfile ? "Refine Your Identity" : formData.displayName}
        </h1>
        <p className="text-slate-500 font-dm mt-2 text-lg">
          {isOwnProfile ? "Update your academic standing and bio in the Circle." : `${formData.role} • ${formData.faculty}`}
        </p>
      </div>

      <Card className="p-8 md:p-12 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input 
              label="Full Name"
              icon={faIdCard}
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              disabled={!isOwnProfile}
              required
            />

            <Input 
              label="Academic Program"
              icon={faGraduationCap}
              value={formData.program}
              onChange={(e) => setFormData({...formData, program: e.target.value})}
              disabled={!isOwnProfile}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1">
                <FontAwesomeIcon icon={faUserCheck} className="text-brand" /> Role
              </label>
              <select 
                disabled={!isOwnProfile}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-dm font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all appearance-none disabled:opacity-70"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {Object.values(USER_ROLES).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1">
                <FontAwesomeIcon icon={faGraduationCap} className="text-brand" /> Faculty
              </label>
              <select 
                disabled={!isOwnProfile}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-dm font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all appearance-none disabled:opacity-70"
                value={formData.faculty}
                onChange={(e) => setFormData({...formData, faculty: e.target.value})}
              >
                <option value="">Select Faculty</option>
                {FACULTIES.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-brand" /> Year
              </label>
              <select 
                disabled={!isOwnProfile}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-dm font-bold focus:ring-4 focus:ring-brand/10 outline-none transition-all appearance-none disabled:opacity-70"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
              >
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1">
              <FontAwesomeIcon icon={faQuoteLeft} className="text-brand" /> About
            </label>
            <textarea 
              disabled={!isOwnProfile}
              className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-8 py-6 text-sm font-dm font-medium focus:ring-4 focus:ring-brand/10 outline-none transition-all min-h-[150px] resize-none disabled:opacity-70"
              placeholder={isOwnProfile ? "Tell the Circle about yourself..." : "No bio provided."}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          {isOwnProfile && (
            <div className="pt-6">
              <Button 
                variant="primary" 
                className="w-full py-5 rounded-[2.5rem] font-syne font-black uppercase tracking-widest text-sm" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Sanctuary..." : "Save Identity"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfile;