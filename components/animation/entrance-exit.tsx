import { useReducedMotionValue } from "@/context/reduced-motion-context"
"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
export type VariantType = "fade" | "slide" | "scale" | "bounce"
export type SlideDirection = "up" | "down" | "left" | "right"
export const SPRING_PRESETS = {
  gentle: { type: "spring" as const, stiffness: 300, damping: 20 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 15 },
  bouncy: { type: "spring" as const, stiffness: 350, damping: 10 },
  smooth: { type: "spring" as const, stiffness: 250, damping: 25 },
} as const
const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
interface AnimateInProps {
  children: React.ReactNode
  variant?: VariantType
  direction?: SlideDirection
  delay?: number
  duration?: number
  className?: string
  triggerOnScroll?: boolean
  staggerChildren?: boolean
  staggerDelay?: number
}
const getSlideVariants = (direction: SlideDirection) => {
  const distance = 40
  const variants: Record<SlideDirection, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }
  return variants[direction]
export function AnimateIn({
  children,
  variant = "fade",
  direction = "up",
  delay = 0,
  duration = 0.5,
  className,
  triggerOnScroll = false,
  staggerChildren = false,
  staggerDelay = 0.08,
}: AnimateInProps) {
  const prefersReducedMotion = useReducedMotionValue()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })
  const shouldAnimate = triggerOnScroll ? isInView : true
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, ...getSlideVariants(direction) },
      visible: { opacity: 1, x: 0, y: 0 },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    bounce: {
      hidden: { opacity: 0, scale: 0.3 },
  const transition = prefersReducedMotion
    ? {}
    : variant === "bounce"
    ? SPRING_PRESETS.bouncy
    : { duration, delay, ease: MOTION_EASE }
  const staggerConfig = staggerChildren
    ? {
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }
    : {}
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={{ ...variants[variant], ...staggerConfig }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
interface AnimateInItemProps {
export function AnimateInItem({
  duration = 0.4,
}: AnimateInItemProps) {
      hidden: { opacity: 0, scale: 0.95 },
    : { duration, ease: MOTION_EASE }
      variants={variants[variant]}
interface AnimateOutProps {
  isShown: boolean
  variant?: "fade" | "slide" | "scale"
  onAnimationComplete?: () => void
export function AnimateOut({
  isShown,
  duration = 0.3,
  onAnimationComplete,
}: AnimateOutProps) {
    return isShown ? <div className={className}>{children}</div> : null
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {isShown && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants[variant]}
          transition={{ duration, ease: MOTION_EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
interface LazyInProps {
export function LazyIn({
  delay = 0.1,
  duration = 0.6,
}: LazyInProps) {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay, prefersReducedMotion])
  if (prefersReducedMotion || isVisible) {
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, ease: MOTION_EASE }}
