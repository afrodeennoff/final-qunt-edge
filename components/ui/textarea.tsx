import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'field-sizing-content type-body flex min-h-24 w-full rounded-md border border-[rgba(0,0,0,0.05)] bg-[var(--card)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgba(0,0,0,0.02)] transition-[border-color,background-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus-visible:border-[rgba(0,0,0,0.08)] focus-visible:ring-2 focus-visible:ring-[rgba(0,0,0,0.10)] disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-destructive/50 focus-visible:border-destructive/60 focus-visible:ring-destructive/25',
          className,
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea, Textarea as TextareaV2 }
