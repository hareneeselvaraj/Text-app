import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import { toast } from 'sonner';

export const useFirebaseNotifications = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Request permission from the user
    const requestPermission = async () => {
      try {
        if (!messaging) return;
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // Replace with the VAPID key from your Firebase Console
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            setToken(currentToken);
            // Here you would typically send this token to your backend user profile
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    requestPermission();

    // Listen for foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        toast(payload.notification?.title || "New Notification", {
          description: payload.notification?.body,
        });
      });

      return () => {
        unsubscribe(); // Cleanup subscription on unmount
      };
    }
  }, []);

  return { token };
};
