import * as React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { accentWithOpacity } from '@/lib/theme/colors'

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  format?: 'currency' | 'percentage' | 'number'
  size?: 'sm' | 'md' | 'lg'
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({
    className,
    title,
    value,
    trend,
    trendValue,
    icon,
    format = 'number',
    size = 'md',
    children,
    ...props
  }, ref) => {
    const trendIcon = {
      up: <TrendingUp className="h-3 w-3 text-green-500" />,
      down: <TrendingDown className="h-3 w-3 text-red-500" />,
      neutral: <Minus className="h-3 w-3 text-muted-foreground" />,
    }

    const trendColor = {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-muted-foreground',
    }

    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    const valueSizeClasses = {
      sm: 'text-lg font-semibold',
      md: 'text-xl font-semibold',
      lg: 'text-2xl font-semibold',
    }

    const formatValue = (val: string | number) => {
      if (typeof val === 'string') return val

      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val)
        case 'percentage':
          return `${val}%`
        default:
          return val.toLocaleString()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border-0 bg-card shadow-sm transition-all duration-[200ms] ease-out',
          'hover:shadow-md hover:-translate-y-0.5',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={cn(valueSizeClasses[size], 'text-foreground mb-2')}>
              {formatValue(value)}
            </p>
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-xs">
                {trendIcon[trend]}
                <span className={trendColor[trend]}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        {children}
      </div>
    )
  }
)
StatsCard.displayName = 'StatsCard'

export { StatsCard }