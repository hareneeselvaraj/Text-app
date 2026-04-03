import React from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';

const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-center min-h-[100dvh] bg-muted/30">
    <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-app shadow-2xl overflow-hidden">
      {children}
      <div className="absolute inset-0 pointer-events-none z-[9999]" style={{ position: 'absolute' }}>
        <div className="pointer-events-auto">
          <Sonner position="bottom-center" />
        </div>
      </div>
    </div>
  </div>
);

export default MobileShell;
