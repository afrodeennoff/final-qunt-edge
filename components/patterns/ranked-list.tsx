import { cn } from './utils'
import React from 'react'

interface RankedListProps {
  title?: string
  items: {
    rank: number
    name: string
    value: string
    isHighlighted?: boolean
    badge?: string
  }[]
  footer?: string
  className?: string
}

export function RankedList({
  title,
  items,
  footer,
  className,
}: RankedListProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 bg-card shadow-card', className)}
      data-slot="ranked-list"
    >
      {title && (
        <h3 className="text-[18px] font-semibold text-text-primary mb-6">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              item.isHighlighted
                ? 'bg-brand-tint border-2 border-primary'
                : 'bg-surface-subtle'
            )}
          >
            <div
              className={cn(
                'size-8 rounded-full flex items-center justify-center text-[12px] font-bold',
                item.isHighlighted ? 'bg-primary text-white' : 'bg-surface-muted text-text-tertiary'
              )}
            >
              {item.rank}
            </div>
            <span
              className={cn(
                'flex-1 font-semibold',
                item.isHighlighted ? 'text-primary' : 'text-text-primary'
              )}
            >
              {item.name}
            </span>
            <span className="font-bold whitespace-nowrap">{item.value}</span>
            {item.badge && (
              <span className="text-[11px] bg-brand-tint text-primary px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      {footer && (
        <div className="border-t border-surface-muted pt-4 mt-4 text-[12px] text-text-tertiary text-center">
          {footer}
        </div>
      )}
    </div>
  )
}