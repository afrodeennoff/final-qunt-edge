'use client'

import * as React from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
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
  return (
    <div className={cn('flex min-h-screen w-full bg-background', className)}>
      {sidebar}
      <SidebarInset className="flex-1 relative overflow-hidden">
        <BackgroundGlow variant={backgroundVariant} />
        <div className="relative z-0 flex min-h-screen flex-col">
          {header}
          <main className="flex-1 overflow-y-auto">
            <div className={cn('w-full', CONTENT_PADDING, CONTENT_PADDING_Y)}>
              {children}
            </div>
          </main>
        </div>
        {mobileNav}
      </SidebarInset>
    </div>
  )
}
