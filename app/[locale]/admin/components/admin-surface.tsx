import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
        'flex flex-col gap-4 border-b border-[oklch(0.65_0.22_260/0.08)] pb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">{eyebrow}</p>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
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
      variant="frost"
      hover
      className="border-border/45 bg-background/72 shadow-[0_18px_42px_-30px_rgba(0,0,0,0.86)]"
    >
      <CardContent size="sm" className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
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
      variant="frost"
      className={cn(
        'overflow-hidden border-border/45 bg-background/72 shadow-[0_22px_52px_-34px_rgba(0,0,0,0.9)]',
        className,
      )}
    >
      <CardHeader className="space-y-3 border-b border-[oklch(0.65_0.22_260/0.08)]">
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
