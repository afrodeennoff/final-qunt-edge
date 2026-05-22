"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useReducedMotion, useMotionValue, useTransform, PanInfo } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PRESETS } from "./entrance-exit"

export { SPRING_PRESETS } from "./entrance-exit"

// Binance: only subtle scale or none. Lift/glow/magnetic removed (heavy/decorative)
export type HoverEffect = 'scale' | 'none'

interface InteractiveWrapperProps {
  children: React.ReactNode
  className?: string
  hover?: HoverEffect
  press?: boolean
  magnetic?: boolean
  draggable?: boolean
  onDragEnd?: () => void
  glowColor?: string
}

export function InteractiveWrapper({
 children,
 className,
 hover ="none",
 press = false,
 magnetic = false,
 draggable = false,
 onDragEnd,
 glowColor ="rgba(41, 98, 255, 0.25)",
}: InteractiveWrapperProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLDivElement>(null)
 const dragX = useMotionValue(0)
 const dragY = useMotionValue(0)


 const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
 if (prefersReducedMotion) return

 dragX.set(0)
 dragY.set(0)
 onDragEnd?.()
 }, [dragX, dragY, onDragEnd, prefersReducedMotion])

  const hoverVariants = {
    scale: {
      scale: 1.01,
      transition: { duration: 0.08, ease: [0.16, 1, 0.3, 1] as const },
    },
    none: {},
  }

  const pressVariants = {
    tap: {
      scale: 0.985,
      transition: { duration: 0.06, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 ref={ref}
 className={cn("relative", className)}
 drag={draggable}
 dragConstraints={draggable ? { left: -50, right: 50, top: -50, bottom: 50 } : false}
 dragElastic={draggable ? 0.1 : undefined}
 onDragEnd={handleDragEnd}
 style={
 magnetic
 ? undefined
 : draggable
 ? { x: dragX, y: dragY }
 : undefined
 }
 whileHover={hover !=="none" ? hoverVariants[hover] : undefined}
 whileTap={press ? pressVariants.tap : undefined}
  transition={magnetic || draggable ? SPRING_PRESETS.subtle : undefined}
 >
  {draggable && (
    <motion.div
      className="absolute inset-0 rounded-lg pointer-events-none"
      style={{
        background: glowColor,
        opacity: 0,
        zIndex: -1,
 }}
 animate={{ opacity: draggable ? 0.4 : 0 }}
 transition={{}}
 />
 )}
 {children}
 </motion.div>
 )
}

interface MagneticButtonProps {
 children: React.ReactNode
 className?: string
 onClick?: () => void
 disabled?: boolean
 strength?: number
}

export function MagneticButton({
 children,
 className,
 onClick,
 disabled,
 strength = 8,
}: MagneticButtonProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLButtonElement>(null)


 if (prefersReducedMotion) {
 return (
 <button className={className} onClick={onClick} disabled={disabled}>
 {children}
 </button>
 )
 }

 return (
 <motion.button
 ref={ref}
 className={className}
 onClick={onClick}
 disabled={disabled}
 
  transition={SPRING_PRESETS.subtle}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 {children}
 </motion.button>
 )
}

interface DraggableCardProps {
 children: React.ReactNode
 className?: string
 onDragEnd?: (offset: { x: number; y: number }) => void
 dragConstraints?: { left?: number; right?: number; top?: number; bottom?: number }
}

export function DraggableCard({
 children,
 className,
 onDragEnd,
 dragConstraints = { left: -100, right: 100, top: -50, bottom: 50 },
}: DraggableCardProps) {
 const prefersReducedMotion = useReducedMotion()
 const x = useMotionValue(0)
 const y = useMotionValue(0)

 const handleDragEnd = useCallback((_event: unknown, info: PanInfo) => {
 if (prefersReducedMotion) return

 onDragEnd?.({ x: info.offset.x, y: info.offset.y })
 }, [onDragEnd, prefersReducedMotion])

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 drag
 dragConstraints={dragConstraints}
 dragElastic={0.1}
 onDragEnd={handleDragEnd}
 style={{ x, y }}
 whileDrag={{ scale: 1.02, rotate: 1 }}
  transition={SPRING_PRESETS.subtle}
 >
 {children}
 </motion.div>
 )
}

interface HoverLiftProps {
 children: React.ReactNode
 className?: string
 liftDistance?: number
 shadowIntensity?: number
}

export function HoverLift({
 children,
 className,
 liftDistance = 8,
 shadowIntensity = 0.15,
}: HoverLiftProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 whileHover={{
 y: -liftDistance,
 boxShadow: `0 ${liftDistance + 12}px ${liftDistance + 20}px -${liftDistance + 8}px rgba(0, 0, 0, ${shadowIntensity})`,
 }}
 transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
 >
 {children}
 </motion.div>
 )
}

interface GlowOnHoverProps {
 children: React.ReactNode
 className?: string
 glowColor?: string
 glowSize?: number
}

export function GlowOnHover({
 children,
 className,
 glowColor ="rgba(41, 98, 255, 0.4)",
 glowSize = 20,
}: GlowOnHoverProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={cn("relative", className)}
 whileHover={{
 boxShadow: `0 0 ${glowSize}px -4px ${glowColor}`,
 }}
 transition={{ duration: 0.3 }}
 >
 {children}
 </motion.div>
 )
}
