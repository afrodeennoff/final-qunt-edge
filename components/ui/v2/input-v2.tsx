import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputV2Props extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const InputV2 = React.forwardRef<HTMLInputElement, InputV2Props>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <input
        type={props.type}
        className={cn(
          "flex h-10 w-full rounded-v2-md border bg-v2-bg-surface px-3 py-2 text-sm text-v2-text-primary shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px] transition-colors outline-none placeholder:text-v2-text-muted focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-v2-error" : "border-[var(--frost-border)]",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
InputV2.displayName = "InputV2"

export { InputV2 }
