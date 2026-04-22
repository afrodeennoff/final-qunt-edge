'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const portalContainer = document.getElementById('tooltip-portal')
  if (!portalContainer) return null

  return createPortal(
    <TooltipPrimitive.Content
      ref={ref}
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        'type-body-sm z-9999 overflow-hidden rounded-xl border border-[oklch(0.65_0.22_260_/_0.07)] bg-[linear-gradient(180deg,oklch(0.062_0.01_260_/_0.96)_0%,oklch(0.05_0.009_260_/_0.92)_100%)] px-3 py-2 text-popover-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_18px_34px_-26px_rgba(0,0,0,0.82)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />,
    portalContainer,
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
