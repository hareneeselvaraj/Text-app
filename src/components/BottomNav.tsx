import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Plus, Camera, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: 'add', icon: Plus, label: 'Add' },
  { path: '/memories', icon: Camera, label: 'Memories' },
  { path: '/notes', icon: BookOpen, label: 'Notes' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const quickActions = [
    { emoji: '💕', label: 'Miss You', path: '/chat' },
    { emoji: '📸', label: 'Memory', path: '/memories' },
    { emoji: '📝', label: 'Note', path: '/notes' },
    { emoji: '😊', label: 'Mood', path: '/mood' },
  ];

  return (
    <>
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 z-40 bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActions(false)}
          >
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  className="glass-card flex flex-col items-center gap-1 rounded-2xl px-3 py-3 min-w-[68px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowActions(false); navigate(action.path); }}
                >
                  <span className="text-xl">{action.emoji}</span>
                  <span className="text-[10px] text-foreground font-medium leading-tight">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="absolute bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/20">
        <div className="dark:border-t dark:border-primary/30" />
        <div className="flex items-center justify-around px-1 pt-2 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
          {navItems.map((item) => {
            const isAdd = item.path === 'add';
            const isActive = !isAdd && location.pathname === item.path;
            const Icon = item.icon;

            if (isAdd) {
              return (
                <motion.button
                  key="add"
                  className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg glow-primary shrink-0"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowActions(!showActions)}
                >
                  <Plus className="h-7 w-7 text-primary-foreground" />
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-[52px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
              >
                <div className={cn('relative p-1', isActive && 'glow-primary rounded-lg')}>
                  <Icon className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
