import { cn } from './utils'
import { LucideIcon } from 'lucide-react'

interface HeroCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  trend?: {
    value: string
    direction: 'up' | 'down'
    label?: string
  }
  watermarkIcon?: LucideIcon
  className?: string
}

export function HeroCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  watermarkIcon: WatermarkIcon,
  className,
}: HeroCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 bg-card shadow-card border border-transparent',
        className
      )}
      data-slot="hero-card"
    >
      {WatermarkIcon && (
        <div className="absolute right-0 bottom-0 z-0 opacity-[0.06]">
          <WatermarkIcon className="size-32" />
        </div>
      )}
      <div className="relative z-10">
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="size-[18px] text-primary" strokeWidth={2} />
        </div>
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.05em] mb-1">
          {label}
        </p>
        <div className="flex items-baseline whitespace-nowrap">
          <span className="text-[48px] font-bold leading-none text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-[24px] ms-0.5 text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {trend && (
          <p
            className={cn(
              'text-[14px] font-medium mt-2',
              trend.direction === 'up' ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.value}
            {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
          </p>
        )}
      </div>
    </div>
  )
}