import { motion } from 'framer-motion';

interface EmptyStateProps {
  emoji: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ emoji, text, actionLabel, onAction }: EmptyStateProps) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 gap-4"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <span className="text-6xl">{emoji}</span>
    <p className="text-muted-foreground text-center text-sm max-w-[240px]">{text}</p>
    {actionLabel && onAction && (
      <motion.button
        className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground glow-primary"
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

export default EmptyState;
