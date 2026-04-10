'use client'

import * as React from 'react'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  CONTENT_PADDING,
  CONTENT_PADDING_Y,
} from '@/lib/constants/layout'
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
  const { state } = useSidebar()

  return (
    <div className={cn('flex min-h-screen w-full bg-background group', className)}>
      {sidebar}
      <main
        data-state={state}
        className="peer flex-1 relative overflow-hidden ml-0 transition-[margin] duration-200 ease-linear peer-data-[state=collapsed]:ml-2"
      >
        <BackgroundGlow variant={backgroundVariant} />
        <div className="relative z-0 flex min-h-screen flex-col">
          {header}
          <div className="flex-1 overflow-y-auto overscroll-y-contain">
            <div className={cn('w-full', CONTENT_PADDING, CONTENT_PADDING_Y)}>
              {children}
            </div>
          </div>
        </div>
        {mobileNav}
      </main>
    </div>
  )
}
