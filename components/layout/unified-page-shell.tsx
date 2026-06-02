import type { ReactNode } from 'react'
import { CONTENT_PADDING, WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

type UnifiedPageShellProps = {
  children: ReactNode
  className?: string
  widthClassName?: string
  density?: 'default' | 'compact' | 'spacious'
  variant?: 'default' | 'refined' | 'minimal'
  glow?: boolean
  dotGrid?: boolean
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
  glowOnHover?: boolean
  density?: 'default' | 'compact' | 'comfortable'
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = WORKSPACE_SHELL_WIDTH,
  density = 'default',
  variant = 'default',
  glow = false,
  dotGrid = false,
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
        dotGrid && 'bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px]',
        '[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin',
        className,
      )}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/[0.03] blur-3xl" />
        </div>
      )}
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
        'relative overflow-hidden rounded-xl bg-card px-4 py-4 sm:py-6 sm:px-6',
        'animate-fade-up-smooth transition-[opacity,transform] duration-300',
        variant === 'gradient' && 'bg-primary/5',
        variant === 'elevated' && 'shadow-[0_0_35px_-18px] shadow-primary/15',
        className,
      )}
    >
      {variant === 'gradient' && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/[0.04] blur-2xl" />
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-3">
          {eyebrow && (
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              'font-light tracking-tight text-foreground',
              'text-3xl sm:text-4xl',
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-3xl text-[14px] text-muted-foreground/70 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function UnifiedSurface({ children, className, variant = 'default', hover = false, glowOnHover = false, density = 'default' }: UnifiedSurfaceProps) {
  const densityPadding = density === 'compact'
    ? 'p-3 sm:p-4'
    : density === 'comfortable'
      ? 'p-5 sm:p-8'
      : 'p-4 sm:p-6'

  return (
    <section
      className={cn(
        'group relative overflow-hidden rounded-xl bg-card',
        densityPadding,
        'transition-[box-shadow] duration-300',
        hover && 'hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15',
        glowOnHover && 'hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15',
        variant === 'elevated' && 'shadow-[0_0_35px_-18px] shadow-primary/10',
        variant === 'subtle' && 'bg-gradient-to-br from-muted/50 to-muted/20',
        className,
      )}
    >
      {glowOnHover && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/[0.03] blur-2xl transition-[background-color,transform] duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
