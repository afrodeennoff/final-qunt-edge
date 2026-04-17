"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useReducedMotion, useInView, useSpring, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

export const SPRING_GENTLE = { type:"spring" as const, stiffness: 300, damping: 20 }
export const SPRING_BOUNCY = { type:"spring" as const, stiffness: 400, damping: 15 }

// ============================================================================
// StyleSeed motion tokens
// ============================================================================

export const MOTION_DURATION = {
 fast: 100, // --duration-fast: hover, color changes
 normal: 200, // --duration-normal: enter animations, expand
 slow: 350, // --duration-slow: page transitions, spring
} as const

export const MOTION_EASE = {
 default: [0.4, 0, 0.2, 1] as const,
 spring: [0.22, 1, 0.36, 1] as const,
 entrance: [0.16, 1, 0.3, 1] as const,
 bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const

export const STAGED_REVEAL_CLASS_NAMES = [
  'animate-fade-up-smooth-d1',
  'animate-fade-up-smooth-d2',
  'animate-fade-up-smooth-d3',
  'animate-fade-up-smooth-d4',
] as const

export function getStagedRevealClassName(stage = 0) {
  return STAGED_REVEAL_CLASS_NAMES[Math.max(0, Math.min(stage, STAGED_REVEAL_CLASS_NAMES.length - 1))]
}

// ============================================================================
// BLUR_ENTRANCE variant
// ============================================================================

const BLUR_ENTRANCE: Variants = {
 hidden: { opacity: 0, y: 24 },
 show: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.9, ease: MOTION_EASE.spring }
 }
}

export const blurIn: Variants = {
 hidden: {
 opacity: 0,
 scale: 0.95,
 },
 visible: {
 opacity: 1,
 scale: 1,
 transition: {
 duration: 0.5,
 ease: MOTION_EASE.entrance as unknown as number[],
 },
 },
}

export const scaleIn: Variants = {
 hidden: {
 opacity: 0,
 scale: 0.8,
 },
 visible: {
 opacity: 1,
 scale: 1,
 transition: SPRING_GENTLE,
 },
}

// ============================================================================
// MotionSection - Section wrapper with scroll-triggered entrance animation
// ============================================================================

interface MotionSectionProps {
 children: React.ReactNode
 className?: string
 delay?: number
 spring?: typeof SPRING_GENTLE
 threshold?: number
}

export function MotionSection({
 children,
 className,
 delay = 0,
 spring = SPRING_GENTLE,
 threshold = 0.05,
}: MotionSectionProps) {
 const ref = useRef<HTMLElement>(null)
 const prefersReducedMotion = useReducedMotion()
 const isInView = useInView(ref, { once: true, amount: threshold })

 if (prefersReducedMotion) {
 return <section className={className}>{children}</section>
 }

 // CSS animation handles entrance — content is always visible even if FM never hydrates.
 // initial={false} prevents FM from setting inline opacity:0 which causes blank pages.
 return (
 <motion.section
 ref={ref}
 className={cn('animate-fade-up-smooth', className)}
 initial={false}
 animate={isInView ? { opacity: 1, y: 0 } : undefined}
 transition={{
 duration: 0.5,
 delay,
 ease: [0.22, 1, 0.36, 1],
 ...spring,
 }}
 >
 {children}
 </motion.section>
 )
}

// ============================================================================
// MotionStagger - Staggered children animation container
// ============================================================================

interface MotionStaggerProps {
 children: React.ReactNode
 className?: string
 delay?: number // Base delay between items (0.05 - 0.15)
 staggerSpeed?: number // Multiplier for stagger delay
}

export function MotionStagger({
 children,
 className,
 delay = 0.08,
 staggerSpeed = 1,
}: MotionStaggerProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLDivElement>(null)
 const isInView = useInView(ref, { once: true, margin:"-5%" })

 const clampedDelay = Math.max(0.05, Math.min(0.15, delay))

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 // CSS entrance instead of FM initial — content always visible
 return (
 <motion.div
 ref={ref}
 className={cn('animate-fade-up-smooth', className)}
 initial={false}
 animate={isInView ? "visible" : undefined}
 variants={{
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: clampedDelay * staggerSpeed,
 delayChildren: 0.1,
 },
 },
 }}
 >
 {children}
 </motion.div>
 )
}

// ============================================================================
// MotionStaggerItem - Individual staggered item
// ============================================================================

interface MotionStaggerItemProps {
 children: React.ReactNode
 className?: string
 blur?: boolean
}

export function MotionStaggerItem({ children, className, blur = false }: MotionStaggerItemProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 variants={
 blur
 ? BLUR_ENTRANCE
 : {
 hidden: { opacity: 0, y: 10, scale: 0.99 },
 visible: {
 opacity: 1,
 y: 0,
 scale: 1,
 transition: {
 duration: 0.45,
 ease: [0.22, 1, 0.36, 1],
 },
 },
 }
 }
 >
 {children}
 </motion.div>
 )
}

