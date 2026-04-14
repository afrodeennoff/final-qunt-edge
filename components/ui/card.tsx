import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?:"default" |"glass" |"elevated" |"outlined" |"flat" |"gradient-border" |"frost"
 hover?: boolean
 size?:"sm" |"md" |"lg"
 clickable?: boolean
 status?: CardStatusTone
 isLoading?: boolean
 accent?:"primary" |"success" |"warning" |"destructive" |"info"
}

export type CardStatusTone ="live" |"synced" |"idle" |"destructive" |"error"

const Card = React.forwardRef<HTMLDivElement, CardProps>(
 (
 {
 className,
 variant ="default",
 hover = false,
 size ="md",
 clickable = false,
 status,
 isLoading = false,
 accent,
 onClick,
 children,
 ...props
 },
 ref
 ) => {
 const isInteractive = clickable || typeof onClick ==="function"

 const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
 if (isInteractive && (e.key ==="Enter" || e.key ==="")) {
 e.preventDefault()
 onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
 }
 }

 const accentBorderMap = {
 primary:"from-[oklch(0.7001_0.1882_313.2907)] to-[oklch(0.4865_0.2423_291.8661)]",
 success:"from-[hsl(var(--success))] to-emerald-300",
 warning:"from-[hsl(var(--warning))] to-amber-300",
 destructive:"from-[hsl(var(--destructive))] to-rose-300",
 info:"from-[oklch(0.7001_0.1882_313.2907)] to-[oklch(0.4865_0.2423_291.8661)]",
 } satisfies Record<NonNullable<CardProps["accent"]>, string>

 return (
 <div
 ref={ref}
 role={isInteractive ?"button" : undefined}
 tabIndex={isInteractive ? 0 : undefined}
 onKeyDown={isInteractive ? handleKeyDown : undefined}
 className={cn("group relative overflow-hidden text-foreground/95 ",
 accent && variant !=="gradient-border" &&"border-transparent",
 variant ==="default" && ["rounded-xl border bg-[linear-gradient(180deg,oklch(0.1486_0.014_299.9811/0.98),oklch(0.1091_0.0091_301.6956/0.96))]","border-[oklch(0.2505_0.0293_299.5707/0.9)]","shadow-[0_0_0_0.5px_rgba(145,108,255,0.08),0_6px_22px_-10px_rgba(0,0,0,0.82)]",
 ],
 variant ==="glass" && ["rounded-xl border bg-[linear-gradient(180deg,oklch(0.6083_0.2172_297.1153/0.08),rgba(255,255,255,0.02))] backdrop-saturate-200","border-[oklch(0.6083_0.2172_297.1153/0.18)]","shadow-[0_0_0_0.5px_rgba(145,108,255,0.10),0_8px_32px_-8px_rgba(0,0,0,0.75)]",
 ],
 variant ==="elevated" && ["rounded-xl border bg-[linear-gradient(180deg,oklch(0.2363_0.0582_299.6364/0.78),oklch(0.1376_0.0118_301.0607/0.98))]","border-[oklch(0.6083_0.2172_297.1153/0.20)]","shadow-[0_0_0_0.5px_rgba(145,108,255,0.12),0_14px_42px_-14px_rgba(0,0,0,0.86)]",
 ],
 variant ==="outlined" && ["rounded-xl border-2 border-white/[0.14] bg-transparent shadow-none",
 ],
 variant ==="flat" &&"border-0 bg-transparent shadow-none rounded-xl",
 variant ==="gradient-border" && ["rounded-xl bg-gradient-to-br from-[oklch(0.6083_0.2172_297.1153/0.10)] to-transparent","shadow-[0_0_0_0.5px_rgba(145,108,255,0.08),0_8px_32px_-8px_rgba(0,0,0,0.80)]",
 accent ? `border-0 p-px bg-gradient-to-br ${accentBorderMap[accent]}` :"border border-white/[0.12]",
 ],
 variant ==="frost" && ["rounded-xl bg-transparent","border border-[oklch(0.6083_0.2172_297.1153/0.18)]","shadow-[0_0_0_0.5px_rgba(145,108,255,0.08),0_18px_48px_-20px_rgba(0,0,0,0.88)]",
 ],
 size ==="sm" &&"text-sm",
 size ==="md" &&"text-base",
 size ==="lg" &&"text-lg",
 hover &&"hover:border-[oklch(0.6083_0.2172_297.1153/0.28)] hover:shadow-[0_0_0_0.5px_rgba(145,108,255,0.14),0_12px_40px_-8px_rgba(0,0,0,0.82)] hover:-translate-y-[1px]",
 isInteractive &&"cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
 isLoading &&"pointer-events-none opacity-80",
 className
 )}
 onClick={isInteractive ? onClick : undefined}
 {...props}
 >
 {/* Top accent line (all variants except flat) */}
 {variant !=="flat" && !accent && (
 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
 )}
 
 {/* Accent line at top when accent prop is set */}
 {accent && variant !=="flat" && variant !=="gradient-border" && (
 <div className={`absolute inset-x-4 top-0 h-[2px] rounded-b-full bg-gradient-to-r ${accentBorderMap[accent]} opacity-80`} />
 )}

 {/* Ambient glow on hover */}
 {(hover || isInteractive) && (
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.6083_0.2172_297.1153/0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] opacity-0 group-hover:opacity-100" />
 )}

 {variant ==="gradient-border" && (
 <div className="absolute inset-[1px] overflow-hidden rounded-[calc(1rem-1px)]">
 <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.1486_0.014_299.9811/0.98),oklch(0.1091_0.0091_301.6956/0.96))]" />
 </div>
 )}
 {isLoading && (
 <div className="absolute inset-0 overflow-hidden rounded-xl z-20">
 <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
 </div>
 )}
 {status && (
 <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-background/80 px-2.5 py-1 shadow-[inset_0_1px_0_rgba(145,108,255,0.10),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
 <div
 className={cn("h-1.5 w-1.5 rounded-full",
 status ==="live" &&"bg-emerald-400 animate-pulse shadow-[0_0_8px_hsl(160_70%_55%)]",
 status ==="synced" &&"bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]",
 status ==="idle" &&"bg-[oklch(0.65_0.22_260/0.045)]-foreground/40",
 (status ==="destructive" || status ==="error") &&"bg-red-400 shadow-[0_0_6px_hsl(0_80%_60%/0.5)]"
 )}
 />
 <span className="text-[0.6rem] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground/80">
 {status}
 </span>
 </div>
 )}

 <div className={cn("relative z-10 rounded-[inherit]", variant ==="gradient-border" &&"rounded-[calc(1rem-1px)]")}>{children}</div>
 </div>
 )
 }
)
Card.displayName ="Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
 size?:"sm" |"md" |"lg"
 statusDot?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
 ({ className, size ="md", statusDot, children, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("relative flex flex-col gap-2.5",
 {"p-4 pb-0": size ==="sm","p-5 pb-0 sm:p-6 sm:pb-0": size ==="md","p-6 pb-0 sm:p-8 sm:pb-0 lg:p-10 lg:pb-0": size ==="lg",
 },
 className
 )}
 {...props}
 >
 {statusDot ? <div className="absolute right-3 top-3">{statusDot}</div> : null}
 {children}
 </div>
 )
)
CardHeader.displayName ="CardHeader"

