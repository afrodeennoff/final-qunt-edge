import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type UnifiedPageShellProps = {
  children: ReactNode
  className?: string
  widthClassName?: string
  density?: "default" | "compact" | "spacious"
  variant?: "default" | "refined" | "minimal"
}

type UnifiedPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
  variant?: "default" | "gradient" | "elevated"
}

type UnifiedSurfaceProps = {
  children: ReactNode
  className?: string
  variant?: "default" | "glass" | "gradient-border" | "elevated" | "subtle"
}

export function UnifiedPageShell({
  children,
  className,
  widthClassName = "max-w-none",
  density = "default",
  variant = "default",
}: UnifiedPageShellProps) {
  const densityClasses =
    density === "compact"
      ? "py-4 sm:py-6 lg:py-8"
      : density === "spacious"
        ? "py-12 sm:py-16"
        : "py-10 sm:py-12"

  return (
    <div
      className={cn(
        "mx-auto w-full relative",
        variant === "refined" && "border-x border-v2-border/12",
        variant === "minimal" && "border-x border-v2-border/8",
        widthClassName === "max-w-none" && "max-w-[1800px]",
        widthClassName,
        "px-4 sm:px-6 lg:px-8 xl:px-12",
        densityClasses,
        variant !== "minimal" && [
          "before:absolute before:inset-0 before:pointer-events-none before:z-0",
          "before:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(41,98,255,0.08),transparent)]",
          "after:absolute after:inset-x-0 after:top-0 after:h-px after:pointer-events-none after:z-0",
          "after:bg-gradient-to-r after:from-transparent after:via-v2-border/8 after:to-transparent",
        ],
        "[&_.scroll-container]:overflow-y-auto [&_.scroll-container]:scrollbar-thin",
        "animate-in fade-in-0 duration-500",
        className,
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export function UnifiedPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  variant = "default",
}: UnifiedPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 rounded-[calc(var(--radius)+0.5rem)] border px-5 py-6 shadow-sm backdrop-blur-xl sm:px-6",
        "transition-all duration-300 ease-out",
        variant === "default" && [
          "border-v2-border/70 bg-[linear-gradient(180deg,hsl(var(--v2-bg-hover)/0.95),hsl(var(--v2-bg-surface)/0.94))]",
          "hover:border-v2-border/95 hover:bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/0.98),hsl(var(--v2-bg-hover)/0.94))]",
        ],
        variant === "gradient" && [
          "border-v2-border/70 bg-[linear-gradient(135deg,hsl(var(--v2-bg-surface)/0.98),hsl(var(--v2-bg-hover)/0.92))]",
          "hover:border-v2-border/95",
        ],
        variant === "elevated" && [
          "border-v2-border/80 bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/0.98),hsl(var(--v2-bg-hover)/0.94))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]",
          "hover:border-v2-border/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-44px_rgba(4,10,24,0.96)] hover:-translate-y-0.5",
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
          <h1 className={cn(
            "font-semibold tracking-tight text-v2-text-primary sm:tracking-tight",
            "text-3xl sm:text-4xl",
            variant === "gradient" && [
              "bg-gradient-to-br from-v2-text-primary via-v2-text-primary to-v2-text-secondary bg-clip-text text-transparent",
              "bg-gradient-to-r from-v2-text-primary via-v2-accent to-v2-text-primary bg-clip-text text-transparent",
              "bg-[length:200%_auto] animate-shimmer bg-gradient-to-r from-v2-text-primary via-v2-accent to-v2-text-primary",
            ]
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              "max-w-3xl mt-2 text-sm text-v2-text-secondary sm:text-base",
              "leading-relaxed"
            )}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export function UnifiedSurface({
  children,
  className,
  variant = "default",
}: UnifiedSurfaceProps) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius)+0.45rem)] border p-4 shadow-sm sm:p-6",
        "transition-all duration-300 ease-out",
        variant === "default" && [
          "border-v2-border/70 bg-[linear-gradient(180deg,hsl(var(--v2-bg-surface)/0.98),hsl(var(--v2-bg-elevated)/0.96))] backdrop-blur-xl",
          "hover:border-v2-border/95 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]",
        ],
        variant === "glass" && [
          "border-v2-border/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-2xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
          "hover:border-v2-border/90 hover:shadow-[0_28px_72px_-40px_rgba(4,10,24,0.9)]",
        ],
        variant === "gradient-border" && [
          "relative bg-v2-bg-surface/80",
          "before:absolute before:inset-0 before:rounded-3xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-v2-accent/30 before:via-transparent before:to-v2-accent/10",
          "before:-z-10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "before:[mask-composite:exclude]",
          "hover:before:from-v2-accent/40 hover:before:to-v2-accent/20",
        ],
        variant === "elevated" && [
          "border-v2-border/80 bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/0.98),hsl(var(--v2-bg-hover)/0.94))] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_34px_80px_-42px_rgba(4,10,24,0.92)]",
          "hover:border-v2-border/95 hover:bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/1),hsl(var(--v2-bg-hover)/0.96))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_42px_92px_-44px_rgba(4,10,24,0.96)] hover:-translate-y-1",
        ],
        variant === "subtle" && [
          "border-v2-border/60 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm shadow-none",
          "hover:border-v2-border/85 hover:bg-[rgba(255,255,255,0.05)]",
        ],
        className,
      )}
    >
      {children}
    </section>
  )
}
