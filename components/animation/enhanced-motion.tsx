"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { motion, useReducedMotion, useInView, useSpring, Variants } from "motion/react"
import { cn } from "@/lib/utils"

// Binance Trading Terminal — minimal, fast, professional motion
export const SPRING_SUBTLE = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.8 }
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 400, damping: 38, mass: 0.7 }

// ============================================================================
// Binance motion tokens (fast, data-focused, calm)
// ============================================================================

export const MOTION_DURATION = {
  instant: 60,
  fast: 100,
  normal: 160,
  slow: 220,
} as const

export const MOTION_EASE = {
  snappy: [0.16, 1, 0.3, 1] as const,
  subtle: [0.22, 1, 0.36, 1] as const,
  default: [0.25, 0.46, 0.45, 0.94] as const,
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
// Minimal Binance entrance variants (tiny offset, fast, calm)
// ============================================================================

const BINANCE_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: MOTION_EASE.snappy }
  }
}

export const blurIn: Variants = {
  hidden: { opacity: 0, y: 3, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.14, ease: MOTION_EASE.snappy },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_SUBTLE,
  },
}

// ============================================================================
// MotionSection - Section wrapper with scroll-triggered entrance animation
// ============================================================================

interface MotionSectionProps {
 children: React.ReactNode
 className?: string
 delay?: number
  spring?: typeof SPRING_SUBTLE
 threshold?: number
}

export function MotionSection({
  children,
  className,
  delay = 0,
  spring = SPRING_SUBTLE,
  threshold = 0.05,
}: MotionSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true, amount: threshold })

  if (prefersReducedMotion) {
    return <section className={className}>{children}</section>
  }

  return (
    <motion.section
      ref={ref}
      className={cn('animate-binance-reveal', className)}
      initial={false}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.16,
        delay,
        ease: MOTION_EASE.snappy,
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

  return (
    <motion.div
      ref={ref}
      className={cn('animate-binance-reveal', className)}
      initial={false}
      animate={isInView ? "visible" : undefined}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: clampedDelay * staggerSpeed,
            delayChildren: 0.04,
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
          ? BINANCE_ENTRANCE
          : {
              hidden: { opacity: 0, y: 3 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.14,
                  ease: MOTION_EASE.snappy,
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
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION_DURATION.fast / 1000,
        delay: delay / 1000,
        ease: MOTION_EASE.snappy
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

  const spring = useSpring(0, { stiffness: 280, damping: 32 })
 const [displayValue, setDisplayValue] = useState("0")

 const formatter = useMemo(
   () => new Intl.NumberFormat("en-US", {
     minimumFractionDigits: decimals,
     maximumFractionDigits: decimals,
     ...formatOptions,
   }),
   [decimals, formatOptions]
 )

 useEffect(() => {
 if (!isInView || prefersReducedMotion) return

 spring.set(target)

 const unsubscribe = spring.on("change", (latest) => {
 setDisplayValue(formatter.format(latest))
 })

 return () => {
 unsubscribe()
 }
 }, [target, isInView, spring, prefersReducedMotion, formatter])

 const formatted = formatter.format(target)

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
  { size: 300, x:"10%", y:"20%", duration: 20, delay: 0, opacity: 0.15, color:"from-primary/30 to-primary/20" },
  { size: 400, x:"70%", y:"10%", duration: 25, delay: 5, opacity: 0.12, color:"from-primary/20 to-primary/15" },
  { size: 250, x:"30%", y:"60%", duration: 18, delay: 2, opacity: 0.18, color:"from-primary/25 to-primary/18" },
  { size: 350, x:"80%", y:"50%", duration: 22, delay: 8, opacity: 0.1, color:"from-primary/20 to-primary/12" },
  { size: 200, x:"50%", y:"80%", duration: 16, delay: 3, opacity: 0.14, color:"from-primary/22 to-primary/15" },
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
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-b"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: orb.opacity,
            scale: [1, 1.08, 1],
            x: [0, 15, -10, 8, 0],
            y: [0, -12, 8, -5, 0],
          }}
          transition={{
            opacity: { duration: 1.5, delay: i * 0.3 },
            scale: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
            x: { duration: orb.duration * 0.7, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
            y: { duration: orb.duration * 0.85, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              filter: 'blur(60px)',
              background: 'inherit',
            }}
          />
        </motion.div>
      ))}
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
