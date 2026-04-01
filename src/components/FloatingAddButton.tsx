import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingAddButtonProps {
  onClick: () => void;
}

const FloatingAddButton = ({ onClick }: FloatingAddButtonProps) => (
  <motion.button
    className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg glow-primary"
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
  >
    <Plus className="h-6 w-6 text-primary-foreground" />
  </motion.button>
);

export default FloatingAddButton;
