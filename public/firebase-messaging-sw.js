// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
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

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
