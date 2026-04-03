import React from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';

const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-center min-h-[100dvh] bg-[hsl(var(--background))]">
    <div className="mobile-shell relative w-full max-w-[430px] min-h-[100dvh] bg-app shadow-2xl overflow-hidden">
      {children}
      <Sonner position="bottom-center" />
    </div>
  </div>
);

export default MobileShell;
