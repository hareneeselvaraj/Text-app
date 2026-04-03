import React, { createContext, useContext, useState } from 'react';

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
  setAuth: (name: string, avatar: number, code: string) => void;
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
}

const defaultMessages: ChatMessage[] = [
  { id: '1', text: 'Good morning sunshine! ☀️', sender: 'partner', timestamp: new Date(Date.now() - 3600000 * 3), hearted: true },
  { id: '2', text: 'Morning! How did you sleep? 💤', sender: 'user', timestamp: new Date(Date.now() - 3600000 * 2.5), hearted: false },
  { id: '3', text: 'Dreamed about our next trip! 🏖️', sender: 'partner', timestamp: new Date(Date.now() - 3600000 * 2), hearted: false },
  { id: '4', text: 'Can\'t wait! Miss you already 💕', sender: 'user', timestamp: new Date(Date.now() - 3600000), hearted: true },
];

const defaultMemories: Memory[] = [
  { id: '1', photo: '', date: '2025-03-15', caption: 'Our first sunset together 🌅', likes: 2 },
  { id: '2', photo: '', date: '2025-02-14', caption: 'Valentine\'s dinner ❤️', likes: 3 },
];

const defaultNotes: Note[] = [
  { id: '1', title: 'Weekend plans', content: 'Hike + picnic at the lake', category: 'plans', createdBy: 'user', timestamp: new Date().toISOString() },
  { id: '2', title: 'Grocery list', content: 'Avocados, pasta, wine', category: 'grocery', createdBy: 'partner', timestamp: new Date().toISOString() },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    userName: '',
    partnerName: 'Alex',
    userAvatar: 0,
    partnerAvatar: 3,
    loveCode: '',
    togetherDays: 247,
    userMood: '🥰',
    partnerMood: '😌',
    memories: defaultMemories,
    notes: defaultNotes,
    gifts: [],
    messages: defaultMessages,
    anniversaryDate: '2024-08-01',
    importantDates: [{ name: 'Anniversary', date: '2024-08-01', notify: true }],
  });

  const setAuth = (name: string, avatar: number, code: string) =>
    setState(s => ({ ...s, isAuthenticated: true, userName: name, userAvatar: avatar, loveCode: code }));

  const setUserMood = (mood: string) => setState(s => ({ ...s, userMood: mood }));

  const addMemory = (m: Memory) => setState(s => ({ ...s, memories: [m, ...s.memories] }));
  const addNote = (n: Note) => setState(s => ({ ...s, notes: [n, ...s.notes] }));
  const updateNote = (n: Note) => setState(s => ({ ...s, notes: s.notes.map(x => x.id === n.id ? n : x) }));
  const deleteNote = (id: string) => setState(s => ({ ...s, notes: s.notes.filter(x => x.id !== id) }));
  const addGift = (g: Gift) => setState(s => ({ ...s, gifts: [g, ...s.gifts] }));
  const updateGift = (g: Gift) => setState(s => ({ ...s, gifts: s.gifts.map(x => x.id === g.id ? g : x) }));
  const deleteGift = (id: string) => setState(s => ({ ...s, gifts: s.gifts.filter(x => x.id !== id) }));
  const addMessage = (msg: ChatMessage) => setState(s => ({ ...s, messages: [...s.messages, msg] }));
  const toggleHeart = (id: string) => setState(s => ({
    ...s, messages: s.messages.map(m => m.id === id ? { ...m, hearted: !m.hearted } : m)
  }));
  const setAnniversaryDate = (date: string) => setState(s => ({ ...s, anniversaryDate: date }));
  const addImportantDate = (d: { name: string; date: string; notify: boolean }) =>
    setState(s => ({ ...s, importantDates: [...s.importantDates, d] }));
  const logout = () => setState(s => ({ ...s, isAuthenticated: false, userName: '', loveCode: '' }));

  return (
    <AppContext.Provider value={{
      ...state, setAuth, setUserMood, addMemory, addNote, updateNote, deleteNote,
      addGift, updateGift, deleteGift, addMessage, toggleHeart, setAnniversaryDate,
      addImportantDate, logout,
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
