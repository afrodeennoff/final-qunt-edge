import type { ReactNode } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { BadgeV2 as Badge, ButtonV2 as Button, CardV2 as Card } from '@/components/ui/v2'
import { MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

export const marketingHeroTitleClassName =
  'text-balance text-[48px] font-[275] leading-[var(--leading-none)] tracking-[var(--tracking-tighter)] text-foreground sm:text-[64px] lg:text-[80px] xl:text-[96px]'

export const marketingSectionTitleClassName =
  'text-balance text-[32px] font-[350] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)] text-foreground sm:text-[40px] lg:text-[48px]'

export const marketingBodyClassName = 'text-[14px] leading-[var(--leading-relaxed)] text-muted-foreground/80 sm:text-[15px]'

export function MarketingSection({
  children,
  id,
  className,
  innerClassName,
}: {
  children: ReactNode
  id?: string
  className?: string
  innerClassName?: string
}) {
  return (
    <section
      id={id}
      className={cn('scroll-smooth-butter px-4 py-16 sm:px-6 lg:px-8 lg:py-20', className)}
    >
      <div className={cn('mx-auto w-full', MARKETING_SHELL_WIDTH, innerClassName)}>{children}</div>
    </section>
  )
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  titleAs = 'h2',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  className?: string
  titleAs?: 'h1' | 'h2'
}) {
  const Title = titleAs

  return (
    <header
      className={cn(
        'space-y-4',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <Title className={marketingSectionTitleClassName}>{title}</Title>
      {description ? (
        <p className={cn(marketingBodyClassName, 'max-w-2xl', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </header>
  )
}

export function MarketingFeatureCard({
  icon,
  title,
  description,
  footer,
  className,
}: {
  icon: ReactNode
  title: ReactNode
  description: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-muted/30', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className={cn(marketingBodyClassName, 'mt-2 line-clamp-2 text-sm')}>{description}</p>
      </div>
      {footer ? (
        <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </Card>
  )
}

export function MarketingStatBlock({
  value,
  label,
  className,
}: {
  value: ReactNode
  label: ReactNode
  className?: string
}) {
  return (
     <Card className={cn('p-6 text-center', className)}>
      <p className="text-[32px] font-[250] tracking-[-0.05em] tabular-nums text-foreground leading-none">
        {value}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </Card>
  )
}

export function MarketingStepCard({
  step,
  icon,
  title,
  description,
  className,
}: {
  step: ReactNode
  icon: ReactNode
  title: ReactNode
  description: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('h-full p-6', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {step}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
          {icon}
        </span>
      </div>
      <h3 className="mt-6 text-base font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
      <p className={cn(marketingBodyClassName, 'mt-2 text-sm')}>{description}</p>
    </Card>
  )
}

export function MarketingPricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  highlighted = false,
  badge,
  billingNote,
  className,
}: {
  name: ReactNode
  price: ReactNode
  period?: ReactNode
  description: ReactNode
  features: ReactNode[]
  cta: ReactNode
  href: string
  highlighted?: boolean
  badge?: ReactNode
  billingNote?: ReactNode
  className?: string
}) {
  return (
    <Card
      hover
      className={cn(
        'relative flex h-full flex-col p-7 border border-border bg-card',
        highlighted && 'border-primary/40 shadow-sm',
        className,
      )}
    >
      {badge ? (
        <Badge className="absolute right-5 top-5">
          {badge}
        </Badge>
      ) : null}
      <div className={cn(badge && 'pr-24')}>
        <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">{name}</h3>
        <p className={cn(marketingBodyClassName, 'mt-2 text-sm')}>{description}</p>
      </div>
      <div className="mt-8 flex items-end gap-3">
        <span className="text-5xl font-semibold leading-none tracking-[-0.05em] text-foreground">
          {price}
        </span>
        {period ? <span className="pb-1 text-sm text-muted-foreground">{period}</span> : null}
      </div>
      {billingNote ? <p className="mt-2 text-xs text-muted-foreground">{billingNote}</p> : null}
      <ul className="mt-8 grid flex-1 gap-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground"
          >
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-3 w-3" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant={highlighted ? 'solid' : 'outline'} size="lg" className={cn('mt-8 w-full', highlighted && 'rounded-lg border border-primary/30')} style={highlighted ? { background: 'var(--primary)' } : undefined}>
        <Link href={href}>{cta}</Link>
      </Button>
    </Card>
  )
}

export function MarketingHyperframe({
  children,
  id,
  label = 'Qunt Edge',
  status,
  className,
}: {
  children: ReactNode
  id?: string
  label?: ReactNode
  status?: ReactNode
  className?: string
}) {
  return (
    <Card id={id} className={cn('overflow-hidden p-0 border border-border bg-card', className)}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5 px-2 py-1" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-destructive/80" />
          <span className="h-3 w-3 rounded-full bg-warning/80" />
          <span className="h-3 w-3 rounded-full bg-success/80" />
        </div>
        <div className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </div>
        <div className="hidden min-w-24 justify-end text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/80 sm:flex">
          {status}
        </div>
      </div>
      <div className="relative aspect-video overflow-hidden">{children}</div>
    </Card>
  )
}

export const MarketingBrowserFrame = MarketingHyperframe
