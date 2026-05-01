'use client'

import * as React from 'react'

export function WindowChrome({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="group/window flex items-center gap-[6px] px-2 py-1.5">
        <span className="h-3 w-3 rounded-full bg-[oklch(0.68_0.23_28)] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 transition-opacity group-hover/window:opacity-100" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.85_0.17_87)] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 transition-opacity group-hover/window:opacity-100" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.76_0.2_145)] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] opacity-90 transition-opacity group-hover/window:opacity-100" />
      </div>
    </div>
  )
}
