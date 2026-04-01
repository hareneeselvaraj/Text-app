import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import FloatingAddButton from '@/components/FloatingAddButton';
import EmptyState from '@/components/EmptyState';
import StatusPill from '@/components/StatusPill';
import BottomNav from '@/components/BottomNav';
import { useApp, Note } from '@/contexts/AppContext';
import { avatarEmojis } from '@/components/AvatarPair';
import { cn } from '@/lib/utils';

const categories = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'grocery', label: 'Grocery 🛒', emoji: '🛒' },
  { key: 'plans', label: 'Plans 📋', emoji: '📋' },
  { key: 'thoughts', label: 'Thoughts 💭', emoji: '💭' },
] as const;

const catVariant = { grocery: 'success' as const, plans: 'primary' as const, thoughts: 'accent' as const, all: 'default' as const };

const Notes = () => {
  const navigate = useNavigate();
  const { notes, addNote, deleteNote, userAvatar, partnerAvatar } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Note['category']>('plans');

  const filtered = filter === 'all' ? notes : notes.filter(n => n.category === filter);

  const handleAdd = () => {
    if (!title.trim()) return;
    addNote({ id: Date.now().toString(), title, content, category, createdBy: 'user', timestamp: new Date().toISOString() });
    setTitle(''); setContent(''); setShowModal(false);
  };

  return (
    <div className="min-h-[100dvh] bg-app pb-28 overflow-x-hidden">
      <div className="px-4 safe-top pt-3">
        <motion.div className="flex items-center gap-3 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => navigate('/home')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h1 className="text-2xl font-display font-bold text-foreground">Notes 📝</h1>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
          {categories.map(c => (
            <StatusPill key={c.key} label={c.label} variant={filter === c.key ? 'primary' : 'default'} active={filter === c.key} onClick={() => setFilter(c.key)} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="📝" text="No notes yet. Start writing together!" actionLabel="Add Note" onAction={() => setShowModal(true)} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusPill label={categories.find(c => c.key === n.category)?.label || n.category} variant={catVariant[n.category]} />
                        <span className="text-sm">{avatarEmojis[n.createdBy === 'user' ? userAvatar : partnerAvatar]}</span>
                      </div>
                    </div>
                    <button className="text-muted-foreground/40 hover:text-destructive transition-colors self-start" onClick={() => deleteNote(n.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FloatingAddButton onClick={() => setShowModal(true)} />

      {showModal && (
        <motion.div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowModal(false)}>
          <motion.div className="glass-card w-full rounded-t-3xl p-5 space-y-4" initial={{ y: '100%' }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-foreground">New Note</h2>
            <input className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="flex gap-2 flex-wrap">
              {categories.filter(c => c.key !== 'all').map(c => (
                <StatusPill key={c.key} label={c.label} variant={category === c.key ? 'primary' : 'default'} active={category === c.key} onClick={() => setCategory(c.key as Note['category'])} />
              ))}
            </div>
            <textarea className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none h-24" placeholder="Write something..." value={content} onChange={e => setContent(e.target.value)} />
            <motion.button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground" whileTap={{ scale: 0.97 }} onClick={handleAdd}>Save Note ✍️</motion.button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Notes;
