import { db } from './firebase';
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  serverTimestamp, addDoc, deleteDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Memory, Note, Gift, ChatMessage } from '../contexts/AppContext';

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

export const addMemoryFb = async (code: string, memory: Omit<Memory, 'id'>) => {
  const memRef = collection(db, 'nests', code, 'memories');
  await addDoc(memRef, {
    ...memory,
    timestamp: serverTimestamp()
  });
};

export const likeMemoryFb = async (code: string, memId: string, currentLikes: number) => {
  const memRef = doc(db, 'nests', code, 'memories', memId);
  await updateDoc(memRef, {
    likes: currentLikes + 1
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

export const addGiftFb = async (code: string, uid: string, gift: Omit<Gift, 'id'>) => {
  const giftRef = collection(db, 'nests', code, 'gifts');
  await addDoc(giftRef, {
    ...gift,
    owner: uid,
    timestamp: serverTimestamp()
  });
};

export const updateGiftFb = async (code: string, gift: Gift) => {
  const giftRef = doc(db, 'nests', code, 'gifts', gift.id);
  const { id, ...data } = gift;
  await updateDoc(giftRef, data as any);
};

export const deleteGiftFb = async (code: string, id: string) => {
  const giftRef = doc(db, 'nests', code, 'gifts', id);
  await deleteDoc(giftRef);
};
