'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, label, leftIcon, rightIcon, containerClassName, id, ...props },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    return (
      <div className={cn('relative', containerClassName)}>
        <div className="relative flex items-center">
          {leftIcon ? (
            <div className="pointer-events-none absolute left-3 z-10 flex items-center text-muted-foreground">
              {leftIcon}
            </div>
          ) : null}
          <input
            id={inputId}
            type={type}
            className={cn(
              'type-body-sm flex h-10 w-full rounded-lg border border-border bg-card px-3.5 py-2 text-foreground transition-colors ring-offset-background placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-destructive/50 focus-visible:border-destructive/60 focus-visible:ring-destructive/25',
              label && 'peer',
              className,
            )}
            ref={ref}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onFocus={(event) => {
              setIsFocused(true)
              props.onFocus?.(event)
            }}
            onBlur={(event) => {
              setIsFocused(false)
              setHasValue(event.target.value.length > 0)
              props.onBlur?.(event)
            }}
            onChange={(event) => {
              setHasValue(event.target.value.length > 0)
              props.onChange?.(event)
            }}
            {...props}
          />
          {rightIcon ? (
            <div className="pointer-events-none absolute right-3 z-10 flex items-center text-muted-foreground">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              'type-label pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-left bg-background/80 px-1 text-muted-foreground/80 transition-[transform,color] duration-200',
              (isFocused || hasValue) && '-translate-y-7 text-foreground',
              leftIcon && !(isFocused || hasValue) && 'left-10',
              leftIcon && (isFocused || hasValue) && 'left-9',
              error && 'text-destructive',
            )}
          >
            {label}
          </label>
        ) : null}
        {typeof error === 'string' ? (
          <p id={`${inputId}-error`} className="type-body-sm mt-1 text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input, Input as InputV2 }
