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
      ? 'py-4 sm:py-5 lg:py-6'
      : density === 'spacious'
        ? 'py-8 sm:py-10 lg:py-12'
        : 'py-5 sm:py-7 lg:py-8'

  return (
    <div
      className={cn(
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        variant === 'refined' && 'xl:border-x xl:border-[oklch(0.65_0.22_260_/_0.08)]',
        variant === 'minimal' && 'xl:border-x xl:border-[oklch(0.65_0.22_260_/_0.06)]',
        widthClassName,
        CONTENT_PADDING,
        densityClasses,
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 sm:gap-5 lg:gap-6">{children}</div>
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
        'rounded-[1.35rem] border px-4 py-4 sm:px-5 sm:py-5',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[oklch(0.65_0.22_260_/_0.09)] bg-[linear-gradient(180deg,oklch(0.07_0.012_260_/_0.92)_0%,oklch(0.056_0.01_260_/_0.88)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_18px_36px_-28px_rgba(0,0,0,0.72)]',
        ],
        variant === 'gradient' && [
          'border-[oklch(0.65_0.22_260_/_0.1)] bg-[linear-gradient(135deg,oklch(0.074_0.014_260_/_0.94)_0%,oklch(0.058_0.011_260_/_0.88)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.06),0_18px_36px_-28px_rgba(0,0,0,0.74)]',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.11)] bg-[linear-gradient(180deg,oklch(0.076_0.014_260_/_0.95)_0%,oklch(0.06_0.011_260_/_0.89)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.07),0_22px_42px_-30px_rgba(0,0,0,0.76)]',
        ],
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'text-balance font-semibold tracking-[-0.03em] text-foreground',
              'text-[1.85rem] sm:text-[2.15rem]',
              variant === 'gradient' && 'text-foreground',
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'max-w-3xl text-sm text-muted-foreground sm:text-[15px]',
                'leading-[1.62]',
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
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
        'rounded-[1.3rem] border p-4 sm:p-5',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[oklch(0.65_0.22_260_/_0.09)] bg-[linear-gradient(180deg,oklch(0.068_0.012_260_/_0.9)_0%,oklch(0.054_0.01_260_/_0.84)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_16px_32px_-24px_rgba(0,0,0,0.7)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.14)] hover:bg-[linear-gradient(180deg,oklch(0.072_0.013_260_/_0.93)_0%,oklch(0.058_0.011_260_/_0.88)_100%)]'
            : '',
        ],
        variant === 'glass' && [
          'border-[oklch(0.65_0.22_260_/_0.085)] bg-[oklch(0.058_0.011_260_/_0.78)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.13)] hover:bg-[oklch(0.062_0.012_260_/_0.84)]'
            : '',
        ],
        variant === 'gradient-border' && [
          'border-[oklch(0.65_0.22_260_/_0.11)] bg-[linear-gradient(180deg,oklch(0.072_0.013_260_/_0.9)_0%,oklch(0.058_0.011_260_/_0.84)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.06),0_20px_36px_-28px_rgba(0,0,0,0.72)]',
          hover ? 'hover:border-[oklch(0.65_0.22_260_/_0.15)]' : '',
        ],
        variant === 'elevated' && [
          'border-[oklch(0.65_0.22_260_/_0.12)] bg-[linear-gradient(180deg,oklch(0.078_0.014_260_/_0.95)_0%,oklch(0.062_0.012_260_/_0.89)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.08),0_24px_42px_-28px_rgba(0,0,0,0.74)]',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.16)] hover:bg-[linear-gradient(180deg,oklch(0.082_0.015_260_/_0.97)_0%,oklch(0.066_0.013_260_/_0.92)_100%)]'
            : '',
        ],
        variant === 'subtle' && [
          'border-[oklch(0.65_0.22_260_/_0.075)] bg-[oklch(0.054_0.01_260_/_0.72)] shadow-none',
          hover
            ? 'hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.058_0.011_260_/_0.8)]'
            : '',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
