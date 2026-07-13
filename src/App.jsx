import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Hooks & Contexts
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import Contact from './pages/Contact';
import Download from './pages/Download';

// Auth & Protected Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import NewsFeed from './pages/NewsFeed';
import Events from './pages/Events';
import Voting from './pages/Voting'; 
import HelpSupport from './pages/HelpSupport';
import Settings from './pages/Settings'; 
import MemberDirectory from './pages/MemberDirectory'; 
import ClubManagement from './pages/ClubManagement'; 
import ClubLeaderPortal from './pages/ClubLeaderPortal'; 
import ClubModeration from './pages/ClubModeration';
import AdminDashboard from './pages/AdminDashboard';
import UserDirectory from './pages/admin/UserDirectory'; 
import CompleteProfile from './pages/CompleteProfile';

// Layout Wrappers
import AdminPortal from './pages/AdminPortal'; 
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';

const App = () => {
  const { user, profile, loading, needsOnboarding } = useAuth();
  const isMuniUser = user?.email?.endsWith('@muni.ac.ug');

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-syne font-bold text-slate-400 dark:text-slate-500 animate-pulse text-xs uppercase tracking-widest">Entering the Circle...</p>
      </div>
    );
  }

  // Navigation logic
  const showAppNav = user && !needsOnboarding;
  const isAdminOrStaff = profile?.role === 'Admin' || profile?.role === 'Staff';

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
        
        {/* Only show TopNav if logged in and onboarded */}
        {showAppNav && <TopNav />}

        <main className={`flex-grow transition-all duration-300 ${
          showAppNav ? "pt-24 pb-24 md:pt-28 md:pb-8" : ""
        }`}>
          <div className={showAppNav ? "max-w-7xl mx-auto px-4 md:px-8" : ""}>
            <Routes>
              
              {/* --- 1. THE LANDING PAGE (ENTRY POINT) --- */}
              {/* This ensures Home appears first for guests. Only redirects if already logged in. */}
              <Route 
                path="/" 
                element={
                  !user 
                    ? (<Home />) 
                    : (needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" replace />)
                } 
              />

              {/* --- 2. PUBLIC GUEST ROUTES --- */}
              <Route path="/download" element={<Download />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Login is now a secondary page reached from Home */}
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
              
              <Route 
                path="/onboarding" 
                element={user && isMuniUser && needsOnboarding ? <Onboarding /> : <Navigate to="/dashboard" replace />} 
              />

              {/* --- 3. PROTECTED CORE ROUTES --- */}
              <Route path="/dashboard" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Dashboard />) : <Navigate to="/login" />} />
              <Route path="/feed" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <NewsFeed />) : <Navigate to="/login" />} />
              <Route path="/events" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Events />) : <Navigate to="/login" />} />
              <Route path="/directory" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <MemberDirectory />) : <Navigate to="/login" />} />
              <Route path="/voting" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Voting />) : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Settings />) : <Navigate to="/login" />} />
              <Route path="/help" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <HelpSupport />) : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <CompleteProfile />) : <Navigate to="/login" />} />
              <Route path="/profile/:userId" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <CompleteProfile />) : <Navigate to="/login" />} />

              {/* --- 4. ROLE-BASED ACCESS --- */}
              <Route 
                path="/moderation" 
                element={user && (profile?.role === 'Club Leader' || profile?.role === 'Admin') 
                    ? (needsOnboarding ? <Navigate to="/onboarding" /> : <ClubModeration />) 
                    : <Navigate to="/" replace />
                } 
              />

              <Route 
                path="/leader-portal" 
                element={user && (profile?.role === 'Club Leader' || profile?.role === 'Admin') 
                    ? (needsOnboarding ? <Navigate to="/onboarding" /> : <ClubLeaderPortal />) 
                    : <Navigate to="/" replace />
                } 
              />

              {/* --- 5. ADMIN SECTION --- */}
              {/* Uses wildcard to allow the AdminDashboard internal links to work */}
              <Route 
                path="/admin/*" 
                element={user && isAdminOrStaff
                    ? <AdminPortal><AdminDashboard /></AdminPortal> 
                    : <Navigate to="/" replace />
                } 
              />
              
              <Route 
                path="/admin/users" 
                element={user && profile?.role === 'Admin'
                    ? <AdminPortal><UserDirectory /></AdminPortal> 
                    : <Navigate to="/" replace />
                } 
              />

              <Route 
                path="/admin/clubs" 
                element={user && isAdminOrStaff
                    ? <AdminPortal><ClubManagement /></AdminPortal> 
                    : <Navigate to="/" replace />
                } 
              />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {showAppNav && <BottomNav />}
      </div>
    </Router>
  );
};

export default App;