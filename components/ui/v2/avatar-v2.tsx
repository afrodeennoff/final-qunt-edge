"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarV2Variants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-v2-border",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarV2Props extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarV2Variants> {}

const AvatarV2 = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarV2Props>(
  ({ className, size, ...props }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarV2Variants({ size }), className)}
      {...props}
    />
  )
)
AvatarV2.displayName = AvatarPrimitive.Root.displayName

export type AvatarV2ImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>

const AvatarV2Image = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, AvatarV2ImageProps>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
)
AvatarV2Image.displayName = AvatarPrimitive.Image.displayName

export type AvatarV2FallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>

const AvatarV2Fallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, AvatarV2FallbackProps>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-v2-bg-elevated text-v2-text-secondary font-medium",
        className
      )}
      {...props}
    />
  )
)
AvatarV2Fallback.displayName = AvatarPrimitive.Fallback.displayName

export { AvatarV2, AvatarV2Image, AvatarV2Fallback, avatarV2Variants }
