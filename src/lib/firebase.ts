import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCbtAsIZqdWkv_iknJz0M9vtZ2BygqSnLo",
  authDomain: "text-app-ad297.firebaseapp.com",
  projectId: "text-app-ad297",
  storageBucket: "text-app-ad297.firebasestorage.app",
  messagingSenderId: "746833194533",
  appId: "1:746833194533:web:4a22e7825c6fb5e62c59cc",
  measurementId: "G-NTTPJ222DN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Messaging and get a reference to the service
// We only initialize messaging if we are in the browser and service workers are supported
export const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator 
  ? getMessaging(app) 
  : null;
