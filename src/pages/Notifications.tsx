import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Calendar, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const iconMap = {
  love: Heart,
  reaction: Heart,
  reminder: Bell,
  date: Calendar,
};

const emojiMap = {
  love: '💕',
  reaction: '❤️',
  reminder: '🔔',
  date: '📅',
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (d: Date) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-[100dvh] bg-app pb-28 overflow-x-hidden">
      <div className="px-4 safe-top pt-3">
        <motion.div className="flex items-center justify-between mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-1 -ml-1 active:scale-90 transition-transform">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications 🔔</h1>
          </div>
          {unreadCount > 0 && (
            <motion.button
              className="flex items-center gap-1.5 text-xs font-medium text-primary"
              whileTap={{ scale: 0.95 }}
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </motion.button>
          )}
        </motion.div>

        {unreadCount > 0 && (
          <p className="text-xs text-muted-foreground mb-4">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔕</span>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Love reactions and reminders will show up here</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n, i) => {
                const Icon = iconMap[n.type] || Bell;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard
                      className={cn(
                        'flex items-start gap-3 cursor-pointer transition-all',
                        !n.read && 'ring-1 ring-primary/20'
                      )}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-lg',
                        n.type === 'love' || n.type === 'reaction' ? 'bg-accent/10' : 'bg-primary/10'
                      )}>
                        {n.emoji || emojiMap[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm font-medium', n.read ? 'text-muted-foreground' : 'text-foreground')}>{n.title}</p>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(n.timestamp)}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
