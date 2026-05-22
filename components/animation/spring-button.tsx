"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Binance Trading Terminal: simple fast press feedback only. No magnetic cursor tracking (perf + calm)

interface SpringButtonProps {
  className?: string
  variant?:"default" |"error" |"outline" |"secondary" |"ghost" |"link" |"mono"
  size?:"default" |"sm" |"lg" |"icon"
  children: React.ReactNode
  disabled?: boolean
  type?:"button" |"submit" |"reset"
  onClick?: () => void
}

export function SpringButton({
  className,
  variant ="default",
  size ="default",
  children,
  disabled,
  type ="button",
  onClick,
}: SpringButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={onClick}
      disabled={disabled}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.button>
  )
}

// ============================================================================
// RippleButton now uses simple press (Binance: no decorative ripple)
// ============================================================================

interface RippleButtonProps {
  className?: string
  variant?:"default" |"error" |"outline" |"secondary" |"ghost" |"link" |"mono"
  size?:"default" |"sm" |"lg" |"icon"
  children: React.ReactNode
  disabled?: boolean
  type?:"button" |"submit" |"reset"
  onClick?: () => void
}

export function RippleButton(props: RippleButtonProps) {
  // Simplified to standard press for trading terminal calm & perf
  return <SpringButton {...props} />
}

// GlowButton deprecated — use standard Button with binance transitions
interface GlowButtonProps {
 className?: string
 variant?:"default" |"error" |"outline" |"secondary" |"ghost" |"link" |"mono"
 size?:"default" |"sm" |"lg" |"icon"
 children: React.ReactNode
 disabled?: boolean
 type?:"button" |"submit" |"reset"
 onClick?: () => void
 glowColor?: string
}

// GlowButton now alias to SpringButton (no glow — Binance calm)
export function GlowButton(props: GlowButtonProps) {
  return <SpringButton {...props} />
}

// ============================================================================
// IconButton variants
// ============================================================================

interface AnimatedIconButtonProps {
 className?: string
 children: React.ReactNode
 disabled?: boolean
 onClick?: () => void
}

export function SpringIconButton({ className, children, disabled, onClick }: AnimatedIconButtonProps) {
 const prefersReducedMotion = useReducedMotion()

 return (
 <SpringButton
 className={cn("h-10 w-10 rounded-full p-0", className)}
 size="icon"
 disabled={disabled}
 onClick={onClick}
 >
 <motion.span
 whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
 whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
 >
 {children}
 </motion.span>
 </SpringButton>
 )
}

export function GlowIconButton({ className, children, disabled, onClick }: AnimatedIconButtonProps) {
  return (
    <SpringButton
      className={cn("h-10 w-10 rounded-full p-0", className)}
      size="icon"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </SpringButton>
  )
}
