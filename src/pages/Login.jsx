import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { 
  faUniversity, 
  faVoteYea, 
  faNewspaper,
  faShieldAlt,
  faMobileAlt,
  faHandHolding
} from '@fortawesome/free-solid-svg-icons';

// Hooks & Firebase
import { auth, provider } from '../firebase';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (window.deferredPrompt && !isStandalone) {
      setDeferredPrompt(window.deferredPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (!isStandalone) {
        setDeferredPrompt(e);
        setIsInstallable(true);
        window.deferredPrompt = e;
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      setIsInstallable(false);
      showToast("MuniCircle added to home screen!", "success");
    };

    const handleConnectivityChange = () => setIsOffline(!navigator.onLine);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      window.deferredPrompt = null;
    }
    setDeferredPrompt(null);
  };

  const handleGoogleLogin = async () => {
    if (isOffline) {
      showToast("Internet connection required to login.", "error");
      return;
    }
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email.endsWith('@muni.ac.ug')) {
        const msg = "Access Denied: Please use your official @muni.ac.ug email.";
        setErrorMessage(msg);
        showToast(msg, "error");
        await auth.signOut(); 
      } else {
        const additionalInfo = getAdditionalUserInfo(result);
        if (additionalInfo?.isNewUser) {
          navigate('/onboarding');
        } else {
          showToast(`Welcome back, ${user.displayName.split(' ')[0]}!`, "success");
          navigate('/');
        }
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setIsLoggingIn(false);
        return;
      }
      setErrorMessage("Authentication failed.");
      showToast("Error during login.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 transition-colors dark:bg-slate-950">
      
      {/* LEFT/TOP - HERO SECTION */}
      <div className="bg-slate-900 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden lg:flex-1 lg:min-h-screen">
        {/* Decorative background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]"></div>

        <div className="max-w-md text-white relative z-10 w-full">
          {/* Header/Logo Branding */}
          <div className="flex items-center gap-4 mb-6 lg:mb-16 justify-center lg:justify-start">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-600 rounded-2xl lg:rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 overflow-hidden">
              <img src="muni_2.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-2xl lg:text-4xl font-syne font-black tracking-tighter leading-none uppercase">MuniCircle</div>
              <div className="text-[8px] lg:text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">University Clubs Hub</div>
            </div>
          </div>

          {/* Desktop Only Content - Hidden on Mobile for "Header" feel */}
          <div className="hidden lg:block">
            <h1 className="text-6xl font-syne font-black leading-[0.9] mb-8 tracking-tight">
              Connect. <br />
              <span className="text-blue-600">Engage.</span> <br />
              Evolve.
            </h1>
            <p className="text-lg font-dm text-slate-400 mb-12 max-w-sm leading-relaxed">
              The exclusive digital sanctuary for the Muni University community.
            </p>

            <div className="space-y-5">
              {[
                { icon: faUniversity, text: "Circle Management", color: "text-blue-400" },
                { icon: faVoteYea, text: "Secure E-Voting", color: "text-emerald-400" },
                { icon: faHandHolding, text: "Event Updates", color: "text-pink-400" },
                { icon: faNewspaper, text: "Campus News", color: "text-amber-400" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4 group cursor-default">
                  <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg transition-all group-hover:scale-110 ${feature.color}`}>
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <p className="text-sm font-bold font-syne text-slate-300 tracking-wide uppercase">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Only Tagline - Brief and Professional */}
          <div className="lg:hidden text-center">
             <p className="text-sm font-syne font-bold text-slate-300 uppercase tracking-widest">
               Connect • Engage • Evolve
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT/BOTTOM - LOGIN ACTION */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-right-8 duration-700">
          
          {isOffline && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center gap-3 animate-pulse">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Offline Mode: Limited functionality</span>
            </div>
          )}

          <div className="mb-8 lg:mb-12 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-syne font-black text-slate-900 dark:text-white mb-3 tracking-tight">Get Started</h2>
            <p className="text-slate-500 dark:text-slate-400 font-dm text-base lg:text-lg">Sign in to access with official university email "@muni.ac.ug" only.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || isOffline}
            className={`w-full h-14 lg:h-16 flex items-center justify-center gap-4 border-2 rounded-full transition-all font-syne font-black shadow-sm active:scale-95 ${
              isOffline ? 'bg-slate-100 border-slate-200 text-slate-400 grayscale' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-600'
            }`}
          >
            {isLoggingIn ? (
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FontAwesomeIcon icon={faGoogle} size="xl" className={isOffline ? 'text-slate-400' : 'text-red-600'} />
                <span className="uppercase tracking-[0.2em] text-[12px] lg:text-sm">
                  {isOffline ? 'Waiting for Connection...' : 'Continue with Google'}
                </span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold flex items-center gap-3 uppercase tracking-wider">
              <FontAwesomeIcon icon={faShieldAlt} />
              {errorMessage}
            </div>
          )}

          {isInstallable && (
            <div className="mt-10 lg:mt-12 flex items-center justify-between p-2 pl-6 bg-slate-900 rounded-full border border-white/5 shadow-xl">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faMobileAlt} className="text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">MuniCircle App</span>
                  <span className="text-[7px] text-slate-500 font-bold uppercase tracking-tight mt-1">Ready for Home Screen</span>
                </div>
              </div>
              <button 
                className="px-6 py-3 bg-blue-600 text-white text-[9px] font-black rounded-full hover:bg-blue-500 transition-all uppercase tracking-widest"
                onClick={handleInstallClick}
              >
                Install
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;