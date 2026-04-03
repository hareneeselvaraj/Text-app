// Firebase messaging service worker for background push notifications
// Using compat version for service worker compatibility
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCbtAsIZqdWkv_iknJz0M9vtZ2BygqSnLo",
  authDomain: "text-app-ad297.firebaseapp.com",
  projectId: "text-app-ad297",
  storageBucket: "text-app-ad297.firebasestorage.app",
  messagingSenderId: "746833194533",
  appId: "1:746833194533:web:4a22e7825c6fb5e62c59cc",
  measurementId: "G-NTTPJ222DN"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages (when app is minimized or closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'LoveNest';
  const body = payload.notification?.body || payload.data?.body || 'You have a new notification';

  const notificationOptions = {
    body: body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: 'lovenest-' + (payload.data?.type || 'notification'),
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/home',
    },
    actions: [
      { action: 'open', title: 'Open LoveNest' }
    ]
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
