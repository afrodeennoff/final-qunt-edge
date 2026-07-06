import { cn } from './utils'
import { LucideIcon } from 'lucide-react'
import React from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center text-center', className)}
      data-slot="empty-state"
    >
      <div className="size-12 rounded-xl bg-muted/30 border-0 flex items-center justify-center mb-4">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-[14px] text-muted-foreground font-black mb-2">
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-muted-foreground mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}