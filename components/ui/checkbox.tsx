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
 className={cn("peer h-[16px] w-[16px] shrink-0 rounded-[4px] border border-[oklch(0.65_0.22_260_/_0.14)] shadow-none transition-[background-color,border-color,box-shadow] duration-130 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.22_260_/_0.22)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary active:scale-[0.95]",
 className
 )}
 {...props}
 >
 <CheckboxPrimitive.Indicator
 className={cn("flex items-center justify-center text-current")}
 >
 <Check className="h-3 w-3" />
 </CheckboxPrimitive.Indicator>
 </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
