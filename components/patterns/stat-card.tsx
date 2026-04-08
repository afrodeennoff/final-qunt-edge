import { cn } from './utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  trend?: {
    value: string
    direction: 'up' | 'down'
    label?: string
  }
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn('flex items-center gap-3', className)}
      data-slot="stat-card"
    >
      <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[12px] text-text-secondary font-medium uppercase tracking-[0.05em]">
          {label}
        </p>
        <div className="flex items-baseline">
          <span className="text-[36px] font-bold leading-none text-text-primary">
            {value}
          </span>
          {unit && (
            <span className="text-[18px] ms-0.5 text-text-secondary">
              {unit}
            </span>
          )}
        </div>
        {trend && (
          <p
            className={cn(
              'text-[12px] font-medium',
              trend.direction === 'up' ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.value}
            {trend.label && <span className="text-text-tertiary ml-1">{trend.label}</span>}
          </p>
        )}
      </div>
    </div>
  )
}