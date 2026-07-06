'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  value: number | null
  onChange?: (value: number | null) => void
  max?: number
  size?: 'sm' | 'md'
  readOnly?: boolean
}

export function RatingStars({ value, onChange, max = 5, size = 'md', readOnly = false }: RatingStarsProps) {
  const iconSize = size === 'sm' ? 14 : 18

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = value != null && i < value
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return
              onChange?.(value === i + 1 ? null : i + 1)
            }}
            className={cn(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
          >
            <Star
              size={iconSize}
              className={cn(
                filled
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground/30',
              )}
            />
          </button>
        )
      })}
      {value != null && (
        <span className="ml-1 text-[11px] text-muted-foreground">{value}/{max}</span>
      )}
    </div>
  )
}
