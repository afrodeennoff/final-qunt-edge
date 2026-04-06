"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const SPRING_GENTLE = { type: "spring" as const, stiffness: 300, damping: 20 }

// ============================================================================
// SpringButton - Button with magnetic hover effect
// ============================================================================

interface SpringButtonProps {
  className?: string
  variant?: "default" | "error" | "outline" | "secondary" | "ghost" | "link" | "mono"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
}

export function SpringButton({
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
  type = "button",
  onClick,
}: SpringButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const maxDistance = 8
    const distanceX = Math.min(Math.max(mouseX / 4, -maxDistance), maxDistance)
    const distanceY = Math.min(Math.max(mouseY / 4, -maxDistance), maxDistance)

    setPosition({ x: distanceX, y: distanceY })
  }, [prefersReducedMotion])

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), "relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      animate={{
        x: position.x,
        y: position.y,
        transition: prefersReducedMotion ? {} : SPRING_GENTLE,
      }}
    >
      {children}
    </motion.button>
  )
}

// ============================================================================
// RippleButton - Button with ripple animation on click
// ============================================================================

interface RippleButtonProps {
  className?: string
  variant?: "default" | "error" | "outline" | "secondary" | "ghost" | "link" | "mono"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
}

interface Ripple {
  x: number
  y: number
  id: number
}

export function RippleButton({
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
  type = "button",
  onClick,
}: RippleButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const rippleX = e.clientX - rect.left
    const rippleY = e.clientY - rect.top
    const newRipple: Ripple = { x: rippleX, y: rippleY, id: Date.now() }

    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)

    onClick?.()
  }, [prefersReducedMotion, disabled, onClick])

  return (
    <button
      type={type}
      className={cn(
        buttonVariants({ variant, size }),
        "relative overflow-hidden",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {!prefersReducedMotion &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-primary-foreground/30 animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: "translate(-50%, -50%) scale(0)",
            }}
          />
        ))}
    </button>
  )
}

// ============================================================================
// GlowButton - Button with animated glow effect on hover
// ============================================================================

interface GlowButtonProps {
  className?: string
  variant?: "default" | "error" | "outline" | "secondary" | "ghost" | "link" | "mono"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  glowColor?: string
}

export function GlowButton({
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
  type = "button",
  onClick,
  glowColor = "rgba(255, 255, 255, 0.25)",
}: GlowButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      className={cn(buttonVariants({ variant, size }), "relative", className)}
      onClick={onClick}
      disabled={disabled}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      <motion.span
        className="absolute inset-0 rounded-md"
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        whileHover={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.2 }}
        style={{
          background: glowColor,
          filter: "blur(12px)",
          zIndex: -1,
        }}
      />
      {children}
    </motion.button>
  )
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
    <GlowButton
      className={cn("h-10 w-10 rounded-full p-0", className)}
      size="icon"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </GlowButton>
  )
}
