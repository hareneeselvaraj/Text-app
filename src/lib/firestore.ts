import { db } from './firebase';
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  serverTimestamp, addDoc, deleteDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Note } from '../contexts/AppContext';

export const createNest = async (user: User, userName: string, userAvatar: number, profilePic: string): Promise<string> => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const nestRef = doc(db, 'nests', code);
  await setDoc(nestRef, {
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    anniversaryDate: new Date().toISOString().split('T')[0],
    importantDates: [],
    users: {
      [user.uid]: {
        name: userName,
        avatar: userAvatar,
        profilePic,
        mood: '😊'
      }
    }
  });
  
  return code;
};

export const joinNest = async (code: string, user: User, userName: string, userAvatar: number, profilePic: string): Promise<boolean> => {
  const nestRef = doc(db, 'nests', code);
  const snap = await getDoc(nestRef);
  
  if (!snap.exists()) {
    throw new Error('Invalid Love Code');
  }

  const data = snap.data();
  if (Object.keys(data.users || {}).length >= 2) {
    if (!data.users[user.uid]) {
      throw new Error('This nest is already full');
    }
  }

  await setDoc(nestRef, {
    users: {
      ...data.users,
      [user.uid]: {
        name: userName,
        avatar: userAvatar,
        profilePic,
        mood: '😊'
      }
    }
  }, { merge: true });

  return true;
};

export const updateUserMoodFb = async (code: string, uid: string, mood: string) => {
  const nestRef = doc(db, 'nests', code);
  await setDoc(nestRef, {
    users: {
      [uid]: { mood }
    }
  }, { merge: true });
};

export const sendMessageFb = async (code: string, uid: string, text: string) => {
  const msgsRef = collection(db, 'nests', code, 'messages');
  await addDoc(msgsRef, {
    text,
    sender: uid,
    timestamp: serverTimestamp(),
    hearted: false
  });
};

export const toggleHeartMessageFb = async (code: string, msgId: string, currentHearted: boolean) => {
  const msgRef = doc(db, 'nests', code, 'messages', msgId);
  await updateDoc(msgRef, {
    hearted: !currentHearted
  });
};

export const addNoteFb = async (code: string, uid: string, note: Omit<Note, 'id' | 'createdBy' | 'timestamp'>) => {
  const noteRef = collection(db, 'nests', code, 'notes');
  await addDoc(noteRef, {
    ...note,
    createdBy: uid,
    timestamp: serverTimestamp()
  });
};

export const updateNoteFb = async (code: string, note: Note) => {
  const noteRef = doc(db, 'nests', code, 'notes', note.id);
  const { id, ...data } = note;
  await updateDoc(noteRef, data as any);
};

export const deleteNoteFb = async (code: string, id: string) => {
  const noteRef = doc(db, 'nests', code, 'notes', id);
  await deleteDoc(noteRef);
};

// ─── FCM Token Management ────────────────────────────────────

export const saveFcmToken = async (code: string, uid: string, token: string) => {
  const nestRef = doc(db, 'nests', code);
  await setDoc(nestRef, {
    users: {
      [uid]: { fcmToken: token }
    }
  }, { merge: true });
};

export const getPartnerFcmToken = async (code: string, uid: string): Promise<string | null> => {
  const nestRef = doc(db, 'nests', code);
  const snap = await getDoc(nestRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const partnerId = Object.keys(data.users || {}).find(k => k !== uid);
  if (!partnerId) return null;

  return data.users[partnerId]?.fcmToken || null;
};

// ─── Push Notification via Firestore (queued for Cloud Function) ─

/**
 * Writes a notification request to a Firestore collection.
 * A Cloud Function (or the partner's client) picks these up and sends FCM push.
 *
 * For client-side only (no Cloud Functions), we write to a 'pendingNotifications'
 * subcollection that the partner's client listens to.
 */
export const sendPushNotification = async (
  code: string,
  fromUid: string,
  fromName: string,
  title: string,
  body: string,
  type: 'mood' | 'message' | 'love' | 'reminder' = 'love'
) => {
  const notifRef = collection(db, 'nests', code, 'pendingNotifications');
  await addDoc(notifRef, {
    fromUid,
    fromName,
    title,
    body,
    type,
    timestamp: serverTimestamp(),
    read: false,
  });
};

// ─── Anniversary Date Sync ───────────────────────────────────

export const updateAnniversaryDateFb = async (code: string, date: string) => {
  const nestRef = doc(db, 'nests', code);
  await setDoc(nestRef, { anniversaryDate: date }, { merge: true });
};

export const updateImportantDatesFb = async (code: string, dates: { name: string; date: string; notify: boolean }[]) => {
  const nestRef = doc(db, 'nests', code);
  await setDoc(nestRef, { importantDates: dates }, { merge: true });
};
