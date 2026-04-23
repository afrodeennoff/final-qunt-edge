'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { BackgroundGlow } from '@/components/ui/background-glow'
import { MotionSection } from '@/components/animation/enhanced-motion'

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
          'relative h-dvh overflow-hidden qe-v2-app-shell bg-[linear-gradient(180deg,oklch(0.032_0.004_260)_0%,oklch(0.022_0.004_260)_100%)]',
          className,
        )}
      >
        <BackgroundGlow variant={backgroundVariant} />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-16 bg-gradient-to-b from-[oklch(0.65_0.22_260_/_0.035)] to-transparent" />
        <div className="relative z-0 flex h-full flex-col">
          {header}
          <div
            className="flex-1 overflow-y-auto overscroll-y-contain"
            style={{
              WebkitOverflowScrolling: 'touch',
              contain: 'content',
            }}
          >
            <MotionSection className="w-full" delay={0.02}>
              {children}
            </MotionSection>
          </div>
        </div>
        {mobileNav}
      </SidebarInset>
    </>
  )
}
