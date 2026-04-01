import { cn } from '@/lib/utils';

interface StatusPillProps {
  label: string;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  active?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

const StatusPill = ({ label, variant = 'default', active, onClick }: StatusPillProps) => (
  <button
    className={cn(
      'rounded-full px-3 py-1 text-xs font-medium transition-all',
      variantClasses[variant],
      active && 'ring-2 ring-primary/40',
      onClick && 'cursor-pointer hover:opacity-80'
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

export default StatusPill;