export interface CardStatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
 tone?: CardStatusTone
 label?: string
}

const CardStatusDot = React.forwardRef<HTMLSpanElement, CardStatusDotProps>(
 ({ className, tone ="idle", label, ...props }, ref) => (
 <span className="inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/75">
 <span
 ref={ref}
 className={cn("h-1.5 w-1.5 rounded-full",
 tone ==="live" &&"bg-emerald-400 animate-pulse",
 tone ==="synced" &&"bg-primary",
 tone ==="idle" &&"bg-[oklch(0.65_0.22_260/0.045)]-foreground/40",
 (tone ==="destructive" || tone ==="error") &&"bg-red-400",
 className
 )}
 aria-hidden
 {...props}
 />
 {label ? <span className="micro-sans font-semibold">{label}</span> : null}
 </span>
 )
)
CardStatusDot.displayName ="CardStatusDot"

export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
 ({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("shrink-0", className)}
 {...props}
 />
 )
)
CardAction.displayName ="CardAction"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
 size?:"sm" |"md" |"lg" |"xl"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
 ({ className, size ="lg", ...props }, ref) => (
 <h3
 ref={ref}
 className={cn("font-semibold leading-none tracking-tight text-foreground/95",
 {"text-sm": size ==="sm","text-base": size ==="md","text-lg": size ==="lg","text-xl": size ==="xl",
 },
 className
 )}
 {...props}
 />
 )
)
CardTitle.displayName ="CardTitle"

const CardDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <p
 ref={ref}
 className={cn("text-sm leading-relaxed text-muted-foreground/88", className)}
 {...props}
 />
))
CardDescription.displayName ="CardDescription"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
 size?:"sm" |"md" |"lg"
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
 ({ className, size ="md", ...props }, ref) => (
 <div
 ref={ref}
 className={cn("text-foreground/95",
 {"p-4": size ==="sm","p-5 sm:p-6": size ==="md","p-5 sm:p-6 lg:p-10": size ==="lg",
 },
 className
 )}
 {...props}
 />
 )
)
CardContent.displayName ="CardContent"

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
 size?:"sm" |"md" |"lg"
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
 ({ className, size ="md", ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex items-center",
 {"p-4 pt-0": size ==="sm","p-5 pt-0 sm:p-6 sm:pt-0": size ==="md","p-5 pt-0 sm:p-6 sm:pt-0 lg:p-10 lg:pt-0": size ==="lg",
 },
 className
 )}
 {...props}
 />
 )
)
CardFooter.displayName ="CardFooter"

export {
 Card,
 Card as CardV2,
 CardHeader,
 CardFooter,
 CardTitle,
 CardDescription,
 CardContent,
 CardAction,
 CardStatusDot,
}
