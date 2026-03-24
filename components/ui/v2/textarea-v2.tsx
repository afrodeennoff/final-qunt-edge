import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaV2Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const TextareaV2 = React.forwardRef<HTMLTextAreaElement, TextareaV2Props>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-v2-md border bg-v2-bg-surface px-3 py-2 text-sm text-v2-text-primary transition-colors outline-none placeholder:text-v2-text-muted focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-v2-error" : "border-v2-border",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
TextareaV2.displayName = "TextareaV2"

export { TextareaV2 }
