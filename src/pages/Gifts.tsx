import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import FloatingAddButton from '@/components/FloatingAddButton';
import EmptyState from '@/components/EmptyState';
import StatusPill from '@/components/StatusPill';
import BottomNav from '@/components/BottomNav';
import { useApp, Gift } from '@/contexts/AppContext';

const statusConfig = {
  idea: { label: 'Idea 💡', variant: 'warning' as const },
  planned: { label: 'Planned 📋', variant: 'primary' as const },
  bought: { label: 'Bought ✅', variant: 'success' as const },
};

const Gifts = () => {
  const navigate = useNavigate();
  const { gifts, addGift, updateGift, deleteGift } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<Gift['status']>('idea');

  const filtered = filter === 'all' ? gifts : gifts.filter(g => g.status === filter);

  const handleAdd = () => {
    if (!name.trim()) return;
    addGift({ id: Date.now().toString(), name, notes, link, status });
    setName(''); setNotes(''); setLink(''); setShowModal(false);
  };

  const cycleStatus = (g: Gift) => {
    const order: Gift['status'][] = ['idea', 'planned', 'bought'];
    const next = order[(order.indexOf(g.status) + 1) % 3];
    updateGift({ ...g, status: next });
  };

  return (
    <div className="min-h-[100dvh] bg-app pb-28 overflow-x-hidden">
      <div className="px-4 safe-top pt-3">
        <motion.div className="flex items-center gap-3 mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => navigate('/settings')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h1 className="text-2xl font-display font-bold text-foreground">Secret Gift List 🎁</h1>
        </motion.div>
        <p className="text-xs text-muted-foreground mb-5 pl-8">Only you can see this</p>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
          {['all', 'idea', 'planned', 'bought'].map(s => (
            <StatusPill key={s} label={s === 'all' ? 'All' : statusConfig[s as Gift['status']].label} variant={filter === s ? 'primary' : 'default'} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="😏" text="Start planning surprises" actionLabel="Add Gift" onAction={() => setShowModal(true)} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{g.name}</p>
                      {g.notes && <p className="text-xs text-muted-foreground mt-0.5">{g.notes}</p>}
                      <div className="mt-2">
                        <StatusPill label={statusConfig[g.status].label} variant={statusConfig[g.status].variant} onClick={() => cycleStatus(g)} />
                      </div>
                    </div>
                    <button className="text-muted-foreground/40 hover:text-destructive transition-colors" onClick={() => deleteGift(g.id)}>
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
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowModal(false)}>
          <motion.div className="glass-card w-full max-w-lg rounded-t-3xl p-6 space-y-4" initial={{ y: '100%' }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-foreground">New Gift Idea</h2>
            <input className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Gift name" value={name} onChange={e => setName(e.target.value)} />
            <input className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
            <input className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Link (optional)" value={link} onChange={e => setLink(e.target.value)} />
            <div className="flex gap-2">
              {(['idea', 'planned', 'bought'] as const).map(s => (
                <StatusPill key={s} label={statusConfig[s].label} variant={status === s ? 'primary' : 'default'} active={status === s} onClick={() => setStatus(s)} />
              ))}
            </div>
            <motion.button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground" whileTap={{ scale: 0.97 }} onClick={handleAdd}>Add Gift 🎁</motion.button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Gifts;
