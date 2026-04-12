import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, leftIcon, rightIcon, containerClassName, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    return (
      <div className={cn("relative", containerClassName)}>
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 z-10 flex items-center text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-9 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium tracking-[-0.005em] text-foreground/95 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.22_260/0.55)] focus-visible:border-[oklch(0.65_0.22_260/0.40)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 hover:border-white/[0.16]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[oklch(0.64_0.255_22/0.45)] focus-visible:border-[oklch(0.64_0.255_22/0.55)] focus-visible:ring-[oklch(0.64_0.255_22/0.30)]",
              label && "peer",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0)
              props.onChange?.(e)
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 z-10 flex items-center text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 origin-left transition-all duration-200 pointer-events-none",
              "bg-v2-bg-surface px-1",
              (isFocused || hasValue) ? "text-xs text-v2-accent -translate-y-7 left-2" : "text-muted-foreground",
              leftIcon && (isFocused || hasValue) ? "left-10" : "",
              error && "text-v2-error"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-v2-error">
            {typeof error === "string" ? error : "This field has an error"}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, Input as InputV2 }
