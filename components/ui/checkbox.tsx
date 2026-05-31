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
 className={cn("peer h-11 w-11 shrink-0 rounded-sm border-0 shadow-none transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary active:scale-[0.92]",
 className
 )}
 {...props}
 >
 <CheckboxPrimitive.Indicator
 className={cn("flex items-center justify-center text-current transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:scale-100 data-[state=unchecked]:scale-0")}
 >
 <Check className="h-3 w-3" />
 </CheckboxPrimitive.Indicator>
 </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
