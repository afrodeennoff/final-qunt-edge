import { cn } from './utils'
import React from 'react'

interface TopBarProps {
  logo: React.ReactNode
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function TopBar({
  logo,
  subtitle,
  actions,
  className,
}: TopBarProps) {
  return (
    <div
      className={cn('pt-8 pb-6 px-6 flex items-center justify-between', className)}
      data-slot="top-bar"
    >
      <div className="flex items-center gap-3">
        {logo}
        {subtitle && (
          <span className="text-[14px] text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}