import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import FloatingAddButton from '@/components/FloatingAddButton';
import EmptyState from '@/components/EmptyState';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';

const Memories = () => {
  const navigate = useNavigate();
  const { memories, addMemory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!caption.trim()) return;
    addMemory({ id: Date.now().toString(), photo: '', date, caption, likes: 0 });
    setCaption('');
    setShowModal(false);
  };

  return (
    <div className="min-h-[100dvh] bg-app pb-28 overflow-x-hidden">
      <div className="px-4 safe-top pt-3 max-w-lg mx-auto">
        <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => navigate('/home')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h1 className="text-2xl font-display font-bold text-foreground">Memories 📸</h1>
        </motion.div>

        {memories.length === 0 ? (
          <EmptyState emoji="📸" text="Add your first memory together" actionLabel="Add Memory" onAction={() => setShowModal(true)} />
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border/30" />
            <div className="space-y-6">
              {memories.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="relative pl-14"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="absolute left-4 top-4 h-4 w-4 rounded-full bg-accent ring-4 ring-background" />
                  <GlassCard>
                    <div className="rounded-xl bg-muted/30 h-40 flex items-center justify-center text-5xl mb-3">📷</div>
                    <p className="text-xs text-muted-foreground font-display">{new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{m.caption}</p>
                    <div className="flex items-center gap-1 mt-2 text-accent">
                      <Heart className="h-3.5 w-3.5" fill="currentColor" />
                      <span className="text-xs">{m.likes}</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FloatingAddButton onClick={() => setShowModal(true)} />

      {showModal && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowModal(false)}>
          <motion.div
            className="glass-card w-full max-w-lg rounded-t-3xl p-6 space-y-4"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold text-foreground">New Memory</h2>
            <div className="rounded-xl bg-muted/30 h-32 flex items-center justify-center text-muted-foreground text-sm cursor-pointer">
              Tap to add photo 📷
            </div>
            <input type="date" className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground outline-none" value={date} onChange={e => setDate(e.target.value)} />
            <input className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Caption..." value={caption} onChange={e => setCaption(e.target.value)} />
            <motion.button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground" whileTap={{ scale: 0.97 }} onClick={handleAdd}>Save Memory 💕</motion.button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Memories;
