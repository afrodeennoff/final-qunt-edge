'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { BackgroundGlow } from '@/components/ui/background-glow'

interface SidebarLayoutShellProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
  mobileNav?: React.ReactNode
  className?: string
  backgroundVariant?: 'default' | 'accent'
}

export function SidebarLayoutShell({
  sidebar,
  header,
  children,
  mobileNav,
  className,
  backgroundVariant = 'default',
}: SidebarLayoutShellProps) {
  return (
    <>
      {sidebar}
      <SidebarInset
        className={cn(
          'relative h-dvh overflow-hidden qe-v2-app-shell bg-background',
          className,
        )}
      >
        <BackgroundGlow variant={backgroundVariant} />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-14 bg-gradient-to-b from-black/6 to-transparent" />
        <div className="relative z-0 flex h-full flex-col">
          {header}
          <div
            className="flex-1 overflow-y-auto overscroll-y-contain"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="min-h-full w-full">
              {children}
            </div>
          </div>
        </div>
        {mobileNav}
      </SidebarInset>
    </>
  )
}
