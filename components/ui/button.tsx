import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva("cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[opacity,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(0.78_0.12_82/0.7)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden select-none",
 {
 variants: {
 variant: {
 solid:"bg-[oklch(0.78_0.12_82)] text-[oklch(0.14_0.02_85)] rounded-xl shadow-[0_0_0_0.5px_oklch(0.78_0.12_82/0.45),0_6px_18px_oklch(0.78_0.12_82/0.20)] hover:bg-[oklch(0.84_0.10_82)] hover:shadow-[0_0_0_0.5px_oklch(0.84_0.10_82/0.55),0_10px_28px_oklch(0.78_0.12_82/0.28)] hover:scale-[1.015] active:scale-[0.975] active:shadow-none",
 outline:"border border-white/[0.12] bg-[oklch(0.78_0.12_82/0.07)] text-foreground/95 rounded-xl hover:bg-[oklch(0.78_0.12_82/0.11)] hover:border-white/[0.18] hover:scale-[1.01] active:scale-[0.98]",
 ghost:"text-muted-foreground rounded-xl hover:text-foreground/95 hover:bg-[oklch(0.78_0.12_82/0.10)]",
 error:"bg-[oklch(0.64_0.255_22)] text-white rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:bg-[oklch(0.70_0.255_22)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.4)] hover:scale-[1.01] active:scale-[0.98]",
 destructive:"bg-[oklch(0.64_0.255_22)] text-white rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:bg-[oklch(0.70_0.255_22)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.4)] hover:scale-[1.01] active:scale-[0.98]",
 link:"text-[oklch(0.78_0.12_82)] underline-offset-4 hover:underline rounded-sm","gradient-primary":"bg-gradient-to-r from-[oklch(0.82_0.10_82)] to-[oklch(0.62_0.14_42)] text-[oklch(0.14_0.02_85)] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_26px_-10px_oklch(0.70_0.12_62/0.35)] hover:shadow-[0_0_28px_oklch(0.78_0.12_82/0.28)] hover:scale-[1.015] active:scale-[0.975]","gradient-secondary":"bg-gradient-to-br from-[rgba(232,206,150,0.10)] to-[rgba(255,255,255,0.02)] border border-[rgba(232,206,150,0.14)] text-foreground/95 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:from-[rgba(232,206,150,0.14)] hover:to-[rgba(255,255,255,0.04)] hover:scale-[1.01] active:scale-[0.98]",
 shimmer:"bg-[oklch(0.78_0.12_82)] text-[oklch(0.14_0.02_85)] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_6px_18px_-6px_oklch(0.78_0.12_82/0.24)]",
 default:"bg-[oklch(0.78_0.12_82)] text-[oklch(0.14_0.02_85)] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_6px_18px_-6px_oklch(0.78_0.12_82/0.24)] hover:bg-[oklch(0.84_0.10_82)] hover:scale-[1.015] active:scale-[0.975]",
 secondary:"bg-[rgba(232,206,150,0.06)] text-foreground/95 border border-[rgba(232,206,150,0.12)] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:bg-[rgba(232,206,150,0.10)] hover:scale-[1.01] active:scale-[0.98]",
 mono:"font-mono rounded-lg border border-white/[0.10] bg-transparent text-foreground/95 hover:border-white/[0.18] hover:bg-white/[0.05] focus-visible:ring-offset-0",
 pill:"bg-transparent text-foreground/95 border border-white/[0.12] rounded-full hover:bg-[oklch(0.78_0.12_82/0.08)] active:bg-[oklch(0.78_0.12_82/0.06)] active:scale-[0.98] transition-[opacity,background-color,border-color] duration-150","pill-solid":"bg-[oklch(0.78_0.12_82)] text-[oklch(0.14_0.02_85)] border-none rounded-full hover:bg-[oklch(0.84_0.10_82)] active:scale-[0.98] transition-[opacity,background-color,border-color] duration-150 font-semibold","pill-ghost":"bg-transparent text-muted-foreground border-none rounded-full hover:bg-[oklch(0.78_0.12_82/0.08)] hover:text-foreground/95 active:bg-[oklch(0.78_0.12_82/0.06)] transition-[opacity,background-color,border-color] duration-150",
 },
 size: {
 sm:"h-8 min-h-[32px] min-w-[32px] px-3 text-xs rounded-lg",
 default:"h-9 min-h-[36px] min-w-[36px] px-4 text-sm",
 md:"h-10 min-h-[40px] min-w-[40px] px-5 text-sm",
 lg:"h-11 min-h-[44px] min-w-[44px] px-6 text-[15px]",
 icon:"h-9 w-9 min-h-[36px] min-w-[36px] rounded-xl hover:bg-[oklch(0.78_0.12_82/0.08)]",
 },
 },
 defaultVariants: {
 variant:"solid",
 size:"default",
 },
 }
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean
 isLoading?: boolean
 loadingText?: string
 leftIcon?: React.ReactNode
 rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 (
 {
 className,
 variant,
 size,
 asChild = false,
 isLoading = false,
 loadingText,
 leftIcon,
 rightIcon,
 children,
 disabled,
 ...props
 },
 ref
 ) => {
 const isShimmer = variant ==="shimmer"
 
 const content = (
 <>
 {isShimmer && isLoading && (
 <div className="absolute inset-0 overflow-hidden">
 <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-v2-accent-foreground/20 to-transparent" />
 </div>
 )}
 {leftIcon && !isLoading && <span className="shrink-0">{leftIcon}</span>}
 {isLoading ? (
 <>
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 <span>{loadingText ?? children}</span>
 </>
 ) : (
 children
 )}
 {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
 </>
 )

 if (asChild) {
 return (
 <Slot
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 >
 <span className="inline-flex items-center justify-center gap-2">
 {content}
 </span>
 </Slot>
 )
 }

 return (
 <button
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 disabled={isLoading || disabled}
 aria-busy={isLoading || undefined}
 {...props}
 >
 {content}
 </button>
 )
 }
)
Button.displayName ="Button"

export { Button, buttonVariants }

// For backward compatibility: ButtonV2 is an alias for Button
export { Button as ButtonV2 }
