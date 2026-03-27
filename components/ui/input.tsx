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
              "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:shadow-lg focus-visible:shadow-v2-accent/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              "focus-visible:border-gradient-to-r focus-visible:from-v2-accent focus-visible:to-v2-accent-hover focus-visible:ring-2 focus-visible:ring-v2-accent/50",
              error && "border-red-500 focus-visible:border-red-500 focus-visible:shadow-red-500/20 focus-visible:ring-red-500/50",
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
              error && "text-red-500"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
            {typeof error === "string" ? error : "This field has an error"}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
