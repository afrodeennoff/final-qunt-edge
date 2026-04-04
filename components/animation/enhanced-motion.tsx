import { useReducedMotionValue } from "@/context/reduced-motion-context"
"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView, useSpring } from "motion/react"
import { cn } from "@/lib/utils"
const SPRING_GENTLE = { type: "spring" as const, stiffness: 300, damping: 20 }
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 15 }
const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const
// ============================================================================
// MotionSection - Section wrapper with scroll-triggered entrance animation
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
  threshold = 0.1,
}: MotionSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotionValue()
  const isInView = useInView(ref, { once: true, amount: threshold })
  if (prefersReducedMotion) {
    return <section className={className}>{children}</section>
  }
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        delay,
        ease: ENTRANCE_EASE,
        ...spring,
      }}
    >
      {children}
    </motion.section>
  )
// MotionStagger - Staggered children animation container
interface MotionStaggerProps {
  delay?: number // Base delay between items (0.05 - 0.15)
  staggerSpeed?: number // Multiplier for stagger delay
export function MotionStagger({
  delay = 0.08,
  staggerSpeed = 1,
}: MotionStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })
  const clampedDelay = Math.max(0.05, Math.min(0.15, delay))
    return <div className={className}>{children}</div>
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: clampedDelay * staggerSpeed,
            delayChildren: 0.1,
          },
        },
    </motion.div>
// MotionStaggerItem - Individual staggered item
interface MotionStaggerItemProps {
export function MotionStaggerItem({ children, className }: MotionStaggerItemProps) {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
          y: 0,
          scale: 1,
            duration: 0.5,
            ease: ENTRANCE_EASE,
// AnimatedCounter - Number counting animation with prefix/suffix
interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
  formatOptions?: Intl.NumberFormatOptions
export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatOptions,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
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
    <span ref={ref} className={className}>
      {prefix}
      {prefersReducedMotion || !isInView ? formatted : displayValue}
      {suffix}
    </span>
// FloatingOrbs - Continuous floating background orbs with parallax
interface OrbConfig {
  size: number
  x: string // CSS position
  y: string
  duration: number
  delay: number
  opacity: number
  color: string
const DEFAULT_ORBS: OrbConfig[] = [
  { size: 300, x: "10%", y: "20%", duration: 20, delay: 0, opacity: 0.15, color: "from-blue-500/30 to-purple-500/30" },
  { size: 400, x: "70%", y: "10%", duration: 25, delay: 5, opacity: 0.12, color: "from-cyan-500/20 to-teal-500/20" },
  { size: 250, x: "30%", y: "60%", duration: 18, delay: 2, opacity: 0.18, color: "from-indigo-500/25 to-violet-500/25" },
  { size: 350, x: "80%", y: "50%", duration: 22, delay: 8, opacity: 0.1, color: "from-emerald-500/20 to-green-500/20" },
  { size: 200, x: "50%", y: "80%", duration: 16, delay: 3, opacity: 0.14, color: "from-orange-500/25 to-amber-500/25" },
]
interface FloatingOrbsProps {
  orbs?: OrbConfig[]
  enableParallax?: boolean
  blobCount?: number
export function FloatingOrbs({
  orbs = DEFAULT_ORBS,
  enableParallax = true,
}: FloatingOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    if (!enableParallax || prefersReducedMotion) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setMousePosition({ x, y })
    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
  }, [enableParallax, prefersReducedMotion])
    return null
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {orbs.map((orb, index) => {
        const parallaxX = enableParallax ? mousePosition.x * 20 * (index + 1) : 0
        const parallaxY = enableParallax ? mousePosition.y * 20 * (index + 1) : 0
        return (
          <motion.div
            key={index}
            className={cn("absolute rounded-full blur-3xl", orb.color)}
            animate={{
              x: [0, 30 + index * 10, -20 - index * 5, 0 + parallaxX],
              y: [0, -20 - index * 8, 30 + index * 12, 0 + parallaxY],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              opacity: orb.opacity,
          />
        )
      })}
    </div>
// Utility hook for reduced motion
/**
 * Hook to check if user prefers reduced motion
 * Returns true if prefers-reduced-motion is set
 */
export function usePrefersReducedMotion() {
  return useReducedMotionValue()
