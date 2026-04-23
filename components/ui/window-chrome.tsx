'use client'

import * as React from 'react'

export function WindowChrome({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="group/window flex items-center gap-[6px] px-2 py-1.5">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 group-hover/window:opacity-100 transition-opacity" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 group-hover/window:opacity-100 transition-opacity" />
        <span className="h-3 w-3 rounded-full bg-[#28CA42] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 group-hover/window:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
