import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type UnifiedPageShellProps = {
  children: ReactNode
  className?: string
  widthClassName?: string
  density?: 'default' | 'compact' | 'spacious'
  variant?: 'default' | 'refined' | 'minimal'
}

type UnifiedPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'elevated'
}

type UnifiedSurfaceProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient-border' | 'elevated' | 'subtle'
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = 'max-w-none',
  density = 'default',
  variant = 'default',
}: UnifiedPageShellProps) {
  const densityClasses =
    density === 'compact'
      ? 'py-4 sm:py-6 lg:py-8'
      : density === 'spacious'
        ? 'py-12 sm:py-16'
        : 'py-10 sm:py-12'

  return (
    <div
      className={cn(
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        variant === 'refined' && 'border-x border-v2-border/12',
        variant === 'minimal' && 'border-x border-v2-border/8',
        widthClassName === 'max-w-none' && 'max-w-[1800px]',
        widthClassName,
        'px-4 sm:px-6 lg:px-8 xl:px-12',
        densityClasses,
        variant !== 'minimal' && [
          'before:absolute before:inset-0 before:pointer-events-none before:z-0',
          'before:bg-[radial-gradient(ellipse_72%_48%_at_50%_-18%,hsl(var(--primary)/0.14),transparent)]',
          'after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0',
          'after:bg-gradient-to-r after:from-transparent after:via-border/35 after:to-transparent',
        ],
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function UnifiedPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  variant = 'default',
}: UnifiedPageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 rounded-[calc(var(--radius)+0.5rem)] border px-5 py-6 shadow-sm sm:px-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-border/45 bg-[linear-gradient(180deg,hsl(var(--card)/0.94),hsl(var(--background)/0.98))]',
          'hover:border-primary/20 hover:bg-[linear-gradient(180deg,hsl(var(--card)/0.98),hsl(var(--background)/0.96))]',
        ],
        variant === 'gradient' && [
          'border-border/45 bg-[linear-gradient(135deg,hsl(var(--card)/0.98),hsl(var(--background)/0.94))]',
          'hover:border-primary/20',
        ],
        variant === 'elevated' && [
          'border-border/50 bg-[linear-gradient(180deg,hsl(var(--card)/0.98),hsl(var(--background)/0.94))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]',
          'hover:-translate-y-0.5 hover:border-primary/24 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-44px_rgba(4,10,24,0.96)]',
        ],
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="gap-2">
          {eyebrow && (
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-v2-text-muted mb-2">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'font-semibold tracking-tight text-v2-text-primary sm:tracking-tight',
              'text-3xl sm:text-4xl',
              variant === 'gradient' && [
                'bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent',
              ],
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'max-w-3xl mt-2 text-sm text-v2-text-secondary sm:text-base',
                'leading-relaxed',
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>}
      </div>
    </header>
  )
}

export function UnifiedSurface({ children, className, variant = 'default' }: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-[calc(var(--radius)+0.45rem)] border p-4 shadow-sm sm:p-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-border/45 bg-[linear-gradient(180deg,hsl(var(--card)/0.96),hsl(var(--background)/0.94))]',
          'hover:border-primary/20 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
        variant === 'glass' && [
          'border-border/40 bg-[linear-gradient(180deg,hsl(var(--primary)/0.12),rgba(255,255,255,0.02))]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
          'hover:border-primary/22 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
        variant === 'gradient-border' && [
          'relative bg-v2-bg-surface/80',
          'before:absolute before:inset-0 before:rounded-[calc(var(--radius)+0.45rem)] before:p-[1px]',
          'before:bg-gradient-to-br before:from-v2-accent/30 before:via-transparent before:to-v2-accent/10',
          'before:-z-10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]',
          'before:[mask-composite:exclude]',
          'hover:before:from-v2-accent/40 hover:before:to-v2-accent/20',
        ],
        variant === 'elevated' && [
          'border-border/50 bg-[linear-gradient(180deg,hsl(var(--card)/0.98),hsl(var(--background)/0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]',
          'hover:-translate-y-1 hover:border-primary/24 hover:bg-[linear-gradient(180deg,hsl(var(--card)/1),hsl(var(--background)/0.94))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_42px_92px_-44px_rgba(4,10,24,0.96)]',
        ],
        variant === 'subtle' && [
          'border-border/35 bg-[rgba(255,255,255,0.03)] shadow-none',
          'hover:border-primary/20 hover:bg-[rgba(255,255,255,0.05)]',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
