"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/theme/focus"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
 React.ElementRef<typeof AccordionPrimitive.Item>,
 React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
 <AccordionPrimitive.Item
 ref={ref}
 data-slot="accordion-item"
 className={cn("border-b border-transparent", className)}
 {...props}
 />
))
AccordionItem.displayName ="AccordionItem"

const AccordionTrigger = React.forwardRef<
 React.ElementRef<typeof AccordionPrimitive.Trigger>,
 React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
 <AccordionPrimitive.Header className="flex">
 <AccordionPrimitive.Trigger
 ref={ref}
 data-slot="accordion-trigger"
 className={cn("type-body-sm flex flex-1 items-center justify-between rounded-lg px-2 py-3 text-foreground/80 transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-muted hover:text-foreground [&[data-state=open]>svg]:rotate-180", FOCUS_RING.standard,
 className
 )}
 {...props}
 >
 {children}
 <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
 </AccordionPrimitive.Trigger>
 </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
 React.ElementRef<typeof AccordionPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
 <AccordionPrimitive.Content
 ref={ref}
 data-slot="accordion-content"
 className="overflow-hidden type-body-sm text-muted-foreground transition-[opacity] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
 {...props}
 >
 <div className={cn("pb-4 pt-0", className)}>{children}</div>
 </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
