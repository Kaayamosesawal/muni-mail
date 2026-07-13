import React, { useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to check current path
  const getStartedRef = useRef(null);

  const scrollToQuickLinks = () => {
    getStartedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Logic to hide the current active page from the nav links
  const isHome = location.pathname === '/';
  const isContact = location.pathname === '/contact';
  const isDownload = location.pathname === '/download';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900 dark:text-white">
      
      {/* --- RESPONSIVE SMART NAV --- */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
        
        {/* Logo/Home Icon */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <img 
    src="/muni_2.png" // Replace 'logo.png' with your actual filename
    alt="MuniCircle Logo"
    className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform rounded-lg"
  />
          </div>
          <span className="hidden sm:block font-syne font-black text-xl tracking-tighter">
            Muni<span className="text-brand">Circle</span>
          </span>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <div className="flex gap-3 md:gap-8 items-center">
          
          {/* Support/Contact Link - Hidden if active */}
          {!isContact && (
            <Link to="/contact" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-headset md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Support
              </span>
            </Link>
          )}

          {/* Download Link - Hidden if active */}
          {!isDownload && (
            <Link to="/download" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-cloud-arrow-down md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Download
              </span>
            </Link>
          )}

          {/* Login Button - Always visible, but adapts size */}
          <button 
            onClick={() => navigate('/login')}
            className="btn-muni !px-4 md:!px-8 !py-2 !text-[9px] flex items-center gap-2"
          >
            <i className="fa-solid fa-right-to-bracket md:hidden"></i>
            <span className="hidden md:inline">Sign In</span>
            <span className="md:hidden">Login</span>
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-44 pb-20 text-center container mx-auto px-4">
        <div className="animate-in-view">
          <h1 className="font-syne text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Transforming <span className="text-brand">University's</span> Student Life.
          </h1>
          <p className="font-dm-sans text-lg md:text-xl max-w-2xl mx-auto mb-10 text-slate-500 dark:text-slate-400">
            By unifying every club and association into one seamless ecosystem, MuniCircle simplifies every activity and 
            provides one-click access to the heartbeat of campus life. Built with cutting-edge resilience, our platform ensures
            that your academic and social circles remain connected, providing reliable, mission-critical access to the entire 
            university ecosystem even when the internet fails. This is more than a management tool, it is the digital infrastructure
            for the next generation of Techno-Science leaders.
          </p>
        </div>
      </section>

      {/* --- ABOUT MUNI UNIVERSITY --- */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/50">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="font-syne text-3xl font-black mb-4 uppercase tracking-tight">About our University</h2>
            <p className="font-dm-sans text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              From the heart of Arua City to the forefront of digital transformation, Muni University stands as Uganda’s 6th Public University, 
              a global center of excellence in Techno-Science, Health, and Education. We are ending the era of fragmented records and manual 
              systems. Through MuniCircle, we unify the spirit of innovation with seamless digital integration, empowering the next generation 
              of leaders to manage, grow, and excel in a connected campus ecosystem.
            </p>
            <div className="flex flex-wrap gap-4">
               <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-200">ARUA CITY, UGANDA</span>
               <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-200">TECHNO-SCIENCE HUB</span>
            </div>
          </div>
          <div className="muni-card bg-brand text-white border-none p-8 shadow-2xl shadow-brand/20">
            <h3 className="font-syne text-xl mb-2">MuniCircle Mission</h3>
            <p className="opacity-90 text-sm italic">
              "Ensuring every association at Muni University operates with transparency and 21st-century tools."
            </p>
          </div>
        </div>
      </section>

      {/* --- ONLINE RESOURCES HUB --- */}
      <section ref={getStartedRef} className="py-24 container mx-auto px-6 text-center">
        <h2 className="font-syne text-3xl font-black mb-12 uppercase tracking-tighter">Online Resources Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a href="https://student.muni.ac.ug" target="_blank" rel="noreferrer" className="muni-card hover:bg-brand hover:text-white transition-all group">
            <i className="fa-solid fa-graduation-cap text-2xl mb-3 group-hover:scale-110"></i>
            <h4 className="text-[10px] font-black uppercase tracking-widest">AIMS Portal</h4>
          </a>
          <a href="https://library.muni.ac.ug" target="_blank" rel="noreferrer" className="muni-card hover:bg-brand hover:text-white transition-all group">
            <i className="fa-solid fa-book-open text-2xl mb-3 group-hover:scale-110"></i>
            <h4 className="text-[10px] font-black uppercase tracking-widest">E-Library</h4>
          </a>
          <a href="https://muele.muni.ac.ug" target="_blank" rel="noreferrer" className="muni-card hover:bg-brand hover:text-white transition-all group">
            <i className="fa-solid fa-laptop-code text-2xl mb-3 group-hover:scale-110"></i>
            <h4 className="text-[10px] font-black uppercase tracking-widest">MUELE (LMS)</h4>
          </a>
          <a href="https://muni.ac.ug" target="_blank" rel="noreferrer" className="muni-card hover:bg-brand hover:text-white transition-all group">
            <i className="fa-solid fa-globe text-2xl mb-3 group-hover:scale-110"></i>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Main Site</h4>
          </a>
        </div>
      </section>

      {/* --- CAMPUS FOOTER --- */}
      <section className="pb-24 container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="text-left p-6 border-l-4 border-brand bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">Campus Location</h4>
            <p className="text-xs opacity-70 leading-relaxed">P.O. Box 725, Arua City<br/>Muni Hill, West Nile</p>
         </div>
         <div className="text-left p-6 border-l-4 border-brand bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">Technical Support</h4>
            <p className="text-xs opacity-70 leading-relaxed">support@municircle.com<br/>Muni IT Department</p>
         </div>
         <div className="text-left p-6 border-l-4 border-brand bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-2">Student Affairs</h4>
            <p className="text-xs opacity-70 leading-relaxed">Dean of Students Office<br/>Guild Government Hall</p>
         </div>
      </section>

      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          © 2026 MuniCircle Systems • Arua, Uganda
        </p>
      </footer>
    </div>
  );
};

export default Home;