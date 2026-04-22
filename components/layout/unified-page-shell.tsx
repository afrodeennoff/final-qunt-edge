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
  hover?: boolean
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
        variant === 'refined' && 'border-x border-border/12',
        variant === 'minimal' && 'border-x border-border/8',
        widthClassName === 'max-w-none' && 'max-w-[1800px]',
        widthClassName,
        'px-4 sm:px-6 lg:px-8 xl:px-12',
        densityClasses,
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
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.06_0.012_260_/_0.78)]',
          '',
        ],
        variant === 'gradient' && [
          'border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.065_0.012_260_/_0.86)]',
          '',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.09)] bg-[oklch(0.065_0.012_260_/_0.84)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05)]',
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

export function UnifiedSurface({ children, className, variant = 'default', hover = false }: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-xl border p-4 shadow-sm sm:p-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.06_0.012_260_/_0.78)]',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.065_0.012_260_/_0.84)]' : '',
        ],
        variant === 'glass' && [
          'border-[oklch(0.65_0.22_260_/_0.07)] bg-primary/4',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.1)] hover:bg-primary/6' : '',
          '',
        ],
        variant === 'gradient-border' && [
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.06_0.012_260_/_0.74)]',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.11)]' : '',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.09)] bg-[oklch(0.065_0.012_260_/_0.84)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05)]',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.07_0.012_260_/_0.88)]' : '',
        ],
        variant === 'subtle' && [
          'border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.05_0.008_260_/_0.62)] shadow-none',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.1)] hover:bg-[oklch(0.055_0.008_260_/_0.72)]' : '',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
