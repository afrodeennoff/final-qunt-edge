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
          'before:rounded-b-2xl before:border before:border-border/20 before:bg-primary/[0.02]',
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
        'mb-8 rounded-xl border px-5 py-6 shadow-sm sm:px-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-border/35 bg-card/80',
          '',
        ],
        variant === 'gradient' && [
          'border-primary/14 bg-[hsl(var(--card)/0.96)]',
          '',
        ],
        variant === 'elevated' && [
          'border-border/40 bg-card/90 shadow-sm',
          '',
        ],
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="gap-2">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'font-semibold tracking-tight text-foreground sm:tracking-tight',
              'text-3xl sm:text-4xl',
              variant === 'gradient' && 'text-foreground',
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'max-w-3xl mt-2 text-sm text-muted-foreground sm:text-base',
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
        'rounded-xl border p-4 shadow-sm sm:p-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-border/35 bg-card/80',
          '',
        ],
        variant === 'glass' && [
          'border-border/30 bg-primary/4',
          '',
          '',
        ],
        variant === 'gradient-border' && [
          'border-border/35 bg-card/70',
          '',
        ],
        variant === 'elevated' && [
          'border-border/40 bg-card/90 shadow-sm',
          '',
        ],
        variant === 'subtle' && [
          'border-border/35 bg-[hsl(var(--background)/0.62)] shadow-none',
          '',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
