import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [status, setStatus] = useState('');

  // Smart Nav Logic
  const isHome = location.pathname === '/';
  const isContact = location.pathname === '/contact';
  const isDownload = location.pathname === '/download';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneNumber = "256761060363";
    const text = `Hello MuniCircle Support! My name is ${formData.name}. ${formData.message}`;
    const encodedText = encodeURIComponent(text);
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
    
    setStatus("Connecting to WhatsApp Support...");
    
    setTimeout(() => {
      setFormData({ name: '', message: '' });
      setStatus('');
    }, 3000);
  };

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

        {/* --- DYNAMIC NAVIGATION LINKS --- */}
        <div className="flex gap-3 md:gap-8 items-center">
          
          {/* Support/Contact Link - Hidden if we are on /contact */}
          {!isContact && (
            <Link to="/contact" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-headset md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Support
              </span>
            </Link>
          )}

          {/* Download Link */}
          {!isDownload && (
            <Link to="/download" className="flex flex-col items-center gap-1 group">
              <i className="fa-solid fa-cloud-arrow-down md:hidden text-lg text-slate-400 group-hover:text-brand"></i>
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand transition-all">
                Download
              </span>
            </Link>
          )}

          {/* Login Button */}
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

      {/* --- CONTACT CONTENT SECTION --- */}
      <section id="contact" className="animate-in-view pt-32 pb-24 container mx-auto px-4">
        <div className="max-w-xl mx-auto muni-card border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tighter">Support & Feedback</h2>
            <p className="opacity-70 text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Have a question about your club or finances? <br className="hidden md:block" />
              Message our technical team directly on WhatsApp.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>
                Your Full Name
              </label>
              <input 
                type="text" 
                placeholder="How should we address you?" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="muni-input w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>
                How can we help?
              </label>
              <textarea 
                placeholder="Describe your issue, club query, or suggestion..." 
                rows="5" 
                required 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="muni-input w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand transition-all outline-none resize-none"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="w-full btn-muni py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] transition-colors border-none shadow-lg shadow-green-500/20"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              Chat on WhatsApp
            </button>

            {status && (
              <p className="text-center text-[10px] font-black uppercase text-brand mt-4 animate-pulse tracking-widest">
                {status}
              </p>
            )}
          </form>
        </div>

        {/* Footer Branding */}
        <div className="mt-16 text-center">
          <p className="text-[10px] opacity-30 font-black uppercase tracking-[0.3em]">
            Muni University Association Management
          </p>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          © 2026 MuniCircle Systems • Arua, Uganda
        </p>
      </footer>
    </div>
  );
};

export default Contact;