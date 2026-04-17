import React from 'react';

export default function Loading() {
  return (
<<<<<<< HEAD
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="relative mb-8 h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-border/40"></div>
        <div className="absolute inset-2 animate-spin rounded-full border-r-2 border-border/36" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
=======
    <div className="min-h-screen bg-background flex flex-col items-center justify-center z-50">
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 border-t-2 border-border/40 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-border/36 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
>>>>>>> origin/main
      </div>
      <div className="animate-pulse text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        Initializing Qunt Edge
      </div>
    </div>
  );
}
