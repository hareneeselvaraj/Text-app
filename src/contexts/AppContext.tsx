import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, clearAllState } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, query, orderBy, where, getDoc } from 'firebase/firestore';
import { addMemoryFb, likeMemoryFb, addNoteFb, updateNoteFb, deleteNoteFb, addGiftFb, updateGiftFb, deleteGiftFb, sendMessageFb, toggleHeartMessageFb, updateUserMoodFb } from '../lib/firestore';

export interface Memory { id: string; photo: string; date: string; caption: string; likes: number; timestamp?: any; }
export interface Note { id: string; title: string; content: string; category: 'all' | 'grocery' | 'plans' | 'thoughts'; createdBy: string; timestamp?: any; }
export interface Gift { id: string; name: string; notes: string; link: string; status: 'idea' | 'planned' | 'bought'; owner?: string; timestamp?: any; }
export interface ChatMessage { id: string; text: string; sender: string; timestamp: any; hearted: boolean; }
export interface AppNotification { id: string; type: 'love' | 'reminder' | 'date' | 'reaction'; title: string; message: string; emoji: string; timestamp: any; read: boolean; }

interface AppState {
  userName: string;
  partnerName: string;
  userAvatar: number;
  partnerAvatar: number;
  userProfilePic: string;
  partnerProfilePic: string;
  loveCode: string;
  togetherDays: number;
  userMood: string;
  partnerMood: string;
  memories: Memory[];
  notes: Note[];
  gifts: Gift[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  anniversaryDate: string;
  importantDates: { name: string; date: string; notify: boolean }[];
}

interface AppContextType extends AppState {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (name: string, avatar: number, code: string) => void;
  setPartnerInfo: (name: string, avatar: number) => void;
  setUserMood: (mood: string) => void;
  setUserProfilePic: (pic: string) => void;
  addMemory: (memory: Memory) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addGift: (gift: Gift) => void;
  updateGift: (gift: Gift) => void;
  deleteGift: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  toggleHeart: (id: string) => void;
  addNotification: (n: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setAnniversaryDate: (date: string) => void;
  addImportantDate: (d: { name: string; date: string; notify: boolean }) => void;
  logout: () => void;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
  likeMemory: (id: string) => void;
}

const initialState: AppState = {
  userName: '',
  partnerName: 'Partner',
  userAvatar: 0,
  partnerAvatar: 3,
  userProfilePic: '',
  partnerProfilePic: '',
  loveCode: '',
  togetherDays: 0,
  userMood: '😊',
  partnerMood: '😊',
  memories: [],
  notes: [],
  gifts: [],
  messages: [],
  notifications: [],
  anniversaryDate: '',
  importantDates: [],
};

const STATE_KEY = 'lovenest-app-state-v3';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [localLoading, setLocalLoading] = useState(true);
  const { currentUser, isLoadingAuth, signOut } = useAuth();
  
