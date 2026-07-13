import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Download = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Smart Nav Logic
  const isContact = location.pathname === '/contact';
  const isDownload = location.pathname === '/download';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* --- RESPONSIVE SMART NAV --- */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
        
        {/* Logo/Home Icon */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <img 
              src="/muni_2.png" 
              alt="MuniCircle Logo"
              className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform rounded-lg"
            />
          </div>
          <span className="hidden sm:block font-syne font-black text-xl tracking-tighter">
            Muni<span className="text-brand">Circle</span>
          </span>
        </div>

        <div className="flex gap-3 md:gap-8 items-center">
          {!isContact && (
            <Link to="/contact" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-headset md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Support
              </span>
            </Link>
          )}

          {!isDownload && (
            <Link to="/download" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-cloud-arrow-down md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Download
              </span>
            </Link>
          )}

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

      {/* --- DOWNLOAD CONTENT SECTION --- */}
      <section className="pt-32 pb-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">
            Get <span className="text-brand">MuniCircle</span>
          </h2>
          <p className="opacity-70 max-w-md mx-auto font-medium text-slate-500 dark:text-slate-400">
            Install MuniCircle on your favorite device for the best experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* 1. Android APK Download */}
          <div className="muni-card group border-2 border-transparent hover:border-brand transition-all flex flex-col justify-between p-8 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
            <div>
              <div className="bg-brand/10 text-brand w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-brands fa-android text-3xl"></i>
              </div>
              <h3 className="text-xl font-black mb-2">Android App</h3>
              <p className="opacity-70 mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Download the official APK to install MuniCircle directly into your app drawer with full notification support.
              </p>
            </div>
            <a 
              href="https://drive.google.com/uc?export=download&id=18w34mgG7Y0Ju3PdEclxVsfgFXEPSG0HR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <button className="w-full btn-muni py-4 text-[9px] uppercase tracking-widest">
                Download APK
              </button>
            </a>
          </div>

          {/* 2. Desktop (Windows/Mac/Linux) via Browser */}
          <div className="muni-card group border-2 border-transparent hover:border-brand transition-all flex flex-col justify-between p-8 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
            <div>
              <div className="bg-blue-500/10 text-blue-500 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-laptop text-3xl"></i>
              </div>
              <h3 className="text-xl font-black mb-2">Desktop & Laptop</h3>
              <p className="opacity-70 mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Install as a standalone desktop app using Chrome, Edge, or Brave.
              </p>
              
              {/* Installation Steps */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">1</span>
                  <span>Open MuniCircle in Chrome/Edge</span>
                </div>
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">2</span>
                  <span>Click the <i className="fa-solid fa-display text-brand mx-1"></i> icon in the address bar</span>
                </div>
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">3</span>
                  <span>Select 'Install' to add to taskbar</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-4 text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Go to App
            </button>
          </div>

          {/* 3. iOS (iPhone/iPad) via Safari */}
          <div className="muni-card group border-2 border-transparent hover:border-brand transition-all flex flex-col justify-between p-8 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
            <div>
              <div className="bg-slate-100 text-slate-600 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="fa-brands fa-apple text-3xl"></i>
              </div>
              <h3 className="text-xl font-black mb-2">iOS / iPhone</h3>
              <p className="opacity-70 mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Add MuniCircle to your iPhone home screen for an app-like experience without using the App Store.
              </p>

              {/* Installation Steps */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">1</span>
                  <span>Open Safari and visit this site</span>
                </div>
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">2</span>
                  <span>Tap the 'Share' icon <i className="fa-solid fa-arrow-up-from-bracket text-blue-500 mx-1"></i></span>
                </div>
                <div className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span className="bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">3</span>
                  <span>Select 'Add to Home Screen'</span>
                </div>
              </div>
            </div>
            <div className="w-full py-4 text-center text-[9px] font-black uppercase tracking-widest opacity-40 bg-slate-50 dark:bg-slate-800 rounded-xl">
              Safari Optimized
            </div>
          </div>

        </div>

        {/* Security Note */}
        <p className="mt-16 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
          Multi-Platform Support • Secure Data • MuniCircle 1.0
        </p>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          © 2026 MuniCircle Systems • Arua, Uganda
        </p>
      </footer>
    </div>
  );
};

export default Download;