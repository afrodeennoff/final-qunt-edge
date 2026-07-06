import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const sectionBorder = 'border-transparent'
const surfaceBg = 'bg-card'
const subtleShadow = 'shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]'

type AdminPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  className?: string
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b', sectionBorder, 'pb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary/80">{eyebrow}</p>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

type AdminStatCardProps = {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
}

export function AdminStatCard({ label, value, hint, icon }: AdminStatCardProps) {
  return (
    <Card
      variant="elevated"
      hover
      className={`${sectionBorder} ${surfaceBg} ${subtleShadow}`}
    >
      <CardContent size="sm" className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {icon ? <div className="text-muted-foreground/60">{icon}</div> : null}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

type AdminSectionProps = {
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function AdminSection({
  title,
  description,
  badge,
  actions,
  children,
  className,
  contentClassName,
}: AdminSectionProps) {
  return (
    <Card
      variant="elevated"
      className={cn(
        `overflow-hidden ${sectionBorder} ${surfaceBg} ${subtleShadow}`,
        className,
      )}
    >
      <CardHeader className={`space-y-3 border-b ${sectionBorder}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle size="md">{title}</CardTitle>
              {badge}
            </div>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent size="sm" className={cn('space-y-4 pt-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
