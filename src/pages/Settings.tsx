import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Gift, LogOut, Calendar, Plus, Heart, Camera, Cloud, Download, Upload, Share2, Smartphone, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import { avatarEmojis } from '@/components/AvatarPair';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const {
    userName, partnerName, userAvatar, partnerAvatar, userProfilePic, loveCode,
    anniversaryDate, importantDates, setAnniversaryDate, addImportantDate,
    setUserProfilePic, logout, exportData, importData,
    lastDriveBackup, backupToDriveNow, restoreFromDriveNow,
  } = useApp();
  const { driveAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLeave, setShowLeave] = useState(false);
  const [newDateName, setNewDateName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => setUserProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // --- Local Backup ---
  const handleExportLocal = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lovenest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded!');
  };

  const handleImportLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await importData(reader.result as string);
        toast('Data restored successfully!');
      } catch {
        toast('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleShareBackup = async () => {
    const data = await exportData();
    if (navigator.share) {
      const file = new File([data], 'lovenest-backup.json', { type: 'application/json' });
      try {
        await navigator.share({ title: 'LoveNest Backup', files: [file] });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(data);
      toast('Backup copied to clipboard!');
    }
  };

  // --- Google Drive ---
  const handleDriveBackup = async () => {
    setSyncing(true);
    const ok = await backupToDriveNow();
    setSyncing(false);
    toast(ok ? 'Backed up to your Drive!' : 'Backup failed — try signing in again');
  };

  const handleDriveRestore = async () => {
    setSyncing(true);
    const ok = await restoreFromDriveNow();
    setSyncing(false);
    toast(ok ? 'Restored from your Drive!' : 'No backup found on your Drive');
  };

  const formatBackupTime = (iso: string) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="min-h-[100dvh] bg-app px-4 safe-top pt-3 pb-10 overflow-x-hidden">
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate('/home')}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
      </motion.div>

      <div className="space-y-4">
        {/* Profile */}
        <GlassCard className="flex items-center gap-4">
          <motion.button
            className="relative h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden ring-2 ring-border/30 shrink-0"
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
          >
            {userProfilePic ? (
              <img src={userProfilePic} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">{avatarEmojis[userAvatar]}</span>
            )}
            <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Camera className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          </motion.button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div>
            <p className="text-sm font-semibold text-foreground">{userName || 'You'} & {partnerName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Love Code: <span className="font-mono tracking-wider text-primary">{loveCode || 'N/A'}</span></p>
            {isPWA && (
              <p className="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
                <Smartphone className="h-2.5 w-2.5" /> Installed as app
              </p>
            )}
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

        {/* Google Drive Auto-Backup */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Cloud className={cn("h-3.5 w-3.5", driveAccessToken ? "text-emerald-500" : "text-muted-foreground")} />
              Personal Drive Backup
            </p>
            {driveAccessToken && (
              <span className="text-[10px] text-emerald-500 font-medium">● Connected</span>
            )}
          </div>

          {driveAccessToken ? (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground/70">
                Last backup: <span className="font-medium text-foreground">{formatBackupTime(lastDriveBackup)}</span>
              </p>
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDriveBackup}
                  disabled={syncing}
                >
                  {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
                  {syncing ? 'Syncing...' : 'Backup Now'}
                </motion.button>
                <motion.button
                  className="flex-1 rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDriveRestore}
                  disabled={syncing}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Restore
                </motion.button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Auto-saves memories & gifts to your personal Drive every 10 seconds
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground/60 text-center py-2">
              Sign in with Google to enable automatic Drive backups
            </p>
          )}
        </GlassCard>

        {/* Data & Backup */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3">Local Backup</p>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={handleExportLocal}
            >
              <Download className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium">Download</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium">Restore</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={handleShareBackup}
            >
              <Share2 className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium">Share</span>
            </motion.button>
          </div>
          <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImportLocal} />
        </GlassCard>

        {/* Gift List Link */}
        <GlassCard className="cursor-pointer" onClick={() => navigate('/gifts')}>
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Secret Gift List</p>
              <p className="text-xs text-muted-foreground">Plan surprises</p>
            </div>
            <span className="text-muted-foreground">&rarr;</span>
          </div>
        </GlassCard>

        {/* Anniversary / Together Since */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3">Together Since</p>
          <p className="text-[10px] text-muted-foreground/60 mb-2">This date is used to count your days together on the home screen</p>
          <input
            type="date"
            className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground outline-none"
            value={anniversaryDate}
            onChange={e => setAnniversaryDate(e.target.value)}
          />
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
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <input className="flex-1 min-w-0 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" placeholder="Date name" value={newDateName} onChange={e => setNewDateName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input type="date" className="flex-1 min-w-0 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground outline-none" value={newDate} onChange={e => setNewDate(e.target.value)} />
              <motion.button
                className="rounded-lg bg-primary/10 px-4 text-primary shrink-0 active:scale-90 transition-transform"
                whileTap={{ scale: 0.9 }}
                onClick={() => { if (newDateName && newDate) { addImportantDate({ name: newDateName, date: newDate, notify: true }); setNewDateName(''); setNewDate(''); } }}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* About */}
        <GlassCard className="text-center">
          <Heart className="h-5 w-5 text-accent mx-auto mb-1" fill="currentColor" />
          <p className="text-xs text-muted-foreground">LoveNest v3.1</p>
          <p className="text-xs text-muted-foreground">Made with love</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Firebase Sync + Personal Drive Backup</p>
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
        <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/20 px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowLeave(false)}>
          <GlassCard className="max-w-sm w-full text-center p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <p className="text-lg font-display font-bold text-foreground mb-2">Leave Nest?</p>
            <p className="text-sm text-muted-foreground mb-6">This will remove you from this nest. Your Drive backup will be kept.</p>
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