interface MotionOrchestratedProps {
 children: React.ReactNode
 className?: string
 staggerDelay?: number
}

export function MotionOrchestrated({
 children,
 className,
 staggerDelay = 0.08,
}: MotionOrchestratedProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLDivElement>(null)
 const isInView = useInView(ref, { once: true, margin:"-5%" })

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 // CSS entrance instead of FM initial — content always visible
 return (
 <motion.div
 ref={ref}
 className={cn('animate-fade-up-smooth', className)}
 initial={false}
 animate={isInView ? "visible" : undefined}
 variants={{
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: staggerDelay,
 delayChildren: 0.1,
 },
 },
 }}
 >
 {children}
 </motion.div>
 )
}

// ============================================================================
// MotionPhrase - Phrase-level text reveal animation
// ============================================================================

interface MotionPhraseProps {
 children: React.ReactNode
 className?: string
 delay?: number
}

export function MotionPhrase({ children, className, delay = 0 }: MotionPhraseProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <span className={className}>{children}</span>
 }

 return (
 <motion.span
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{
 duration: MOTION_DURATION.slow / 1000,
 delay: delay / 1000,
 ease: MOTION_EASE.entrance
 }}
 className={className}
 >
 {children}
 </motion.span>
 )
}

// ============================================================================
// AnimatedCounter - Number counting animation with prefix/suffix
// ============================================================================

interface AnimatedCounterProps {
 target: number
 className?: string
 prefix?: string
 suffix?: string
 decimals?: number
 formatOptions?: Intl.NumberFormatOptions
}

export function AnimatedCounter({
 target,
 className,
 prefix ="",
 suffix ="",
 decimals = 0,
 formatOptions,
}: AnimatedCounterProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLSpanElement>(null)
 const isInView = useInView(ref, { once: true, margin:"-10%" })

 const spring = useSpring(0, { stiffness: 100, damping: 30 })
 const [displayValue, setDisplayValue] = useState("0")

 useEffect(() => {
 if (!isInView || prefersReducedMotion) return

 spring.set(target)

 const unsubscribe = spring.on("change", (latest) => {
 const formatted = new Intl.NumberFormat("en-US", {
 minimumFractionDigits: decimals,
 maximumFractionDigits: decimals,
 ...formatOptions,
 }).format(latest)

 setDisplayValue(formatted)
 })

 return () => {
 unsubscribe()
 }
 }, [target, decimals, formatOptions, isInView, spring, prefersReducedMotion])

 const formatted = new Intl.NumberFormat("en-US", {
 minimumFractionDigits: decimals,
 maximumFractionDigits: decimals,
 ...formatOptions,
 }).format(prefersReducedMotion || !isInView ? target : target)

 return (
 <span ref={ref} className={className}>
 {prefix}
 {prefersReducedMotion || !isInView ? formatted : displayValue}
 {suffix}
 </span>
 )
}

// ============================================================================
// FloatingOrbs - Continuous floating background orbs with parallax
// ============================================================================

interface OrbConfig {
 size: number
 x: string // CSS position
 y: string
 duration: number
 delay: number
 opacity: number
 color: string
}

const DEFAULT_ORBS: OrbConfig[] = [
 { size: 300, x:"10%", y:"20%", duration: 20, delay: 0, opacity: 0.15, color:"from-blue-500/30 to-purple-500/30" },
 { size: 400, x:"70%", y:"10%", duration: 25, delay: 5, opacity: 0.12, color:"from-cyan-500/20 to-teal-500/20" },
 { size: 250, x:"30%", y:"60%", duration: 18, delay: 2, opacity: 0.18, color:"from-indigo-500/25 to-violet-500/25" },
 { size: 350, x:"80%", y:"50%", duration: 22, delay: 8, opacity: 0.1, color:"from-emerald-500/20 to-green-500/20" },
 { size: 200, x:"50%", y:"80%", duration: 16, delay: 3, opacity: 0.14, color:"from-orange-500/25 to-amber-500/25" },
]

interface FloatingOrbsProps {
 className?: string
 orbs?: OrbConfig[]
 blobCount?: number
}

export function FloatingOrbs({
 className,
 orbs = DEFAULT_ORBS,
}: FloatingOrbsProps) {
 const prefersReducedMotion = useReducedMotion()
 const containerRef = useRef<HTMLDivElement>(null)

 if (prefersReducedMotion) {
 return null
 }

 return (
 <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
 {orbs.map((orb, index) => {
 return (
 <motion.div
 key={index}
 className={cn("absolute rounded-full blur-3xl", orb.color)}

 style={{
 width: orb.size,
 height: orb.size,
 left: orb.x,
 top: orb.y,
 opacity: orb.opacity,
 }}
 />
 )
 })}
 </div>
 )
}

// ============================================================================
// Utility hook for reduced motion
// ============================================================================

/**
 * Hook to check if user prefers reduced motion
 * Returns true if prefers-reduced-motion is set
 */
export function usePrefersReducedMotion() {
 return useReducedMotion()
}
