import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div className="h-[100dvh] bg-app flex flex-col items-center justify-center gap-4">
    <motion.div
      className="text-5xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      💕
    </motion.div>
    <p className="text-sm text-muted-foreground font-medium">Loading your nest...</p>
  </div>
);

export default LoadingScreen;
