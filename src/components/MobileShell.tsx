import React from 'react';

const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-center min-h-[100dvh] bg-muted/30">
    <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-app shadow-2xl overflow-hidden">
      {children}
    </div>
  </div>
);

export default MobileShell;
