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

const quickActions = [
  { emoji: '💕', label: 'Miss You', path: '/chat' },
  { emoji: '📸', label: 'Memory', path: '/memories' },
  { emoji: '📝', label: 'Note', path: '/notes' },
  { emoji: '😊', label: 'Mood', path: '/mood' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActions(false)}
          >
            {/* Blurred backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Action cards */}
            <motion.div
              className="absolute bottom-32 left-0 right-0 flex justify-center gap-3 px-6"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            >
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  className="glass-card flex flex-col items-center gap-2 rounded-2xl px-3 py-4 flex-1 max-w-[85px] border border-border/30 hover:border-accent/40 transition-colors"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 350,
                    delay: i * 0.06,
                  }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                    navigate(action.path);
                  }}
                >
                  <motion.span
                    className="text-2xl"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 12,
                      stiffness: 400,
                      delay: i * 0.06 + 0.1,
                    }}
                  >
                    {action.emoji}
                  </motion.span>
                  <span className="text-[10px] text-foreground/80 font-medium leading-tight text-center">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {/* Center floating button */}
        <div className="flex justify-center relative z-10">
          <motion.button
            className={cn(
              'flex h-[56px] w-[56px] -mb-[28px] items-center justify-center rounded-full shadow-xl transition-shadow duration-300',
              showActions
                ? 'bg-accent glow-accent'
                : 'bg-accent glow-accent'
            )}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            animate={showActions ? { rotate: 0 } : { rotate: 0 }}
            onClick={() => setShowActions(!showActions)}
          >
            <motion.div
              animate={{ rotate: showActions ? 45 : 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              <Plus className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </div>

        {/* Nav bar */}
        <div className="relative">
          {/* SVG notch cutout */}
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
            <div className="flex items-end justify-around px-2 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
              {navItems.map((item) => {
                if (item.path === 'add') {
                  return <div key="add" className="w-[56px] shrink-0" />;
                }

                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.path}
                    className={cn(
                      'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]',
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    )}
                    whileTap={{ scale: 0.82 }}
                    onClick={() => navigate(item.path)}
                  >
                    {/* Active background glow */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-accent/10"
                          layoutId="nav-active-bg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="relative p-0.5"
                      animate={isActive ? { y: -2 } : { y: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                    >
                      <Icon
                        className="h-[22px] w-[22px]"
                        fill={isActive ? 'currentColor' : 'none'}
                        strokeWidth={isActive ? 1.5 : 2}
                      />
                      {/* Active dot indicator */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 500 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.span
                      className={cn('text-[10px] font-medium relative z-10', isActive && 'font-semibold')}
                      animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
                    >
                      {item.label}
                    </motion.span>
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
