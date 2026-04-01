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
              className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-3 px-4"
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

      <div className="absolute bottom-0 left-0 right-0 z-50">
        {/* Center floating button */}
        <div className="flex justify-center relative z-10">
          <motion.button
            className="flex h-[58px] w-[58px] -mb-[29px] items-center justify-center rounded-full bg-accent shadow-xl glow-accent"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActions(!showActions)}
          >
            <motion.div
              animate={{ rotate: showActions ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </div>

        {/* Nav bar with notch */}
        <div className="relative">
          {/* SVG notch cutout background */}
          <svg
            className="absolute top-0 left-0 w-full"
            height="20"
            viewBox="0 0 430 20"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 20 L0 0 L172 0 C172 0 178 0 184 6 C190 14 198 20 215 20 C232 20 240 14 246 6 C252 0 258 0 258 0 L430 0 L430 20 Z"
              className="fill-[hsl(var(--nav-bg)/var(--nav-bg-opacity))]"
            />
          </svg>

          <nav className="glass-nav pt-3 border-t border-border/10">
            <div className="dark:border-t dark:border-primary/20 absolute top-0 left-0 right-0" />
            <div className="flex items-end justify-around px-3 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
              {navItems.map((item) => {
                if (item.path === 'add') {
                  return <div key="add" className="w-[58px] shrink-0" />;
                }

                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.path}
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[52px]',
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    )}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => navigate(item.path)}
                  >
                    <div className={cn('relative p-1', isActive && 'drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]')}>
                      <Icon className="h-[22px] w-[22px]" fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 1.5 : 2} />
                    </div>
                    <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
