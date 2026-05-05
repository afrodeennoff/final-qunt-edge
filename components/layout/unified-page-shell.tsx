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
        variant === 'refined' && 'xl:border-x xl:border-[rgba(0,0,0,0.06)]',
        variant === 'minimal' && 'xl:border-x xl:border-[rgba(0,0,0,0.04)]',
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
        'rounded-xl border px-4 py-4 sm:px-5 sm:py-5',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_18px_36px_-28px_rgba(0,0,0,0.72)]',
        ],
        variant === 'gradient' && [
          'border-[rgba(0,0,0,0.07)] bg-[linear-gradient(135deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.04),0_18px_36px_-28px_rgba(0,0,0,0.74)]',
        ],
        variant === 'elevated' && [
          'border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.05),0_22px_42px_-30px_rgba(0,0,0,0.76)]',
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
                'leading-[var(--leading-relaxed)]',
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
        'rounded-xl border p-4 sm:p-5',
        'animate-fade-up-smooth transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        variant === 'default' && [
          'border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-24px_rgba(0,0,0,0.7)]',
          hover
            ? 'hover:border-[rgba(0,0,0,0.08)] hover:bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)]'
            : '',
        ],
        variant === 'glass' && [
          'border-[rgba(0,0,0,0.06)] bg-[var(--card)]',
          hover
            ? 'hover:border-[rgba(0,0,0,0.06)] hover:bg-[var(--card)]'
            : '',
        ],
        variant === 'gradient-border' && [
          'border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.04),0_20px_36px_-28px_rgba(0,0,0,0.72)]',
          hover ? 'hover:border-[rgba(0,0,0,0.06)]' : '',
        ],
        variant === 'elevated' && [
          'border-[rgba(0,0,0,0.08)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.06),0_24px_42px_-28px_rgba(0,0,0,0.74)]',
          hover
            ? 'hover:border-[rgba(0,0,0,0.06)] hover:bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)]'
            : '',
        ],
        variant === 'subtle' && [
          'border-[rgba(0,0,0,0.06)] bg-[var(--card)] shadow-none',
          hover
            ? 'hover:border-[rgba(0,0,0,0.08)] hover:bg-[var(--card)]'
            : '',
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
