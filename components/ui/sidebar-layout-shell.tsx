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
      <SidebarInset className={cn('relative h-dvh overflow-hidden qe-v2-app-shell', className)}>
        <BackgroundGlow variant={backgroundVariant} />
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
