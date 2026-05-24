import type { ReactNode } from 'react'
import { CONTENT_PADDING, WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
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
  variant?: 'default' | 'elevated' | 'subtle'
  hover?: boolean
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = WORKSPACE_SHELL_WIDTH,
  density = 'default',
  variant = 'default',
}: UnifiedPageShellProps) {
  const densityClasses =
    density === 'compact'
      ? 'py-4 sm:py-6 lg:py-8 2xl:py-10'
      : density === 'spacious'
        ? 'py-8 sm:py-10 lg:py-12 2xl:py-14'
        : 'py-6 sm:py-8 lg:py-10 2xl:py-12'

  return (
    <div
      className={cn(
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        widthClassName === 'max-w-none' && 'max-w-[2400px]',
        widthClassName,
        CONTENT_PADDING,
        densityClasses,
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8 2xl:gap-10">{children}</div>
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
        'mb-6 rounded-xl border border-border/30 bg-card px-4 py-4 sm:py-6 shadow-none sm:px-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,opacity] duration-200 ease-out',
        variant === 'gradient' && 'border-primary/20',
        variant === 'elevated' && 'shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
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
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function UnifiedSurface({ children, className, variant = 'default', hover = false }: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border/30 bg-card p-4 shadow-none sm:p-6',
        'transition-[background-color,border-color,opacity] duration-150 ease-out',
        hover && 'hover:bg-muted/30 hover:border-border/50',
        variant === 'elevated' && 'shadow-sm',
        variant === 'subtle' && 'bg-muted border-border/60',
        className,
      )}
    >
      {children}
    </section>
  )
}
