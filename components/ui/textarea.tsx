import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, error, ...props }, ref) => {
 return (
 <textarea
 className={cn("field-sizing-content flex min-h-16 w-full rounded-md border border-border/30 bg-transparent px-3 py-2 text-base shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
 error &&"border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50",
 className
 )}
 ref={ref}
 aria-invalid={error ?"true" : undefined}
 {...props}
 />
 )
 }
)
Textarea.displayName = 'Textarea'

export { Textarea, Textarea as TextareaV2 }
