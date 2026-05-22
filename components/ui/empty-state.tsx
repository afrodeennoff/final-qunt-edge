import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ icon, title, description, action, className, size = 'md' }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' && 'gap-3 p-6',
      size === 'md' && 'gap-4 p-8',
      size === 'lg' && 'gap-6 p-12',
      className
    )}>
      {icon && (
        <div className={cn(
          'flex items-center justify-center rounded-full border border-border/40 bg-muted/30 text-muted-foreground/50',
          size === 'sm' && 'h-10 w-10',
          size === 'md' && 'h-12 w-12',
          size === 'lg' && 'h-16 w-16',
        )}>
          {icon}
        </div>
      )}
      <div className="max-w-[22rem] space-y-1.5">
        <p className={cn(
          'font-semibold tracking-[-0.01em] text-foreground',
          size === 'sm' && 'text-[13px]',
          size === 'md' && 'text-[15px]',
          size === 'lg' && 'text-[17px]',
        )}>
          {title}
        </p>
        {description && (
          <p className={cn(
            'text-muted-foreground leading-relaxed',
            size === 'sm' && 'text-[12px]',
            size === 'md' && 'text-[13px]',
            size === 'lg' && 'text-[14px]',
          )}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
