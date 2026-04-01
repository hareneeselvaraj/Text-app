import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeartParticles from '@/components/HeartParticles';
import { Heart } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <HeartParticles />

      <motion.div
        className="flex flex-col items-center gap-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="relative h-24 w-24 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
          <div className="relative bg-primary/10 rounded-full p-5">
            <Heart className="h-12 w-12 text-accent" fill="currentColor" />
          </div>
        </motion.div>

        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            LoveNest
          </h1>
          <motion.p
            className="text-muted-foreground mt-2 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your private space to love
          </motion.p>
        </div>

        <motion.button
          className="mt-8 rounded-full bg-primary px-10 py-3.5 text-base font-semibold text-primary-foreground glow-primary"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/auth')}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Welcome;
