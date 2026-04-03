import { useState, useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { saveFcmToken } from '../lib/firestore';
import { collection, onSnapshot, query, deleteDoc, doc, Timestamp } from 'firebase/firestore';
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

  // 3. Listen for ALL pendingNotifications (simple query, no composite index needed)
  //    Filter client-side to skip own notifications
  useEffect(() => {
    if (!currentUser || !loveCode) return;

    // Simple query — no compound index required
    const notifQ = query(collection(db, 'nests', loveCode, 'pendingNotifications'));

    const unsubscribe = onSnapshot(notifQ, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();

          // Skip notifications sent by myself
          if (data.fromUid === currentUser.uid) {
            // Clean up own notification docs
            try {
              await deleteDoc(doc(db, 'nests', loveCode, 'pendingNotifications', change.doc.id));
            } catch { /* ignore */ }
            return;
          }

          // Add to in-app notification list
          addNotification({
            id: change.doc.id,
            type: data.type || 'love',
            title: data.title || 'LoveNest',
            message: data.body || '',
            emoji: data.type === 'mood' ? '🎭' : data.type === 'message' ? '💬' : '💕',
            timestamp: data.timestamp?.toDate?.() || new Date(),
            read: false,
          });

          // Always show toast when app is visible
          if (document.visibilityState === 'visible') {
            toast(data.title || 'LoveNest', { description: data.body });
          }

          // Show system push notification (works both foreground and background)
          if (Notification.permission === 'granted') {
            try {
              const registration = await navigator.serviceWorker?.ready;
              if (registration) {
                await registration.showNotification(data.title || 'LoveNest', {
                  body: data.body || '',
                  icon: '/icons/icon-192.svg',
                  badge: '/icons/icon-192.svg',
                  tag: `lovenest-${change.doc.id}`,
                  renotify: true,
                } as NotificationOptions);
              }
            } catch (e) {
              // Fallback: use Notification API directly
              try {
                new Notification(data.title || 'LoveNest', {
                  body: data.body || '',
                  icon: '/icons/icon-192.svg',
                  tag: `lovenest-${change.doc.id}`,
                });
              } catch { /* ignore */ }
            }
          }

          // Clean up the notification doc after processing
          try {
            await deleteDoc(doc(db, 'nests', loveCode, 'pendingNotifications', change.doc.id));
          } catch { /* ignore */ }
        }
      });
    }, (error) => {
      console.error('pendingNotifications listener error:', error);
    });

    return () => unsubscribe();
  }, [currentUser, loveCode, addNotification]);

  return { token };
};
