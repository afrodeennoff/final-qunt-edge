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
          'before:absolute before:inset-x-6 before:top-0 before:h-44 before:pointer-events-none before:z-0',
          'before:rounded-b-[2.25rem] before:border before:border-primary/10 before:bg-primary/[0.035]',
          'after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0 after:bg-border/35',
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
          'border-border/45 bg-[hsl(var(--card)/0.94)]',
          'hover:border-primary/18 hover:bg-[hsl(var(--card)/0.98)]',
        ],
        variant === 'gradient' && [
          'border-primary/14 bg-[hsl(var(--card)/0.96)]',
          'hover:border-primary/22 hover:bg-[hsl(var(--card)/0.99)]',
        ],
        variant === 'elevated' && [
          'border-primary/14 bg-[hsl(var(--card)/0.98)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]',
          'hover:-translate-y-0.5 hover:border-primary/22 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-44px_rgba(4,10,24,0.96)]',
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
              variant === 'gradient' && 'text-foreground',
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
          'border-border/45 bg-[hsl(var(--card)/0.96)]',
          'hover:border-primary/18 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
        variant === 'glass' && [
          'border-primary/14 bg-[hsl(var(--primary)/0.08)]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
          'hover:border-primary/22 hover:bg-[hsl(var(--primary)/0.1)] hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
        variant === 'gradient-border' && [
          'border-primary/18 bg-v2-bg-surface/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          'hover:border-primary/26 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
        variant === 'elevated' && [
          'border-primary/14 bg-[hsl(var(--card)/0.98)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]',
          'hover:-translate-y-1 hover:border-primary/22 hover:bg-[hsl(var(--card)/1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_42px_92px_-44px_rgba(4,10,24,0.96)]',
        ],
        variant === 'subtle' && [
          'border-border/35 bg-[hsl(var(--background)/0.62)] shadow-none',
          'hover:border-primary/18 hover:bg-[hsl(var(--background)/0.68)]',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
