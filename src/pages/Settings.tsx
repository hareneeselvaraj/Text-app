import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Gift, LogOut, Calendar, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import AvatarPair from '@/components/AvatarPair';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Settings = () => {
  const navigate = useNavigate();
  const { userName, partnerName, userAvatar, partnerAvatar, loveCode, anniversaryDate, importantDates, setAnniversaryDate, addImportantDate, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [showLeave, setShowLeave] = useState(false);
  const [newDateName, setNewDateName] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-app px-5 pt-14 pb-10 max-w-lg mx-auto">
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate('/home')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings ⚙️</h1>
      </motion.div>

      <div className="space-y-4">
        {/* Profile */}
        <GlassCard className="flex items-center gap-4">
          <AvatarPair userAvatar={userAvatar} partnerAvatar={partnerAvatar} size="lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">{userName || 'You'} & {partnerName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Love Code: <span className="font-mono tracking-wider text-primary">{loveCode || 'N/A'}</span></p>
          </div>
        </GlassCard>

        {/* Theme */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3">Theme</p>
          <div className="flex gap-3">
            <motion.button
              className={cn('flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all',
                theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
              )}
              whileTap={{ scale: 0.97 }}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              <Sun className="h-4 w-4" /> Sky Breeze
            </motion.button>
            <motion.button
              className={cn('flex-1 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all',
                theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
              )}
              whileTap={{ scale: 0.97 }}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              <Moon className="h-4 w-4" /> Midnight Violet
            </motion.button>
          </div>
        </GlassCard>

        {/* Gift List Link */}
        <GlassCard className="cursor-pointer" onClick={() => navigate('/gifts')}>
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Secret Gift List</p>
              <p className="text-xs text-muted-foreground">Plan surprises 🎁</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </div>
        </GlassCard>

        {/* Reminders */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3">Important Dates</p>
          <div className="space-y-2">
            {importantDates.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground">{d.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Date name" value={newDateName} onChange={e => setNewDateName(e.target.value)} />
            <input type="date" className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-foreground outline-none" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <motion.button
              className="rounded-lg bg-primary/10 px-3 text-primary"
              whileTap={{ scale: 0.9 }}
              onClick={() => { if (newDateName && newDate) { addImportantDate({ name: newDateName, date: newDate, notify: true }); setNewDateName(''); setNewDate(''); } }}
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        </GlassCard>

        {/* About */}
        <GlassCard className="text-center">
          <Heart className="h-5 w-5 text-accent mx-auto mb-1" fill="currentColor" />
          <p className="text-xs text-muted-foreground">LoveNest v1.0</p>
          <p className="text-xs text-muted-foreground">Made with ❤️</p>
        </GlassCard>

        {/* Danger Zone */}
        <div className="space-y-2 pt-4">
          <motion.button
            className="w-full rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLeave(true)}
          >
            Leave Nest
          </motion.button>
          <motion.button
            className="w-full rounded-xl bg-muted/50 py-3 text-sm font-medium text-muted-foreground"
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 inline mr-2" /> Sign Out
          </motion.button>
        </div>
      </div>

      {showLeave && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowLeave(false)}>
          <GlassCard className="max-w-sm w-full text-center p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <p className="text-lg font-display font-bold text-foreground mb-2">Leave Nest? 💔</p>
            <p className="text-sm text-muted-foreground mb-6">This will remove you from this nest. Your memories will be saved.</p>
            <div className="flex gap-3">
              <motion.button className="flex-1 rounded-xl bg-muted/50 py-2.5 text-sm text-muted-foreground" whileTap={{ scale: 0.97 }} onClick={() => setShowLeave(false)}>Stay</motion.button>
              <motion.button className="flex-1 rounded-xl bg-destructive py-2.5 text-sm text-destructive-foreground" whileTap={{ scale: 0.97 }} onClick={handleLogout}>Leave</motion.button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
