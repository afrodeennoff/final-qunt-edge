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
          'field-sizing-content flex min-h-16 w-full rounded-xl border border-[oklch(0.65_0.22_260_/_0.06)] bg-[oklch(0.05_0.009_260_/_0.68)] px-3.5 py-2.5 text-base text-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.03)] transition-[border-color,background-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus-visible:border-[oklch(0.65_0.22_260_/_0.12)] focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.22_260_/_0.2)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
