import { cn } from './utils'
import React from 'react'

interface PageShellProps {
  children: React.ReactNode
  maxWidth?: '430px' | '1320px'
  className?: string
}

export function PageShell({ children, maxWidth = '430px', className }: PageShellProps) {
  return (
    <div
      className={cn(
        maxWidth === '430px' ? 'max-w-[430px] mx-auto' : 'max-w-[1360px] mx-auto',
        'pb-24',
        className,
      )}
      data-slot="page-shell"
    >
      {children}
    </div>
  )
}
