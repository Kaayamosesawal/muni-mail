import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import all necessary Providers
import { AuthProvider } from './context/AuthContext';
import { ClubProvider } from './context/ClubContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>      {/* defined and imported */}
      <ThemeProvider>
        <AuthProvider>
          <ClubProvider>
            <App />
          </ClubProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using a relative path starting with / ensures it looks in the public folder
    const swUrl = '/sw.js'; 

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('MuniCircle SW registered: ', registration);

        // Optional: Listen for updates to the service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; please refresh.
                console.log('New content is available; please refresh.');
              } else {
                // Content is cached for offline use.
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  });
}