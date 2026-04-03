import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] max-w-[430px] mx-auto"
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
        >
          <div className="bg-amber-500 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-center gap-2 safe-top">
            <WifiOff className="h-3 w-3" />
            You're offline — data is saved locally
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
