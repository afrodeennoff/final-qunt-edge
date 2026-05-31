"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
 React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
 React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
 <CollapsiblePrimitive.CollapsibleTrigger
 ref={ref}
 data-slot="collapsible-trigger"
 className={className}
 {...props}
 />
))
CollapsibleTrigger.displayName ="CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
 React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
 React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
 <CollapsiblePrimitive.CollapsibleContent
 ref={ref}
 data-slot="collapsible-content"
 className={cn(
   'overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
   className
 )}
 {...props}
 />
))
CollapsibleContent.displayName ="CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
