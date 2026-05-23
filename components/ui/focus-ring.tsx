"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FocusRingProps extends React.HTMLAttributes<HTMLDivElement> {
 children: React.ReactNode
 className?: string
}

export const FocusRing = React.forwardRef<HTMLDivElement, FocusRingProps>(
 ({ children, className, ...props }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("focus-visible:outline-none","focus-visible:ring-2 focus-visible:ring-ring","focus-visible:ring-offset-2 focus-visible:ring-offset-background",
 className
 )}
 {...props}
 >
 {children}
 </div>
 )
 }
)
FocusRing.displayName ="FocusRing"
