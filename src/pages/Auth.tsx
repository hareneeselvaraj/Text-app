import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { avatarEmojis } from '@/components/AvatarPair';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const Auth = () => {
  const navigate = useNavigate();
  const { setAuth, setUserProfilePic } = useApp();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [profilePic, setProfilePic] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreate = () => {
    if (!name.trim()) return;
    const code = generateCode();
    setAuth(name, avatar, code);
    if (profilePic) setUserProfilePic(profilePic);
    navigate('/home');
  };

  const handleJoin = () => {
    if (!name.trim() || joinCode.length < 6) return;
    setAuth(name, avatar, joinCode);
    if (profilePic) setUserProfilePic(profilePic);
    navigate('/home');
  };

  return (
    <div className="min-h-[100dvh] bg-app flex items-center justify-center px-5 py-10">
      <GlassCard className="w-full max-w-sm p-5 sm:p-6">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              )}
              onClick={() => setTab(t)}
            >
              {t === 'create' ? 'Create Nest' : 'Join Nest'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'create' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'create' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name</label>
              <input
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Profile Picture</label>
              <div className="flex items-center gap-4 justify-center">
                <motion.button
                  className="relative h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden ring-2 ring-border/30"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">Upload</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </div>
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Or choose an avatar</p>
                  <div className="flex gap-2 mt-2">
                    {avatarEmojis.map((emoji, i) => (
                      <motion.button
                        key={i}
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all',
                          avatar === i && !profilePic ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-muted/50'
                        )}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setAvatar(i); setProfilePic(''); }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {tab === 'join' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Partner's Love Code</label>
                <input
                  className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground text-center tracking-[0.3em] font-mono uppercase placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="______"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            <motion.button
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground glow-primary"
              whileTap={{ scale: 0.97 }}
              onClick={tab === 'create' ? handleCreate : handleJoin}
            >
              {tab === 'create' ? 'Create Your Nest 🪺' : 'Join Nest 💕'}
            </motion.button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            <button className="w-full rounded-xl border border-border/30 bg-muted/30 py-3 text-sm font-medium text-foreground flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default Auth;
