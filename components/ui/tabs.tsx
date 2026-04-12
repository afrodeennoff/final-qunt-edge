"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
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
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-[hsl(var(--v2-border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--v2-bg-hover)/0.9),hsl(var(--v2-bg-surface)/0.9))] p-1 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
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
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-[hsl(var(--v2-border)/0.9)] data-[state=active]:bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/0.95),hsl(var(--v2-bg-hover)/0.92))] data-[state=active]:text-v2-text-primary data-[state=active]:shadow-[0_18px_40px_-26px_rgba(4,10,24,0.75)] hover:bg-[rgba(255,255,255,0.06)]",
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
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
