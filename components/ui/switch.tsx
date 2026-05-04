"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
 React.ElementRef<typeof SwitchPrimitives.Root>,
 React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
 <SwitchPrimitives.Root
 data-slot="switch"
 className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-[background-color,box-shadow] duration-130 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted active:scale-[0.97]",
 className
 )}
 {...props}
 ref={ref}
 >
 <SwitchPrimitives.Thumb
 className={cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-[0_1px_2px_rgba(0,0,0,0.3)] ring-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
 )}
 />
 </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
