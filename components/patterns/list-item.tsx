import { cn } from './utils'
import { LucideIcon } from 'lucide-react'
import React from 'react'

interface ListItemProps {
  icon: LucideIcon
  label: string
  value: string
  subtitle?: string
  trailing?: React.ReactNode
  isActive?: boolean
  className?: string
}

export function ListItem({
  icon: Icon,
  label,
  value,
  subtitle,
  trailing,
  isActive = false,
  className,
}: ListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors',
        isActive ? 'bg-primary/8 border border-primary/20' : 'bg-muted/50',
        className
      )}
      data-slot="list-item"
    >
      <div className={cn(
        'size-8 rounded-lg flex items-center justify-center',
        isActive ? 'bg-primary/15' : 'bg-muted'
      )}>
        <Icon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-semibold truncate',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <span className={cn(
        'text-sm font-bold whitespace-nowrap',
        isActive ? 'text-primary' : 'text-foreground'
      )}>
        {value}
      </span>
      {trailing}
    </div>
  )
}
