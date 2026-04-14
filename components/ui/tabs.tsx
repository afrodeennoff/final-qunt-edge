"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Root>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, orientation ="horizontal", ...props }, ref) => (
 <TabsPrimitive.Root
 ref={ref}
 data-slot="tabs"
 data-orientation={orientation}
 className={className}
 orientation={orientation}
 {...props}
 />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.List>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
 <TabsPrimitive.List
 ref={ref}
 data-slot="tabs-list"
 className={cn("inline-flex min-h-10 items-center justify-center rounded-lg border border-[rgba(232,206,150,0.14)] bg-[rgba(232,206,150,0.05)] p-1 text-muted-foreground shadow-[inset_0_1px_0_rgba(232,206,150,0.08)]",
 className
 )}
 {...props}
 />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Trigger>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
 <TabsPrimitive.Trigger
 ref={ref}
 data-slot="tabs-trigger"
 className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium ring-offset-background transition-[opacity,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[oklch(0.78_0.12_82/0.14)] data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_1px_0_rgba(232,206,150,0.10),0_2px_8px_-2px_rgba(0,0,0,0.3)] hover:bg-[oklch(0.78_0.12_82/0.08)] hover:text-foreground/80",
 className
 )}
 {...props}
 />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
 <TabsPrimitive.Content
 ref={ref}
 data-slot="tabs-content"
 className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 className
 )}
 {...props}
 />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
