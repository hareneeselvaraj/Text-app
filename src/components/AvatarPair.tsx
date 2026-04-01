import { cn } from '@/lib/utils';

const avatarEmojis = ['🧑‍🦱', '👩‍🦰', '🧔', '👩', '🧑', '👱‍♀️'];

interface AvatarPairProps {
  userAvatar: number;
  partnerAvatar: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-10 w-10 text-xl',
  lg: 'h-14 w-14 text-3xl',
};

const AvatarPair = ({ userAvatar, partnerAvatar, size = 'md' }: AvatarPairProps) => (
  <div className="flex items-center -space-x-2">
    <div className={cn('rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background z-10', sizes[size])}>
      {avatarEmojis[userAvatar] || '🧑'}
    </div>
    <div className={cn('rounded-full bg-accent/10 flex items-center justify-center ring-2 ring-background', sizes[size])}>
      {avatarEmojis[partnerAvatar] || '👩'}
    </div>
  </div>
);

export { avatarEmojis };
export default AvatarPair;
