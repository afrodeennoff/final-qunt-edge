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
<<<<<<< HEAD
        'scroll-smooth-butter animate-page-enter relative mx-auto w-full',
        variant === 'refined' && 'border-x border-v2-border/12',
        variant === 'minimal' && 'border-x border-v2-border/8',
        widthClassName === 'max-w-none' && 'max-w-[1800px]',
=======
        "mx-auto w-full relative",
        variant === "refined" && "border-x border-v2-border/12",
        variant === "minimal" && "border-x border-v2-border/8",
        widthClassName === "max-w-none" && "max-w-[1800px]",
>>>>>>> origin/main
        widthClassName,
        'px-4 sm:px-6 lg:px-8 xl:px-12',
        densityClasses,
<<<<<<< HEAD
        variant !== 'minimal' && [
          'before:absolute before:inset-x-6 before:top-0 before:h-44 before:pointer-events-none before:z-0',
          'before:rounded-b-[2.25rem] before:border before:border-primary/10 before:bg-primary/[0.035]',
          'after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0 after:bg-border/35',
=======
        variant !== "minimal" && [
          "before:absolute before:inset-0 before:pointer-events-none before:z-0",
          "before:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(41,98,255,0.08),transparent)]",
          "after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0",
          "after:bg-gradient-to-r after:from-transparent after:via-v2-border/8 after:to-transparent",
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
        "mb-8 rounded-3xl border px-5 py-6 shadow-sm backdrop-blur-sm sm:px-6",
        "transition-all duration-300 ease-out",
        variant === "default" && [
          "border-v2-border/18 bg-v2-bg-surface/70",
          "hover:border-v2-border/24 hover:bg-v2-bg-surface/80",
        ],
        variant === "gradient" && [
          "border-v2-border/18 bg-gradient-to-br from-v2-bg-surface/80 via-v2-bg-surface/60 to-v2-bg-surface/80",
          "hover:border-v2-border/24 hover:from-v2-bg-surface/90 hover:via-v2-bg-surface/70 hover:to-v2-bg-surface/90",
        ],
        variant === "elevated" && [
          "border-v2-border/16 bg-v2-bg-surface/90 shadow-lg",
          "hover:border-v2-border/22 hover:shadow-xl hover:-translate-y-0.5",
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
        "rounded-3xl border p-4 shadow-sm sm:p-6",
        "transition-all duration-300 ease-out",
        variant === "default" && [
          "border-v2-border/18 bg-v2-bg-surface/70 backdrop-blur-sm",
          "hover:border-v2-border/24 hover:bg-v2-bg-surface/80 hover:shadow-md",
        ],
        variant === "glass" && [
          "border-v2-border/12 bg-v2-bg-surface/30 backdrop-blur-xl",
          "shadow-[inset_0_1px_0_hsl(var(--v2-border)_/_0.1)]",
          "hover:border-v2-border/18 hover:bg-v2-bg-surface/40 hover:shadow-lg",
          "hover:shadow-[inset_0_1px_0_hsl(var(--v2-border)_/_0.15),0_8px_16px_-4px_rgba(0,0,0,0.3)]",
>>>>>>> origin/main
        ],
        variant === 'gradient-border' && [
          'border-primary/18 bg-v2-bg-surface/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          'hover:border-primary/26 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]',
        ],
<<<<<<< HEAD
        variant === 'elevated' && [
          'border-primary/14 bg-[hsl(var(--card)/0.98)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]',
          'hover:-translate-y-1 hover:border-primary/22 hover:bg-[hsl(var(--card)/1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_42px_92px_-44px_rgba(4,10,24,0.96)]',
        ],
        variant === 'subtle' && [
          'border-border/35 bg-[hsl(var(--background)/0.62)] shadow-none',
          'hover:border-primary/18 hover:bg-[hsl(var(--background)/0.68)]',
=======
        variant === "elevated" && [
          "border-v2-border/16 bg-v2-bg-surface/90 backdrop-blur-md shadow-lg",
          "hover:border-v2-border/22 hover:bg-v2-bg-surface/95 hover:shadow-xl hover:-translate-y-1",
        ],
        variant === "subtle" && [
          "border-v2-border/10 bg-v2-bg-surface/50 backdrop-blur-sm shadow-none",
          "hover:border-v2-border/16 hover:bg-v2-bg-surface/60",
>>>>>>> origin/main
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
