'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, orientation = 'horizontal', ...props }, ref) => (
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
      'inline-flex min-h-10 items-center justify-center rounded-lg border border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.052_0.009_260_/_0.72)] p-1 text-muted-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)]',
      className,
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
      'type-label inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 ring-offset-background transition-[background-color,color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.65_0.22_260_/_0.22)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-[oklch(0.65_0.22_260_/_0.09)] data-[state=active]:bg-[oklch(0.65_0.22_260_/_0.12)] data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05)] hover:bg-[oklch(0.052_0.009_260_/_0.64)] hover:text-foreground',
      className,
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
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
