/**
 * firebase-messaging-sw.js
 */

// Import the compat versions of Firebase for Service Worker support
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker.
firebase.initializeApp({
  apiKey: "AIzaSyADcaK5yRsAPR1GDMXHir2D6yOmbMGkavU",
  authDomain: "municircle-d2dcc.firebaseapp.com",
  projectId: "municircle-d2dcc",
  storageBucket: "municircle-d2dcc.firebasestorage.app",
  messagingSenderId: "105714134428",
  appId: "1:105714134428:web:fc398e0893741a41656c59",
  measurementId: "G-MRYV0QH78F"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

/**
 * Handle background messages:
 * Triggered when the app is minimized, in the background, or closed.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || "MuniCircle Update";
  const notificationOptions = {
    body: payload.notification?.body || "Check out what's new on the feed!",
    icon: '/favicon.ico', // Ensure this matches your public icon path
    badge: '/favicon.ico',
    tag: 'municircle-update', // Groups similar notifications
    data: {
      url: self.location.origin 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle Notification Clicks:
 * Brings the user back to the app when they click the notification popup.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if a tab is already open and focus it
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});