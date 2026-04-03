import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Gift, LogOut, Calendar, Plus, Heart, Camera, Cloud, CloudOff, Download, Upload, Share2, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import { avatarEmojis } from '@/components/AvatarPair';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import {
  signInToDrive,
  signOutOfDrive,
  isConnected as isDriveConnected,
  uploadToDrive,
  downloadFromDrive,
  getClientId,
  setClientId,
} from '@/lib/driveSync';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const {
    userName, partnerName, userAvatar, partnerAvatar, userProfilePic, loveCode,
    anniversaryDate, importantDates, setAnniversaryDate, addImportantDate,
    setUserProfilePic, logout, exportData, importData,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [showLeave, setShowLeave] = useState(false);
  const [newDateName, setNewDateName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [driveClientId, setDriveClientId] = useState(getClientId());
  const [driveConnected, setDriveConnected] = useState(isDriveConnected());
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

  // --- Backup & Sync ---
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
  const handleDriveConnect = async () => {
    if (!driveClientId) {
      toast('Enter your Google Client ID first');
      return;
    }
    setClientId(driveClientId);
    setSyncing(true);
    const ok = await signInToDrive();
    setSyncing(false);
    setDriveConnected(ok);
    toast(ok ? 'Connected to Google Drive!' : 'Connection failed');
  };

  const handleDriveDisconnect = () => {
    signOutOfDrive();
    setDriveConnected(false);
    toast('Disconnected from Drive');
  };

  const handleDriveUpload = async () => {
    setSyncing(true);
    const data = await exportData();
    const ok = await uploadToDrive(data);
    setSyncing(false);
    toast(ok ? 'Synced to Drive!' : 'Sync failed');
  };

  const handleDriveDownload = async () => {
    setSyncing(true);
    const data = await downloadFromDrive();
    setSyncing(false);
    if (data) {
      await importData(data);
      toast('Restored from Drive!');
    } else {
      toast('No backup found on Drive');
    }
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

        {/* Data & Backup */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3">Data & Backup</p>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={handleExportLocal}
            >
              <Download className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium">Backup</span>
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
          <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
            Share your backup file with your partner to sync data between devices
          </p>
        </GlassCard>

        {/* Google Drive Sync */}
        <GlassCard>
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
            {driveConnected ? <Cloud className="h-3.5 w-3.5 text-emerald-500" /> : <CloudOff className="h-3.5 w-3.5" />}
            Google Drive Sync
          </p>
          {!driveConnected ? (
            <div className="space-y-2">
              <input
                className="w-full rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none font-mono"
                placeholder="Google OAuth Client ID (optional)"
                value={driveClientId}
                onChange={e => setDriveClientId(e.target.value)}
              />
              <motion.button
                className="w-full rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
                onClick={handleDriveConnect}
                disabled={syncing}
              >
                <Cloud className="h-4 w-4" />
                {syncing ? 'Connecting...' : 'Connect to Drive'}
              </motion.button>
              <p className="text-[10px] text-muted-foreground/60 text-center">
                Auto-backup your nest data to Google Drive
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDriveUpload}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Upload to Drive'}
                </motion.button>
                <motion.button
                  className="flex-1 rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDriveDownload}
                  disabled={syncing}
                >
                  Restore from Drive
                </motion.button>
              </div>
              <motion.button
                className="w-full rounded-xl bg-muted/50 py-2 text-xs text-muted-foreground"
                whileTap={{ scale: 0.97 }}
                onClick={handleDriveDisconnect}
              >
                Disconnect
              </motion.button>
            </div>
          )}
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
          <p className="text-xs text-muted-foreground">LoveNest v3.0</p>
          <p className="text-xs text-muted-foreground">Made with love</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Firebase Real-time Sync</p>
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
            <p className="text-sm text-muted-foreground mb-6">This will remove you from this nest. Your backup will be saved.</p>
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
