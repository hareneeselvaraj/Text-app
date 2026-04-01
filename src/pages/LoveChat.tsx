import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { avatarEmojis } from '@/components/AvatarPair';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

const quickSends = [
  'Miss you 💕', 'Thinking of you 💭', 'Did you eat? 🍕',
  'Take care ❤️', 'Proud of you ✨', 'Good night 🌙',
];

const LoveChat = () => {
  const navigate = useNavigate();
  const { userName, partnerName, partnerAvatar, userAvatar, messages, addMessage, toggleHeart } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    addMessage({ id: Date.now().toString(), text, sender: 'user', timestamp: new Date(), hearted: false });
    setInput('');

    // Simulate partner typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = ['❤️', 'Aww! 🥰', 'You\'re the best!', 'Love you more! 💕', '🥺💕'];
      addMessage({
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'partner',
        timestamp: new Date(),
        hearted: false,
      });
    }, 1500 + Math.random() * 1000);
  };

  const formatTime = (d: Date) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[100dvh] bg-app flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="glass-nav px-4 py-3 flex items-center gap-3 border-b border-border/20 safe-top shrink-0">
        <button onClick={() => navigate('/home')} className="p-1 -ml-1 active:scale-90 transition-transform">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-xl relative shrink-0">
          {avatarEmojis[partnerAvatar]}
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{partnerName}</p>
          <p className="text-[10px] text-emerald-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <div className={cn('max-w-[75%] group relative')}>
                <div className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm',
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'glass-card rounded-bl-md text-foreground'
                )}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  <button
                    className={cn('text-xs transition-all', msg.hearted ? 'text-accent' : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100')}
                    onClick={() => toggleHeart(msg.id)}
                  >
                    <Heart className="h-3 w-3" fill={msg.hearted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-muted-foreground/50"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Sends */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {quickSends.map(qs => (
          <motion.button
            key={qs}
            className="glass-card whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-foreground shrink-0"
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(qs)}
          >
            {qs}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 glass-card rounded-full px-4 py-2.5 flex items-center">
            <input
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              placeholder="Type a love note..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
          </div>
          <motion.button
            className="h-11 w-11 rounded-full bg-primary flex items-center justify-center glow-primary shrink-0"
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
          >
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default LoveChat;
