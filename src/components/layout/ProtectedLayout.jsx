import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import PostComposer from '../feed/PostComposer';
import { useState } from 'react';

const ProtectedLayout = () => {
  const { user, loading } = useAuthContext();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // 1. Show a clean loading state while Firebase checks the session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/10 border-t-brand rounded-full animate-spin"></div>
          <p className="font-syne font-bold text-slate-400 text-xs uppercase tracking-widest">
            Entering the Circle...
          </p>
        </div>
      </div>
    );
  }

  // 2. Redirect to login if no user is found
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg selection:bg-brand/10 selection:text-brand">
      {/* Global Navigation */}
      <TopNav onOpenComposer={() => setIsComposerOpen(true)} />
      
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto pt-20 flex">
        
        {/* Left Column: Fixed Navigation */}
        <Sidebar />

        {/* Middle Column: Scrollable Feed/Content */}
        <main className="flex-1 lg:ml-64 xl:mr-80 p-4 md:p-8 min-h-[calc(100vh-80px)]">
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Right Column: Widgets & Info */}
        <RightSidebar />
      </div>

      {/* Mobile Experience */}
      <MobileNav />

      {/* Global Components triggered from TopNav or Feed */}
      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onPost={(data) => {
          console.log("New Post Data:", data);
          // This will later connect to your postController.js
        }}
      />
    </div>
  );
};

export default ProtectedLayout;