  // Load local state initially just for loveCode mostly
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadState<any>(STATE_KEY);
        if (saved) {
          setState(s => ({ ...s, ...saved }));
        }
      } catch (e) {
        console.warn('Failed to load saved state:', e);
      } finally {
        setLocalLoading(false);
      }
    })();
  }, []);

  // Save loveCode and local preferences
  useEffect(() => {
    if (localLoading) return;
    saveState(STATE_KEY, { loveCode: state.loveCode, userName: state.userName, userAvatar: state.userAvatar }).catch(e => console.warn(e));
  }, [state.loveCode, state.userName, state.userAvatar, localLoading]);

  // Firestore Subscriptions
  useEffect(() => {
    if (!currentUser || !state.loveCode) return;
    const code = state.loveCode;

    // 1. Nest Document (users, moods, dates)
    const unsubNest = onSnapshot(doc(db, 'nests', code), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let pName = 'Partner', pAvatar = 3, pPic = '', pMood = '😊';
        let uMood = state.userMood;
        
        if (data.users) {
          const partnerId = Object.keys(data.users).find(k => k !== currentUser.uid);
          if (partnerId) {
            const p = data.users[partnerId];
            pName = p.name || 'Partner';
            pAvatar = p.avatar || 3;
            pPic = p.profilePic || '';
            pMood = p.mood || '😊';
          }
          if (data.users[currentUser.uid]) {
            uMood = data.users[currentUser.uid].mood || uMood;
          }
        }
        
        setState(s => ({
          ...s,
          partnerName: pName,
          partnerAvatar: pAvatar,
          partnerProfilePic: pPic,
          partnerMood: pMood,
          userMood: uMood,
          anniversaryDate: data.anniversaryDate || s.anniversaryDate,
        }));
      }
    });

    // 2. Messages
    const msgsQ = query(collection(db, 'nests', code, 'messages'), orderBy('timestamp', 'asc'));
    const unsubMsgs = onSnapshot(msgsQ, (snap) => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        sender: d.data().sender === currentUser.uid ? 'user' : 'partner',
        timestamp: d.data().timestamp ? d.data().timestamp.toDate() : new Date()
      })) as ChatMessage[];
      setState(s => ({ ...s, messages: msgs }));
    });

    // 3. Memories
    const memQ = query(collection(db, 'nests', code, 'memories'), orderBy('timestamp', 'desc'));
    const unsubMemories = onSnapshot(memQ, (snap) => {
      const mems = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Memory[];
      setState(s => ({ ...s, memories: mems }));
    });

    // 4. Notes
    const notesQ = query(collection(db, 'nests', code, 'notes'), orderBy('timestamp', 'desc'));
    const unsubNotes = onSnapshot(notesQ, (snap) => {
      const nts = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdBy: d.data().createdBy === currentUser.uid ? 'user' : 'partner'
      })) as Note[];
      setState(s => ({ ...s, notes: nts }));
    });

    // 5. Gifts (Private)
    const giftsQ = query(collection(db, 'nests', code, 'gifts'), where('owner', '==', currentUser.uid));
    const unsubGifts = onSnapshot(giftsQ, (snap) => {
      const gfs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Gift[];
      setState(s => ({ ...s, gifts: gfs }));
    });

    return () => {
      unsubNest();
      unsubMsgs();
      unsubMemories();
      unsubNotes();
      unsubGifts();
    };
  }, [currentUser, state.loveCode]);

  const setAuth = useCallback((name: string, avatar: number, code: string) =>
    setState(s => ({ ...s, userName: name, userAvatar: avatar, loveCode: code })), []);

  const setPartnerInfo = useCallback((name: string, avatar: number) =>
    setState(s => ({ ...s, partnerName: name, partnerAvatar: avatar })), []);

  const setUserMood = useCallback((mood: string) => {
    setState(s => ({ ...s, userMood: mood }));
    if (state.loveCode && currentUser) updateUserMoodFb(state.loveCode, currentUser.uid, mood).catch(console.error);
  }, [state.loveCode, currentUser]);

  const setUserProfilePic = useCallback((pic: string) => setState(s => ({ ...s, userProfilePic: pic })), []);

  const addMemory = useCallback((m: Memory) => {
    if (state.loveCode) addMemoryFb(state.loveCode, m).catch(console.error);
  }, [state.loveCode]);

  const likeMemory = useCallback((id: string) => {
    const mem = state.memories.find(m => m.id === id);
    if (state.loveCode && mem) likeMemoryFb(state.loveCode, id, mem.likes).catch(console.error);
  }, [state.loveCode, state.memories]);

  const addNote = useCallback((n: Note) => {
    if (state.loveCode && currentUser) addNoteFb(state.loveCode, currentUser.uid, n).catch(console.error);
  }, [state.loveCode, currentUser]);

  const updateNote = useCallback((n: Note) => {
    if (state.loveCode) updateNoteFb(state.loveCode, n).catch(console.error);
  }, [state.loveCode]);

  const deleteNote = useCallback((id: string) => {
    if (state.loveCode) deleteNoteFb(state.loveCode, id).catch(console.error);
  }, [state.loveCode]);

  const addGift = useCallback((g: Gift) => {
    if (state.loveCode && currentUser) addGiftFb(state.loveCode, currentUser.uid, g).catch(console.error);
  }, [state.loveCode, currentUser]);

  const updateGift = useCallback((g: Gift) => {
    if (state.loveCode) updateGiftFb(state.loveCode, g).catch(console.error);
  }, [state.loveCode]);

  const deleteGift = useCallback((id: string) => {
    if (state.loveCode) deleteGiftFb(state.loveCode, id).catch(console.error);
  }, [state.loveCode]);

  const addMessage = useCallback((msg: ChatMessage) => {
    if (state.loveCode && currentUser) sendMessageFb(state.loveCode, currentUser.uid, msg.text).catch(console.error);
  }, [state.loveCode, currentUser]);

  const toggleHeart = useCallback((id: string) => {
    const msg = state.messages.find(m => m.id === id);
    if (state.loveCode && msg) toggleHeartMessageFb(state.loveCode, id, msg.hearted).catch(console.error);
  }, [state.loveCode, state.messages]);

  // Keep notifications local for now to avoid complexity of individual read states
  const addNotification = useCallback((n: AppNotification) => setState(s => ({ ...s, notifications: [n, ...s.notifications] })), []);
  const markNotificationRead = useCallback((id: string) => setState(s => ({
    ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })), []);
  const markAllNotificationsRead = useCallback(() => setState(s => ({
    ...s, notifications: s.notifications.map(n => ({ ...n, read: true }))
  })), []);
  
  const setAnniversaryDate = useCallback((date: string) => setState(s => ({ ...s, anniversaryDate: date })), []);
  const addImportantDate = useCallback((d: { name: string; date: string; notify: boolean }) =>
    setState(s => ({ ...s, importantDates: [...s.importantDates, d] })), []);

  const logout = useCallback(() => {
    clearAllState().catch(() => {});
    setState(initialState);
    if (currentUser) signOut();
  }, [currentUser, signOut]);

  // Disabled exports for Firebase version
  const exportData = useCallback(async (): Promise<string> => "{}", []);
  const importData = useCallback(async (json: string) => {}, []);

  const isLoading = localLoading || isLoadingAuth;
  const isAuthenticated = !!currentUser && state.loveCode !== '';
  
  // Calculate togetherDays dynamically
  const togetherDays = state.anniversaryDate 
    ? Math.floor((Date.now() - new Date(state.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  return (
    <AppContext.Provider value={{
      ...state, isAuthenticated, isLoading, togetherDays, setAuth, setPartnerInfo, setUserMood, setUserProfilePic,
      addMemory, likeMemory, addNote, updateNote, deleteNote,
      addGift, updateGift, deleteGift, addMessage, toggleHeart,
      addNotification, markNotificationRead, markAllNotificationsRead,
      setAnniversaryDate, addImportantDate, logout,
      exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
