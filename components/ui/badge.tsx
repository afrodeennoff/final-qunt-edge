import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center justify-center gap-1 rounded-full border font-semibold transition-[opacity,background-color,border-color] duration-150 focus-visible:outline-none text-[11px] tracking-[0.04em]",
 {
 variants: {
 variant: {
 default:"border-[rgba(232,206,150,0.18)] bg-[oklch(0.78_0.12_82/0.10)] text-foreground/95",
 secondary:"border-[rgba(232,206,150,0.12)] bg-[rgba(232,206,150,0.06)] text-muted-foreground",
 outline:"border-white/[0.14] bg-transparent text-foreground/95",
 destructive:"border-[oklch(0.64_0.255_22/0.30)] bg-[oklch(0.64_0.255_22/0.10)] text-[oklch(0.74_0.255_22)]",
 accent:"border-[oklch(0.78_0.12_82/0.30)] bg-[oklch(0.78_0.12_82/0.10)] text-[oklch(0.84_0.10_82)]",
 success:"border-[oklch(0.82_0.185_155/0.28)] bg-[oklch(0.82_0.185_155/0.10)] text-[oklch(0.82_0.185_155)]",
 warning:"border-[oklch(0.84_0.175_80/0.28)] bg-[oklch(0.84_0.175_80/0.10)] text-[oklch(0.84_0.175_80)]",
 error:"border-[oklch(0.64_0.255_22/0.28)] bg-[oklch(0.64_0.255_22/0.10)] text-[oklch(0.74_0.255_22)]",
 frost:"border-[rgba(232,206,150,0.16)] bg-transparent text-foreground/95","frost-accent":"border-[rgba(232,206,150,0.16)] bg-[oklch(0.78_0.12_82/0.10)] text-[oklch(0.84_0.10_82)]","frost-success":"border-[rgba(232,206,150,0.16)] bg-[oklch(0.82_0.185_155/0.10)] text-[oklch(0.82_0.185_155)]","frost-warning":"border-[rgba(232,206,150,0.16)] bg-[oklch(0.84_0.175_80/0.10)] text-[oklch(0.84_0.175_80)]","frost-error":"border-[rgba(232,206,150,0.16)] bg-[oklch(0.64_0.255_22/0.10)] text-[oklch(0.74_0.255_22)]","frost-info":"border-[rgba(232,206,150,0.16)] bg-[oklch(0.78_0.12_82/0.10)] text-[oklch(0.84_0.10_82)]",
 pill:"rounded-full border-white/[0.12] bg-transparent text-foreground/95","pill-accent":"rounded-full border-[oklch(0.78_0.12_82/0.30)] bg-[oklch(0.78_0.12_82/0.10)] text-[oklch(0.84_0.10_82)]","pill-success":"rounded-full border-[oklch(0.82_0.185_155/0.28)] bg-[oklch(0.82_0.185_155/0.10)] text-[oklch(0.82_0.185_155)]","pill-warning":"rounded-full border-[oklch(0.84_0.175_80/0.28)] bg-[oklch(0.84_0.175_80/0.10)] text-[oklch(0.84_0.175_80)]","pill-error":"rounded-full border-[oklch(0.64_0.255_22/0.28)] bg-[oklch(0.64_0.255_22/0.10)] text-[oklch(0.74_0.255_22)]","pill-info":"rounded-full border-[oklch(0.78_0.12_82/0.30)] bg-[oklch(0.78_0.12_82/0.10)] text-[oklch(0.84_0.10_82)]",
 },
 size: {
 sm:"h-5 px-2 py-0 text-[10px]",
 md:"h-6 px-2.5 py-0.5 text-[11px]",
 pill:"h-5 px-2.5 py-0 text-[10px]",
 },
 },
 defaultVariants: {
 variant:"default",
 size:"md",
 },
 }
)

export interface BadgeProps
 extends React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
 return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, Badge as BadgeV2, badgeVariants }
