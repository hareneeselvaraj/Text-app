import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, clearAllState, exportAllData, importAllData } from '@/lib/storage';

export interface Memory {
  id: string;
  photo: string;
  date: string;
  caption: string;
  likes: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'all' | 'grocery' | 'plans' | 'thoughts';
  createdBy: 'user' | 'partner';
  timestamp: string;
}

export interface Gift {
  id: string;
  name: string;
  notes: string;
  link: string;
  status: 'idea' | 'planned' | 'bought';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'partner';
  timestamp: Date;
  hearted: boolean;
}

export interface AppNotification {
  id: string;
  type: 'love' | 'reminder' | 'date' | 'reaction';
  title: string;
  message: string;
  emoji: string;
  timestamp: Date;
  read: boolean;
}

interface AppState {
  isAuthenticated: boolean;
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

const defaultMessages: ChatMessage[] = [
  { id: '1', text: 'Good morning sunshine! \u2600\uFE0F', sender: 'partner', timestamp: new Date(Date.now() - 3600000 * 3), hearted: true },
  { id: '2', text: 'Morning! How did you sleep? \uD83D\uDCA4', sender: 'user', timestamp: new Date(Date.now() - 3600000 * 2.5), hearted: false },
  { id: '3', text: 'Dreamed about our next trip! \uD83C\uDFD6\uFE0F', sender: 'partner', timestamp: new Date(Date.now() - 3600000 * 2), hearted: false },
  { id: '4', text: 'Can\'t wait! Miss you already \uD83D\uDC95', sender: 'user', timestamp: new Date(Date.now() - 3600000), hearted: true },
];

const defaultMemories: Memory[] = [
  { id: '1', photo: '', date: '2025-03-15', caption: 'Our first sunset together \uD83C\uDF05', likes: 2 },
  { id: '2', photo: '', date: '2025-02-14', caption: 'Valentine\'s dinner \u2764\uFE0F', likes: 3 },
];

const defaultNotes: Note[] = [
  { id: '1', title: 'Weekend plans', content: 'Hike + picnic at the lake', category: 'plans', createdBy: 'user', timestamp: new Date().toISOString() },
  { id: '2', title: 'Grocery list', content: 'Avocados, pasta, wine', category: 'grocery', createdBy: 'partner', timestamp: new Date().toISOString() },
];

const defaultNotifications: AppNotification[] = [
  { id: '1', type: 'love', title: 'Alex sent a love note', message: 'Miss you \uD83D\uDC95', emoji: '\uD83D\uDC97', timestamp: new Date(Date.now() - 3600000), read: false },
  { id: '2', type: 'date', title: 'Anniversary coming up!', message: 'Your anniversary is in 3 days \uD83C\uDF89', emoji: '\uD83D\uDCC5', timestamp: new Date(Date.now() - 7200000), read: false },
  { id: '3', type: 'reaction', title: 'Alex hearted your message', message: '"Can\'t wait! Miss you already \uD83D\uDC95"', emoji: '\u2764\uFE0F', timestamp: new Date(Date.now() - 10800000), read: true },
  { id: '4', type: 'reminder', title: 'Daily check-in', message: 'How are you feeling today?', emoji: '\uD83D\uDD14', timestamp: new Date(Date.now() - 86400000), read: true },
];

const initialState: AppState = {
  isAuthenticated: false,
  userName: '',
  partnerName: 'Alex',
  userAvatar: 0,
  partnerAvatar: 3,
  userProfilePic: '',
  partnerProfilePic: '',
  loveCode: '',
  togetherDays: 247,
  userMood: '\uD83E\uDD70',
  partnerMood: '\uD83D\uDE0C',
  memories: defaultMemories,
  notes: defaultNotes,
  gifts: [],
  messages: defaultMessages,
  notifications: defaultNotifications,
  anniversaryDate: '2024-08-01',
  importantDates: [{ name: 'Anniversary', date: '2024-08-01', notify: true }],
};

const STATE_KEY = 'lovenest-app-state';

// Serialize state for storage (convert Date objects to strings)
function serializeState(state: AppState): unknown {
  return {
    ...state,
    messages: state.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() })),
    notifications: state.notifications.map(n => ({ ...n, timestamp: new Date(n.timestamp).toISOString() })),
  };
}

// Deserialize state from storage (convert strings back to Date objects)
function deserializeState(data: Record<string, unknown>): AppState {
  const state = data as unknown as AppState;
  return {
    ...state,
    messages: (state.messages || []).map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    notifications: (state.notifications || []).map(n => ({ ...n, timestamp: new Date(n.timestamp) })),
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  // Load state from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadState<Record<string, unknown>>(STATE_KEY);
        if (saved) {
          setState(deserializeState(saved));
        }
      } catch (e) {
        console.warn('Failed to load saved state:', e);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    })();
  }, []);

  // Save state to IndexedDB whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;
    saveState(STATE_KEY, serializeState(state)).catch(e =>
      console.warn('Failed to save state:', e)
    );
  }, [state]);

  const setAuth = useCallback((name: string, avatar: number, code: string) =>
    setState(s => ({ ...s, isAuthenticated: true, userName: name, userAvatar: avatar, loveCode: code })), []);

  const setPartnerInfo = useCallback((name: string, avatar: number) =>
    setState(s => ({ ...s, partnerName: name, partnerAvatar: avatar })), []);

  const setUserMood = useCallback((mood: string) => setState(s => ({ ...s, userMood: mood })), []);
  const setUserProfilePic = useCallback((pic: string) => setState(s => ({ ...s, userProfilePic: pic })), []);

  const addMemory = useCallback((m: Memory) => setState(s => ({ ...s, memories: [m, ...s.memories] })), []);
  const likeMemory = useCallback((id: string) => setState(s => ({
    ...s, memories: s.memories.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m)
  })), []);
  const addNote = useCallback((n: Note) => setState(s => ({ ...s, notes: [n, ...s.notes] })), []);
  const updateNote = useCallback((n: Note) => setState(s => ({ ...s, notes: s.notes.map(x => x.id === n.id ? n : x) })), []);
  const deleteNote = useCallback((id: string) => setState(s => ({ ...s, notes: s.notes.filter(x => x.id !== id) })), []);
  const addGift = useCallback((g: Gift) => setState(s => ({ ...s, gifts: [g, ...s.gifts] })), []);
  const updateGift = useCallback((g: Gift) => setState(s => ({ ...s, gifts: s.gifts.map(x => x.id === g.id ? g : x) })), []);
  const deleteGift = useCallback((id: string) => setState(s => ({ ...s, gifts: s.gifts.filter(x => x.id !== id) })), []);
  const addMessage = useCallback((msg: ChatMessage) => setState(s => ({ ...s, messages: [...s.messages, msg] })), []);
  const toggleHeart = useCallback((id: string) => setState(s => ({
    ...s, messages: s.messages.map(m => m.id === id ? { ...m, hearted: !m.hearted } : m)
  })), []);
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
  }, []);

  const exportData = useCallback(async (): Promise<string> => {
    return JSON.stringify(serializeState(state), null, 2);
  }, [state]);

  const importData = useCallback(async (json: string) => {
    try {
      const parsed = JSON.parse(json);
      const restored = deserializeState(parsed);
      setState(restored);
      await saveState(STATE_KEY, serializeState(restored));
    } catch (e) {
      console.error('Import failed:', e);
      throw new Error('Invalid backup data');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      ...state, isLoading, setAuth, setPartnerInfo, setUserMood, setUserProfilePic,
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
