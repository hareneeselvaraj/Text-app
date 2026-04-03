import { useState, useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { saveFcmToken } from '../lib/firestore';
import { collection, onSnapshot, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

export const useFirebaseNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { loveCode, addNotification } = useApp();
  const hasRegistered = useRef(false);

  // 1. Request permission & get FCM token, save to Firestore
  useEffect(() => {
    if (!messaging || !currentUser || !loveCode || hasRegistered.current) return;

    const registerToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied.');
          return;
        }

        // Register the firebase-messaging-sw.js service worker explicitly
        let swRegistration: ServiceWorkerRegistration | undefined;
        if ('serviceWorker' in navigator) {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          // Wait for the service worker to be active
          await navigator.serviceWorker.ready;
        }

        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (currentToken) {
          console.log('FCM Token obtained');
          setToken(currentToken);
          hasRegistered.current = true;

          // Save token to Firestore so partner can find it
          await saveFcmToken(loveCode, currentUser.uid, currentToken);
          console.log('FCM token saved to Firestore');
        }
      } catch (error) {
        console.error('FCM token registration failed:', error);
      }
    };

    registerToken();
  }, [currentUser, loveCode]);

  // 2. Handle foreground messages from FCM
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground FCM message:', payload);
      toast(payload.notification?.title || 'New Notification', {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, []);

  // 3. Listen for pendingNotifications from partner (Firestore-based push)
  useEffect(() => {
    if (!currentUser || !loveCode) return;

    const notifQ = query(
      collection(db, 'nests', loveCode, 'pendingNotifications'),
      where('fromUid', '!=', currentUser.uid),
      orderBy('fromUid'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(notifQ, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();

          // Show as in-app notification
          addNotification({
            id: change.doc.id,
            type: data.type || 'love',
            title: data.title || 'LoveNest',
            message: data.body || '',
            emoji: data.type === 'mood' ? '🎭' : '💕',
            timestamp: data.timestamp?.toDate?.() || new Date(),
            read: false,
          });

          // Show system notification if app is in foreground but user might miss it
          if (document.visibilityState === 'visible') {
            toast(data.title, { description: data.body });
          }

          // Show browser push notification if page is hidden (background/minimized)
          if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker?.ready;
            if (registration) {
              registration.showNotification(data.title || 'LoveNest', {
                body: data.body || '',
                icon: '/icons/icon-192.svg',
                badge: '/icons/icon-192.svg',
                tag: `lovenest-${data.type}-${change.doc.id}`,
                vibrate: [200, 100, 200],
              });
            }
          }

          // Clean up — delete the notification doc after processing
          try {
            await deleteDoc(doc(db, 'nests', loveCode, 'pendingNotifications', change.doc.id));
          } catch {
            // Ignore cleanup errors
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser, loveCode, addNotification]);

  return { token };
};
