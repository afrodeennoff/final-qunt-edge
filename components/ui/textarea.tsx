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
          'field-sizing-content type-body flex min-h-24 w-full rounded-md border border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.05_0.009_260_/_0.72)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.03)] transition-[border-color,background-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus-visible:border-[oklch(0.65_0.22_260_/_0.12)] focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.22_260_/_0.18)] disabled:cursor-not-allowed disabled:opacity-50',
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
