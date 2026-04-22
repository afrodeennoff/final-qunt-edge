"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
 React.ElementRef<typeof CheckboxPrimitive.Root>,
 React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
 <CheckboxPrimitive.Root
 ref={ref}
 data-slot="checkbox"
 className={cn("peer h-11 w-11 shrink-0 rounded-sm border border-border/40 shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-v2-accent data-[state=checked]:text-v2-bg-base data-[state=checked]:border-v2-accent",
 className
 )}
 {...props}
 >
 <CheckboxPrimitive.Indicator
 className={cn("flex items-center justify-center text-current")}
 >
 <Check className="h-4 w-4" />
 </CheckboxPrimitive.Indicator>
 </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
