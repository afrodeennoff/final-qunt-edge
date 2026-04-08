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
            <div className="absolute left-3 z-10 flex items-center text-v2-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-[var(--frost-border)] bg-transparent px-3 py-2 text-base shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px] shadow-xs transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-v2-text-muted disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:shadow-[rgba(176,199,217,0.145)_0px_0px_0px_2px]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              "focus-visible:border-v2-accent focus-visible:ring-2 focus-visible:ring-v2-accent/50",
              error && "border-v2-error focus-visible:border-v2-error focus-visible:ring-v2-error/50",
              !error && "focus-visible:border-v2-accent",
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
            <div className="absolute right-3 z-10 flex items-center text-v2-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 origin-left transition-all duration-200 pointer-events-none",
              "bg-v2-bg-base px-1",
              (isFocused || hasValue) ? "text-xs text-v2-accent -translate-y-7 left-2" : "text-v2-text-muted",
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

export { Input }
