import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonV2Variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-v2-md font-medium transition-all duration-base ease-v2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base disabled:pointer-events-none disabled:opacity-50 btn-v2",
  {
    variants: {
      variant: {
        solid: "bg-v2-accent text-v2-accent-foreground hover:bg-v2-accent-hover hover:scale-[1.02] active:scale-[0.98] shadow-sm",
        outline: "border border-v2-border bg-transparent text-v2-text-primary hover:bg-v2-bg-hover hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-v2-text-secondary hover:text-v2-text-primary hover:bg-v2-bg-hover",
        destructive: "bg-v2-error text-white hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
)

interface ButtonV2Props extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonV2Variants> {
  asChild?: boolean
}

const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonV2Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonV2Variants({ variant, size, className }))} ref={ref} {...props} />
  }
)
ButtonV2.displayName = "ButtonV2"

export { ButtonV2, buttonV2Variants }
