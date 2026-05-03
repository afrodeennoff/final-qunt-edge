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
              "flex w-full rounded-[6px] border border-[oklch(0.65_0.22_260_/_0.14)] bg-[oklch(0.65_0.22_260_/_0.05)] px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-[border-color,box-shadow] duration-[130ms] focus-visible:outline-none focus-visible:border-[oklch(0.62_0.22_290_/_0.45)] focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_oklch(0.62_0.22_290_/_0.30),inset_0_1px_2px_rgba(0,0,0,0.12)] disabled:opacity-40 disabled:cursor-not-allowed file:border-0 file:bg-transparent file:text-sm file:font-medium",
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
              'type-label pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-left bg-[oklch(0.05_0.009_260_/_0.92)] px-1 text-muted-foreground/80 transition-[transform,color] duration-200',
              'text-[11px] font-medium tracking-[0.02em] uppercase',
              (isFocused || hasValue) && '-translate-y-[1.9rem] text-foreground',
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
