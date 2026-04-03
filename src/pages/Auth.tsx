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
    <div className="min-h-[100dvh] bg-app flex items-center justify-center px-6 py-12">
      <GlassCard className="w-full max-w-md p-8 sm:p-10 shadow-2xl border-white/20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Welcome to LoveNest</h2>
          <p className="text-sm text-muted-foreground/80">Design your private romantic sanctuary</p>
        </div>

        {/* Modern Segmented Control Tab Switcher */}
        <div className="relative flex p-1.5 bg-muted/30 rounded-2xl mb-10 backdrop-blur-sm border border-border/10">
          <motion.div
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl bg-primary shadow-lg shadow-primary/20"
            animate={{
              x: tab === 'create' ? 0 : '100%',
              width: 'calc(50% - 3px)',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          />
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              className={cn(
                'relative z-10 flex-1 py-3 text-sm font-semibold transition-colors duration-300',
                tab === t ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-2.5 block px-1">Your Name</label>
              <input
                className="w-full rounded-2xl bg-muted/20 border border-border/20 px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all duration-300"
                placeholder="How should your partner call you?"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 block px-1">Profile Identity</label>
              <div className="flex items-center gap-6">
                <motion.button
                  className="relative h-16 w-16 flex-shrink-0 rounded-full bg-muted/20 flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all group shadow-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary/50">Add</span>
                    </div>
                  )}
                  {profilePic && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <Camera className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 ml-1">Or pick an avatar</p>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 py-1 -mx-2">
                    {avatarEmojis.map((emoji, i) => (
                      <motion.button
                        key={i}
                        className={cn(
                          'h-12 w-12 min-w-[3rem] rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm border',
                          avatar === i && !profilePic 
                            ? 'bg-primary/10 border-primary shadow-primary/10 ring-1 ring-primary/40 scale-105' 
                            : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border/50'
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-2.5 block px-1">Partner's Nest Code</label>
                <input
                  className="w-full rounded-2xl bg-muted/20 border border-border/20 px-5 py-4 text-lg text-foreground text-center tracking-[0.4em] font-mono uppercase placeholder:text-muted-foreground/40 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                  placeholder="______"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                />
              </motion.div>
            )}

            <div className="pt-4">
              <motion.button
                className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-3"
                whileTap={{ scale: 0.98 }}
                onClick={tab === 'create' ? handleCreate : handleJoin}
              >
                {tab === 'create' ? 'Launch Your Nest 🚀' : 'Join the Nest 🥂'}
              </motion.button>
            </div>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Secure Access</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>

            <button className="w-full rounded-2xl border border-border/30 bg-white dark:bg-muted/10 py-4 text-sm font-bold text-foreground flex items-center justify-center gap-4 shadow-sm hover:shadow-md hover:bg-muted/5 transition-all">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default Auth;
