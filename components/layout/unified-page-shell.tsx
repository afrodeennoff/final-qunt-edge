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
  variant?: 'default' | 'glass' | 'gradient-border' | 'elevated' | 'subtle'
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
      ? 'py-4 sm:py-6 lg:py-8'
      : density === 'spacious'
        ? 'py-10 sm:py-14 lg:py-16'
        : 'py-8 sm:py-10 lg:py-12'

  return (
    <div
      className={cn(
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        variant === 'refined' && 'border-x border-[oklch(0.65_0.22_260_/_0.06)]',
        variant === 'minimal' && 'border-x border-[oklch(0.65_0.22_260_/_0.04)]',
        widthClassName,
        CONTENT_PADDING,
        densityClasses,
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-6 sm:gap-8">{children}</div>
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
        'rounded-2xl border px-5 py-6 sm:px-6 sm:py-7',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[oklch(0.65_0.22_260_/_0.07)] bg-[linear-gradient(180deg,oklch(0.064_0.011_260_/_0.88)_0%,oklch(0.054_0.01_260_/_0.82)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_18px_36px_-28px_rgba(0,0,0,0.78)]',
        ],
        variant === 'gradient' && [
          'border-[oklch(0.65_0.22_260_/_0.09)] bg-[linear-gradient(135deg,oklch(0.07_0.012_260_/_0.92)_0%,oklch(0.055_0.01_260_/_0.86)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_20px_40px_-30px_rgba(0,0,0,0.8)]',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[linear-gradient(180deg,oklch(0.068_0.012_260_/_0.92)_0%,oklch(0.056_0.01_260_/_0.86)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.06),0_24px_44px_-30px_rgba(0,0,0,0.82)]',
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

export function UnifiedSurface({
  children,
  className,
  variant = 'default',
  hover = false,
}: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border p-4 sm:p-6',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[oklch(0.65_0.22_260_/_0.07)] bg-[linear-gradient(180deg,oklch(0.062_0.01_260_/_0.84)_0%,oklch(0.052_0.009_260_/_0.78)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04),0_16px_34px_-26px_rgba(0,0,0,0.74)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.11)] hover:bg-[linear-gradient(180deg,oklch(0.066_0.01_260_/_0.88)_0%,oklch(0.054_0.009_260_/_0.82)_100%)]'
            : '',
        ],
        variant === 'glass' && [
          'border-[oklch(0.65_0.22_260_/_0.06)] bg-[oklch(0.055_0.01_260_/_0.66)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.1)] hover:bg-[oklch(0.058_0.01_260_/_0.74)]'
            : '',
        ],
        variant === 'gradient-border' && [
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[linear-gradient(180deg,oklch(0.06_0.01_260_/_0.82)_0%,oklch(0.05_0.009_260_/_0.76)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_18px_36px_-28px_rgba(0,0,0,0.76)]',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.11)]' : '',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.08)] bg-[linear-gradient(180deg,oklch(0.068_0.012_260_/_0.9)_0%,oklch(0.056_0.01_260_/_0.84)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.06),0_22px_40px_-28px_rgba(0,0,0,0.8)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[linear-gradient(180deg,oklch(0.07_0.012_260_/_0.92)_0%,oklch(0.058_0.01_260_/_0.86)_100%)]'
            : '',
        ],
        variant === 'subtle' && [
          'border-[oklch(0.65_0.22_260_/_0.05)] bg-[oklch(0.048_0.008_260_/_0.6)] shadow-none',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.09)] hover:bg-[oklch(0.052_0.008_260_/_0.68)]'
            : '',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
