import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Send, Bell, Settings } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import AvatarPair, { avatarEmojis } from '@/components/AvatarPair';
import HeartParticles from '@/components/HeartParticles';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const quickActions = [
  { emoji: '💗', label: 'Miss You' },
  { emoji: '💭', label: 'Thinking of You' },
  { emoji: '❤️', label: 'Love You' },
  { emoji: '🤗', label: 'Hug' },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const LoveFeed = () => {
  const navigate = useNavigate();
  const { userName, partnerName, userAvatar, partnerAvatar, togetherDays, userMood, partnerMood, messages, memories } = useApp();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const lastMessage = messages[messages.length - 1];
  const lastMemory = memories[0];

  return (
    <div className="min-h-[100dvh] bg-app pb-28 relative overflow-x-hidden">
      <HeartParticles />

      <div className="px-4 safe-top pt-3 relative z-10">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-tight">
              {getGreeting()}, {userName || 'Love'} 💕
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your nest awaits</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-xl ring-2 ring-background">
                {avatarEmojis[partnerAvatar]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {/* Together Counter */}
          <motion.div variants={item}>
            <GlassCard className="flex items-center gap-4">
              <div className="animate-pulse-heart">
                <Heart className="h-8 w-8 text-accent" fill="currentColor" />
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-foreground">Together for {togetherDays} days</p>
                <p className="text-xs text-muted-foreground">Every day is a gift ❤️</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Today's Moods */}
          <motion.div variants={item}>
            <GlassCard className="cursor-pointer" onClick={() => navigate('/mood')}>
              <p className="text-xs font-medium text-muted-foreground mb-3">Today's Moods</p>
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{userMood}</span>
                  <span className="text-xs text-muted-foreground">{userName || 'You'}</span>
                </div>
                <Heart className="h-4 w-4 text-accent/50" fill="currentColor" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{partnerMood}</span>
                  <span className="text-xs text-muted-foreground">{partnerName}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <p className="text-xs font-medium text-muted-foreground mb-3">Quick Love</p>
            <div className="flex gap-3 justify-between">
              {quickActions.map(a => (
                <motion.button
                  key={a.label}
                  className="flex flex-col items-center gap-1.5 flex-1"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toast(`${a.emoji} ${a.label} sent to ${partnerName}!`)}
                >
                  <div className="glass-card h-14 w-14 rounded-full flex items-center justify-center text-2xl mx-auto">
                    {a.emoji}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Last Memory */}
          {lastMemory && (
            <motion.div variants={item}>
              <GlassCard className="cursor-pointer" onClick={() => navigate('/memories')}>
                <p className="text-xs font-medium text-muted-foreground mb-2">Latest Memory</p>
                <div className="rounded-xl bg-muted/30 h-32 flex items-center justify-center text-4xl">📸</div>
                <p className="text-sm font-medium text-foreground mt-2">{lastMemory.caption}</p>
                <p className="text-xs text-muted-foreground">{lastMemory.date}</p>
              </GlassCard>
            </motion.div>
          )}

          {/* Chat Preview */}
          {lastMessage && (
            <motion.div variants={item}>
              <GlassCard className="cursor-pointer" onClick={() => navigate('/chat')}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {avatarEmojis[lastMessage.sender === 'user' ? userAvatar : partnerAvatar]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {lastMessage.sender === 'user' ? 'You' : partnerName}
                    </p>
                    <p className="text-sm text-foreground truncate">{lastMessage.text}</p>
                  </div>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LoveFeed;
