import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase/index'; 
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FACULTIES } from '../utils/constants';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Onboarding = () => {
  const { user, profile, setNeedsOnboarding, setProfile } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMuniUser = user?.email?.endsWith('@muni.ac.ug');

  const facultyList = FACULTIES || [
    "Faculty of Technoscience",
    "Faculty of Education",
    "Faculty of Health Sciences",
    "Faculty of Science",
    "Faculty of Management Science",
    "Faculty of Agriculture & Environmental Sciences"
  ];
  
  const STATUS_OPTIONS = {
    STUDENT: 'Student',
    STAFF: 'Staff',
    ALUMNI: 'Alumni'
  };

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    username: '',
    faculty: '',
    program: '',
    department: '', 
    yearOfStudy: '1',
    startYear: currentYear - 3,
    endYear: currentYear,
    bio: '',
    communityStatus: STATUS_OPTIONS.STUDENT 
  });

  if (!user || !isMuniUser) return <Navigate to="/login" replace />;
  if (profile?.onboarded) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.username.trim() || !formData.faculty) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanUsername = formData.username.trim();
      const userHandle = cleanUsername.toLowerCase().replace(/\s/g, '_');
      const userRef = doc(db, "users", user.uid);
      
      const userData = {
        uid: user.uid,
        email: user.email,
        username: userHandle,
        displayName: cleanUsername,
        faculty: formData.faculty,
        program: formData.communityStatus !== STATUS_OPTIONS.STAFF ? formData.program : 'N/A',
        department: formData.communityStatus === STATUS_OPTIONS.STAFF ? formData.department : 'N/A',
        yearOfStudy: formData.communityStatus === STATUS_OPTIONS.STUDENT ? formData.yearOfStudy : 'N/A',
        startYear: formData.communityStatus === STATUS_OPTIONS.STUDENT ? Number(formData.startYear) : null,
        endYear: formData.communityStatus !== STATUS_OPTIONS.STAFF ? Number(formData.endYear) : null,
        bio: formData.bio,
        communityStatus: formData.communityStatus, 
        role: 'Member', 
        onboarded: true, 
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${cleanUsername}&background=0066FF&color=fff`,
        isVerified: false,
        points: 10,
      };

      // serverTimestamp() is a write-only sentinel — it resolves on the
      // server, not locally. Firestore gets it; local state gets a real
      // Date so anything reading profile.joinedAt right after onboarding
      // (e.g. relative-time formatting elsewhere in the app) doesn't choke
      // on an object with no .toMillis()/.toDate().
      await setDoc(userRef, { ...userData, joinedAt: serverTimestamp() }, { merge: true });
      setProfile({ ...userData, joinedAt: new Date() });
      setNeedsOnboarding(false); 
      showToast("Welcome to the Circle!");
      
    } catch (err) {
      console.error("Onboarding error:", err);
      showToast("Submission failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 lg:p-12 my-auto border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        
        <header className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
            <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
          </div>
          <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Complete Profile
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Role</label>
            <select 
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
              value={formData.communityStatus}
              onChange={(e) => setFormData({...formData, communityStatus: e.target.value})}
            >
              {Object.values(STATUS_OPTIONS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
            <input 
              required
              type="text"
              placeholder="Full Name"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Faculty Select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Faculty / Division</label>
            <select 
              required
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
              value={formData.faculty}
              onChange={(e) => setFormData({...formData, faculty: e.target.value})}
            >
              <option value="" disabled>Select Faculty</option>
              {facultyList.map(f => <option key={f} value={f}>{f}</option>)}
              {formData.communityStatus === STATUS_OPTIONS.STAFF && (
                <optgroup label="Administration">
                    <option value="Central Administration">Central Administration</option>
                    <option value="University Library">University Library</option>
                    <option value="Dean of Students Office">Dean of Students Office</option>
                    <option value="Support Staff Division">Support Staff Division</option>
                </optgroup>
              )}
            </select>
          </div>

          {/* Staff Specific Field: Department/Office */}
          {formData.communityStatus === STATUS_OPTIONS.STAFF && (
            <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department / Office</label>
                <input 
                    type="text"
                    placeholder="e.g. Finance, ICT Helpdesk, Security"
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
            </div>
          )}

          {/* Student Specific: Year of Study */}
          {formData.communityStatus === STATUS_OPTIONS.STUDENT && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Year</label>
              <select 
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
              >
                {[1, 2, 3, 4, 5].map(year => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </div>
          )}

          {/* Program Select: Academic Programs Dropdown */}
          {formData.communityStatus !== STATUS_OPTIONS.STAFF && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Program</label>
              <select 
                required
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
                value={formData.program}
                onChange={(e) => setFormData({...formData, program: e.target.value})}
              >
                <option value="" disabled>Select Program</option>
                <optgroup label="Higher Education Certificates">
                  <option value="Higher Education Certificate in Humanities">Higher Education Certificate in Humanities</option>
                  <option value="Higher Education Certificate in Biological Sciences">Higher Education Certificate in Biological Sciences</option>
                  <option value="Higher Education Certificate in Physical Sciences">Higher Education Certificate in Physical Sciences</option>
                </optgroup>
                <optgroup label="Bachelors Degrees">
                  <option value="BSc. Education (Biological)">BSc. Education (Biological)</option>
                  <option value="BSc. Education (Biological-Physical Education)">BSc. Education (Biological-Physical Education)</option>
                  <option value="BSc. Education (Physical)">BSc. Education (Physical)</option>
                  <option value="BSc. Education (Physical Education)">BSc. Education (Physical Education)</option>
                  <option value="BSc. Education (Computer Studies)">BSc. Education (Computer Studies)</option>
                  <option value="BSc. Education (Economics)">BSc. Education (Economics)</option>
                  <option value="BSc. Education (Agriculture)">BSc. Education (Agriculture)</option>
                  <option value="BSc. (Physical)">BSc. (Physical)</option>
                  <option value="BSc. (Biological)">BSc. (Biological)</option>
                  <option value="BSc. Agriculture">BSc. Agriculture</option>
                  <option value="BSc. Environment and Natural Resources">BSc. Environment and Natural Resources</option>
                  <option value="BSc. Nursing">BSc. Nursing</option>
                  <option value="BSc. Medical Laboratory">BSc. Medical Laboratory</option>
                  <option value="Bachelor of Information Systems">Bachelor of Information Systems</option>
                  <option value="Bachelor of Information Technology">Bachelor of Information Technology</option>
                  <option value="Bachelor of Economics">Bachelor of Economics</option>
                  <option value="Bachelor of Procurement and Supply Chain Management">Bachelor of Procurement and Supply Chain Management</option>
                  <option value="Bachelor of Business Administration and Management">Bachelor of Business Administration and Management</option>
                  <option value="Bachelor of Education Primary (Arts)">Bachelor of Education Primary (Arts)</option>
                  <option value="Bachelor of Education Primary (Sciences)">Bachelor of Education Primary (Sciences)</option>
                  <option value="Bachelor of Education (Secondary)">Bachelor of Education (Secondary)</option>
                  <option value="Bachelor of Early Childhood Care and Education">Bachelor of Early Childhood Care and Education</option>
                </optgroup>
                <optgroup label="Postgraduate Programs">
                  <option value="PGD in Human Resource Management">PGD in Human Resource Management</option>
                  <option value="PGD in Financial Management">PGD in Financial Management</option>
                  <option value="PGD in Education">PGD in Education</option>
                  <option value="MSc. Computer Science">MSc. Computer Science</option>
                  <option value="MSc. Artificial Intelligence">MSc. Artificial Intelligence</option>
                  <option value="MSc. Chemistry">MSc. Chemistry</option>
                  <option value="MSc. Biodiversity Conservation">MSc. Biodiversity Conservation</option>
                  <option value="MSc. Mathematics">MSc. Mathematics</option>
                  <option value="MSc. Climate Change and Disaster Risk Management">MSc. Climate Change and Disaster Risk Management</option>
                  <option value="Master of Public Health">Master of Public Health</option>
                  <option value="Master of Education (Education Planning and Management)">Master of Education (Education Planning and Management)</option>
                  <option value="Master of Tourism and Hospitality Management">Master of Tourism and Hospitality Management</option>
                  <option value="Master of Business Administration">Master of Business Administration</option>
                </optgroup>
              </select>
            </div>
          )}

          {/* Timeline Row */}
          <div className="grid grid-cols-2 gap-4">
            {formData.communityStatus === STATUS_OPTIONS.STUDENT && (
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entry Year</label>
                    <input 
                        type="number"
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
                        value={formData.startYear}
                        onChange={(e) => setFormData({...formData, startYear: e.target.value})}
                    />
                </div>
            )}
            
            {formData.communityStatus !== STATUS_OPTIONS.STAFF && (
                <div className={`${formData.communityStatus === STATUS_OPTIONS.ALUMNI ? 'col-span-2' : ''} space-y-1`}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        {formData.communityStatus === STATUS_OPTIONS.ALUMNI ? 'Year of Graduation' : 'Expected Graduation'}
                    </label>
                    <input 
                        type="number"
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-bold text-slate-900 dark:text-white"
                        value={formData.endYear}
                        onChange={(e) => setFormData({...formData, endYear: e.target.value})}
                    />
                </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio / What Inspires You</label>
            <textarea 
              placeholder="Tell the Circle about yourself..."
              rows="2"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-dm font-medium resize-none text-slate-900 dark:text-white"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand text-white py-4 rounded-xl font-syne font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'Syncing...' : 'Join the Circle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;