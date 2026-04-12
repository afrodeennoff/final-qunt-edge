import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, error, ...props }, ref) => {
 return (
 <textarea
 className={cn("field-sizing-content flex min-h-16 w-full rounded-md border border-white/[0.06] bg-transparent px-3 py-2 text-base shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-v2-accent focus-visible:ring-2 focus-visible:ring-v2-accent/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
 error &&"border-v2-error focus-visible:border-v2-error focus-visible:ring-v2-error/50",
 className
 )}
 ref={ref}
 aria-invalid={error ?"true" : undefined}
 {...props}
 />
 )
 }
)
Textarea.displayName ="Textarea"

export { Textarea, Textarea as TextareaV2 }
