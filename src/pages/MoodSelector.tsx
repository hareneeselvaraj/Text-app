import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import { useApp } from '@/contexts/AppContext';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Angry' },
];

const MoodSelector = () => {
  const navigate = useNavigate();
  const { userName, partnerName, userMood, partnerMood, setUserMood } = useApp();

  const handleSelect = (emoji: string) => {
    setUserMood(emoji);
  };

  return (
    <div className="min-h-screen bg-app px-5 pt-14 pb-10 max-w-lg mx-auto">
      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate('/home')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="text-2xl font-display font-bold text-foreground">How are you feeling?</h1>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {moods.map((m, i) => (
          <motion.button
            key={m.label}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
              userMood === m.emoji ? 'glass-card ring-2 ring-primary' : ''
            }`}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleSelect(m.emoji)}
          >
            <motion.span
              className="text-4xl"
              animate={userMood === m.emoji ? { scale: [1, 1.3, 1.1] } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {m.emoji}
            </motion.span>
            <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
          </motion.button>
        ))}
      </div>

      <GlassCard className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-3">Current Moods</p>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <span className="text-3xl block">{userMood}</span>
            <span className="text-xs text-muted-foreground mt-1 block">{userName || 'You'}</span>
          </div>
          <span className="text-accent text-lg">💕</span>
          <div className="text-center">
            <span className="text-3xl block">{partnerMood}</span>
            <span className="text-xs text-muted-foreground mt-1 block">{partnerName}</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-medium text-muted-foreground mb-3">Last 7 Days</p>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-lg">{moods[i % moods.length].emoji}</span>
              <span className="text-[9px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default MoodSelector;
