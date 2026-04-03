import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, clearAllState } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { addNoteFb, updateNoteFb, deleteNoteFb, sendMessageFb, toggleHeartMessageFb, updateUserMoodFb, updateAnniversaryDateFb, updateImportantDatesFb, sendPushNotification } from '../lib/firestore';
import { uploadToDrive, downloadFromDrive } from '../lib/driveSync';

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
  hasPartner: boolean;
  memories: Memory[];
  notes: Note[];
  gifts: Gift[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  anniversaryDate: string;
  importantDates: { name: string; date: string; notify: boolean }[];
  lastDriveBackup: string;
}

interface AppContextType extends AppState {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (name: string, avatar: number, code: string) => void;
  setPartnerInfo: (name: string, avatar: number) => void;
  setUserMood: (mood: string) => void;
  setUserProfilePic: (pic: string) => void;
  addMemory: (memory: Memory) => void;
  likeMemory: (id: string) => void;
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
  backupToDriveNow: () => Promise<boolean>;
  restoreFromDriveNow: () => Promise<boolean>;
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
  hasPartner: false,
  memories: [],
  notes: [],
  gifts: [],
  messages: [],
  notifications: [],
  anniversaryDate: '',
  importantDates: [],
  lastDriveBackup: '',
};

const STATE_KEY = 'lovenest-app-state-v3';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [localLoading, setLocalLoading] = useState(true);
  const { currentUser, isLoadingAuth, signOut, driveAccessToken } = useAuth();
  const driveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredFromDriveRef = useRef(false);

  // Load local state on mount
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

  // Save essential local preferences to IndexedDB
  useEffect(() => {
    if (localLoading) return;
    saveState(STATE_KEY, {
      loveCode: state.loveCode,
      userName: state.userName,
      userAvatar: state.userAvatar,
      memories: state.memories,
      gifts: state.gifts,
      importantDates: state.importantDates,
      anniversaryDate: state.anniversaryDate,
      lastDriveBackup: state.lastDriveBackup,
    }).catch(e => console.warn(e));
  }, [state.loveCode, state.userName, state.userAvatar, state.memories, state.gifts, state.importantDates, state.anniversaryDate, state.lastDriveBackup, localLoading]);

  // Auto-restore from Drive on first sign-in (if local data is empty)
  useEffect(() => {
    if (!driveAccessToken || !currentUser || hasRestoredFromDriveRef.current) return;
    if (state.memories.length > 0 || state.loveCode) {
      hasRestoredFromDriveRef.current = true;
      return; // Already have local data, skip restore
    }

    hasRestoredFromDriveRef.current = true;
    (async () => {
      try {
        const data = await downloadFromDrive(driveAccessToken);
        if (data) {
          const parsed = JSON.parse(data);
          setState(s => ({ ...s, ...parsed }));
          console.log('Restored data from Google Drive');
        }
      } catch (e) {
        console.warn('Failed to restore from Drive:', e);
      }
    })();
  }, [driveAccessToken, currentUser]);

  // Debounced auto-backup to Drive when personal data changes
  useEffect(() => {
    if (!driveAccessToken || localLoading) return;

    if (driveTimerRef.current) clearTimeout(driveTimerRef.current);
    driveTimerRef.current = setTimeout(async () => {
      try {
        const backupData = JSON.stringify({
          userName: state.userName,
          userAvatar: state.userAvatar,
          userProfilePic: state.userProfilePic,
          loveCode: state.loveCode,
          memories: state.memories,
          gifts: state.gifts,
          importantDates: state.importantDates,
          anniversaryDate: state.anniversaryDate,
        });
        const ok = await uploadToDrive(driveAccessToken, backupData);
        if (ok) {
          const now = new Date().toISOString();
          setState(s => ({ ...s, lastDriveBackup: now }));
          console.log('Auto-backed up to Drive');
        }
      } catch (e) {
        console.warn('Drive auto-backup failed:', e);
      }
    }, 10000); // 10 second debounce

    return () => { if (driveTimerRef.current) clearTimeout(driveTimerRef.current); };
  }, [driveAccessToken, state.memories, state.gifts, state.importantDates, state.userName, state.userAvatar, localLoading]);

  // Firestore Subscriptions (messages, moods, notes — NOT memories)
  useEffect(() => {
    if (!currentUser || !state.loveCode) return;
    const code = state.loveCode;

    // 1. Nest Document (users, moods, dates)
    const unsubNest = onSnapshot(doc(db, 'nests', code), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let pName = 'Partner', pAvatar = 3, pPic = '', pMood = '😊';
        let uMood = state.userMood;
        let hasP = false;
        
        if (data.users) {
          const partnerId = Object.keys(data.users).find(k => k !== currentUser.uid);
          if (partnerId) {
            hasP = true;
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
          hasPartner: hasP,
          anniversaryDate: data.anniversaryDate || s.anniversaryDate,
          importantDates: data.importantDates || s.importantDates,
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

    // 3. Notes (shared between partners)
    const notesQ = query(collection(db, 'nests', code, 'notes'), orderBy('timestamp', 'desc'));
    const unsubNotes = onSnapshot(notesQ, (snap) => {
      const nts = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdBy: d.data().createdBy === currentUser.uid ? 'user' : 'partner'
      })) as Note[];
      setState(s => ({ ...s, notes: nts }));
    });

    return () => {
      unsubNest();
      unsubMsgs();
      unsubNotes();
    };
  }, [currentUser, state.loveCode]);

  const setAuth = useCallback((name: string, avatar: number, code: string) =>
    setState(s => ({ ...s, userName: name, userAvatar: avatar, loveCode: code })), []);

  const setPartnerInfo = useCallback((name: string, avatar: number) =>
    setState(s => ({ ...s, partnerName: name, partnerAvatar: avatar })), []);

  const setUserMood = useCallback((mood: string) => {
    setState(s => ({ ...s, userMood: mood }));
    if (state.loveCode && currentUser) {
      updateUserMoodFb(state.loveCode, currentUser.uid, mood).catch(console.error);
      // Send push notification to partner about mood change
      const moodLabels: Record<string, string> = {
        '\u{1F60A}': 'Happy', '\u{1F970}': 'Loved', '\u{1F929}': 'Excited', '\u{1F60C}': 'Calm',
        '\u{1F614}': 'Sad', '\u{1F634}': 'Tired', '\u{1F630}': 'Anxious', '\u{1F624}': 'Angry',
      };
      const moodLabel = moodLabels[mood] || 'something';
      sendPushNotification(
        state.loveCode,
        currentUser.uid,
        state.userName || 'Your partner',
        `${state.userName || 'Your partner'} is feeling ${moodLabel} ${mood}`,
        `Tap to check on them`,
        'mood'
      ).catch(console.error);
    }
  }, [state.loveCode, currentUser, state.userName]);

  const setUserProfilePic = useCallback((pic: string) => setState(s => ({ ...s, userProfilePic: pic })), []);

  // Memories — local + Drive only (NOT Firestore)
  const addMemory = useCallback((m: Memory) => {
    setState(s => ({ ...s, memories: [m, ...s.memories] }));
  }, []);

  const likeMemory = useCallback((id: string) => {
    setState(s => ({
      ...s,
      memories: s.memories.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m)
    }));
  }, []);

  // Notes — Firestore shared
  const addNote = useCallback((n: Note) => {
    if (state.loveCode && currentUser) addNoteFb(state.loveCode, currentUser.uid, n).catch(console.error);
  }, [state.loveCode, currentUser]);

  const updateNote = useCallback((n: Note) => {
    if (state.loveCode) updateNoteFb(state.loveCode, n).catch(console.error);
  }, [state.loveCode]);

  const deleteNote = useCallback((id: string) => {
    if (state.loveCode) deleteNoteFb(state.loveCode, id).catch(console.error);
  }, [state.loveCode]);

  // Gifts — local + Drive only (private)
  const addGift = useCallback((g: Gift) => {
    setState(s => ({ ...s, gifts: [...s.gifts, g] }));
  }, []);

  const updateGift = useCallback((g: Gift) => {
    setState(s => ({ ...s, gifts: s.gifts.map(x => x.id === g.id ? g : x) }));
  }, []);

  const deleteGift = useCallback((id: string) => {
    setState(s => ({ ...s, gifts: s.gifts.filter(x => x.id !== id) }));
  }, []);

  // Messages — Firestore shared + push notification to partner
  const addMessage = useCallback((msg: ChatMessage) => {
    if (state.loveCode && currentUser) {
      sendMessageFb(state.loveCode, currentUser.uid, msg.text).catch(console.error);
      // Notify partner about the new message
      sendPushNotification(
        state.loveCode,
        currentUser.uid,
        state.userName || 'Your partner',
        `${state.userName || 'Your partner'}`,
        msg.text,
        'message'
      ).catch(console.error);
    }
  }, [state.loveCode, currentUser, state.userName]);

  const toggleHeart = useCallback((id: string) => {
    const msg = state.messages.find(m => m.id === id);
    if (state.loveCode && msg) toggleHeartMessageFb(state.loveCode, id, msg.hearted).catch(console.error);
  }, [state.loveCode, state.messages]);

  // Notifications — local only
  const addNotification = useCallback((n: AppNotification) => setState(s => ({ ...s, notifications: [n, ...s.notifications] })), []);
  const markNotificationRead = useCallback((id: string) => setState(s => ({
    ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })), []);
  const markAllNotificationsRead = useCallback(() => setState(s => ({
    ...s, notifications: s.notifications.map(n => ({ ...n, read: true }))
  })), []);
  
  const setAnniversaryDate = useCallback((date: string) => {
    setState(s => ({ ...s, anniversaryDate: date }));
    if (state.loveCode) updateAnniversaryDateFb(state.loveCode, date).catch(console.error);
  }, [state.loveCode]);

  const addImportantDate = useCallback((d: { name: string; date: string; notify: boolean }) => {
    setState(s => {
      const newDates = [...s.importantDates, d];
      if (state.loveCode) updateImportantDatesFb(state.loveCode, newDates).catch(console.error);
      return { ...s, importantDates: newDates };
    });
  }, [state.loveCode]);

  const logout = useCallback(() => {
    clearAllState().catch(() => {});
    setState(initialState);
    hasRestoredFromDriveRef.current = false;
    if (currentUser) signOut();
  }, [currentUser, signOut]);

  // Export / Import
  const exportData = useCallback(async (): Promise<string> => {
    return JSON.stringify({
      userName: state.userName, userAvatar: state.userAvatar, loveCode: state.loveCode,
      memories: state.memories, gifts: state.gifts,
      importantDates: state.importantDates, anniversaryDate: state.anniversaryDate,
    });
  }, [state]);

  const importData = useCallback(async (json: string) => {
    try {
      const parsed = JSON.parse(json);
      setState(s => ({ ...s, ...parsed }));
    } catch (e) {
      console.error('Import failed:', e);
    }
  }, []);

  // Manual Drive operations
  const backupToDriveNow = useCallback(async (): Promise<boolean> => {
    if (!driveAccessToken) return false;
    const data = await exportData();
    return uploadToDrive(driveAccessToken, data);
  }, [driveAccessToken, exportData]);

  const restoreFromDriveNow = useCallback(async (): Promise<boolean> => {
    if (!driveAccessToken) return false;
    const data = await downloadFromDrive(driveAccessToken);
    if (data) {
      await importData(data);
      return true;
    }
    return false;
  }, [driveAccessToken, importData]);

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
      exportData, importData, backupToDriveNow, restoreFromDriveNow,
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
