import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Camera, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/mood', icon: Heart, label: 'Liked' },
  { path: '/memories', icon: Camera, label: 'Memories' },
  { path: '/notes', icon: BookOpen, label: 'Notes' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(env(safe-area-inset-bottom,12px),12px)] px-4">
      <motion.nav
        className="relative flex items-center gap-1 rounded-full px-2 py-2 border border-border/20"
        style={{
          background: 'hsl(var(--card) / 0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 8px 32px hsl(var(--shadow-color) / 0.12), inset 0 1px 0 hsl(var(--card) / 0.15), 0 0 0 1px hsl(var(--border) / 0.08)',
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260, delay: 0.2 }}
      >
        {/* Animated glow behind active item */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              className={cn(
                'relative flex items-center gap-2 rounded-full transition-colors duration-300',
                isActive
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              animate={{
                paddingLeft: isActive ? 14 : 12,
                paddingRight: isActive ? 16 : 12,
                paddingTop: 10,
                paddingBottom: 10,
              }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  layoutId="nav-pill"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--accent) / 0.85), hsl(var(--accent) / 0.65))',
                    boxShadow:
                      '0 0 20px hsl(var(--accent) / 0.35), 0 0 40px hsl(var(--accent) / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.15)',
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}

              <motion.div className="relative z-10" layout>
                <Icon
                  className="h-[20px] w-[20px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </motion.div>

              {/* Animated label */}
              <motion.span
                className="relative z-10 text-xs font-semibold whitespace-nowrap overflow-hidden"
                animate={{
                  width: isActive ? 'auto' : 0,
                  opacity: isActive ? 1 : 0,
                  marginLeft: isActive ? 0 : -4,
                }}
                initial={false}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default BottomNav;
