import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva("relative w-full rounded-xl border p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.62)] [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
 {
 variants: {
 variant: {
 default:"border-[var(--frost-border)] bg-background/60 text-foreground",
 destructive:"border-[oklch(0.6_0.2_15/0.5)] bg-[oklch(0.6_0.2_15/0.08)] text-[oklch(0.6_0.2_15)] [&>svg]:text-[oklch(0.6_0.2_15)]",
 warning:"border-[oklch(0.65_0.2_45/0.5)] bg-[oklch(0.65_0.2_45/0.08)] text-[oklch(0.65_0.2_45)] [&>svg]:text-[oklch(0.65_0.2_45)]",
 success:"border-[oklch(0.55_0.15_166/0.5)] bg-[oklch(0.55_0.15_166/0.08)] text-[oklch(0.55_0.15_166)] [&>svg]:text-[oklch(0.55_0.15_166)]",
 },
 },
 defaultVariants: {
 variant:"default",
 },
 }
)

const Alert = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
 <div
 ref={ref}
 role="alert"
 data-slot="alert"
 className={cn(alertVariants({ variant }), className)}
 {...props}
 />
))
Alert.displayName ="Alert"

const AlertTitle = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
 <h5
 ref={ref}
 data-slot="alert-title"
 className={cn("mb-1 font-medium leading-none tracking-tight", className)}
 {...props}
 />
))
AlertTitle.displayName ="AlertTitle"

const AlertDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 data-slot="alert-description"
 className={cn("text-sm [&_p]:leading-relaxed", className)}
 {...props}
 />
))
AlertDescription.displayName ="AlertDescription"

export { Alert, AlertTitle, AlertDescription }
