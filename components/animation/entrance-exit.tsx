"use client"
import React from 'react'

import { useRef, useEffect, useState } from "react"
import { motion, useReducedMotion, useInView, AnimatePresence } from "motion/react"
import {
  SPRING_SUBTLE,
  SPRING_SNAPPY,
  SPRING_GENTLE,
  MOTION_EASE,
} from "./enhanced-motion"

export type VariantType = 'fade' | 'slide' | 'scale' | 'bounce' | 'blur'
export type SlideDirection = 'up' | 'down' | 'left' | 'right'

export const SPRING_PRESETS = {
  gentle: SPRING_SUBTLE,
  snappy: SPRING_SNAPPY,
  subtle: SPRING_SUBTLE,
  responsive: SPRING_GENTLE,
} as const

const getSlideVariants = (direction: SlideDirection) => {
  const distance = 6
  const variants: Record<SlideDirection, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }
  return variants[direction]
}

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

export function AnimateIn({
  children,
  variant ="fade",
  direction ="up",
  delay = 0,
  duration = 0.5,
  className,
  triggerOnScroll = false,
  staggerChildren = false,
  staggerDelay = 0.08,
}: AnimateInProps) {
 const prefersReducedMotion = useReducedMotion()
 const ref = useRef<HTMLDivElement>(null)
 const isInView = useInView(ref, { once: true, margin:"-5%" })

 const shouldAnimate = triggerOnScroll ? isInView : true

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, ...getSlideVariants(direction) },
      visible: { opacity: 1, x: 0, y: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
    },
    bounce: {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
    },
    blur: {
      hidden: { opacity: 0, y: 3, scale: 0.995 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
  }

  const transition = prefersReducedMotion
  ? {}
  : variant ==="bounce"
   ? SPRING_PRESETS.snappy
   : variant === 'blur'
     ? { duration: 0.3, delay, ease: MOTION_EASE.snappy }
     : { duration, delay, ease: MOTION_EASE.snappy }

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
  }

  return (
  <motion.div
  ref={ref}
  className={className}
  initial="hidden"
  animate={shouldAnimate ?"visible" :"hidden"}
  variants={{ ...variants[variant], ...staggerConfig }}
  transition={transition}
  >
  {children}
  </motion.div>
  )
}

interface AnimateInItemProps {
  children: React.ReactNode
  variant?: VariantType
  direction?: SlideDirection
  duration?: number
  className?: string
}

export function AnimateInItem({
  children,
  variant ="fade",
  direction ="up",
  duration = 0.4,
  className,
}: AnimateInItemProps) {
  const prefersReducedMotion = useReducedMotion()

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, ...getSlideVariants(direction) },
      visible: { opacity: 1, x: 0, y: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
    },
    bounce: {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
    },
    blur: {
      hidden: { opacity: 0, y: 3, scale: 0.995 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
  }

 const transition = prefersReducedMotion
 ? {}
 : variant ==="bounce"
  ? SPRING_PRESETS.snappy
  : variant === 'blur'
    ? { duration: 0.3, ease: MOTION_EASE.snappy }
    : { duration, ease: MOTION_EASE.snappy }

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 variants={variants[variant]}
 transition={transition}
 >
 {children}
 </motion.div>
 )
}

interface AnimateOutProps {
 children: React.ReactNode
 isShown: boolean
 variant?:"fade" |"slide" |"scale"
 direction?: SlideDirection
 duration?: number
 className?: string
 onAnimationComplete?: () => void
}

export function AnimateOut({
 children,
 isShown,
 variant ="fade",
 direction ="up",
 duration = 0.3,
 className,
 onAnimationComplete,
}: AnimateOutProps) {
 const prefersReducedMotion = useReducedMotion()

 const variants = {
 fade: {
 visible: { opacity: 1 },
 hidden: { opacity: 0 },
 },
 slide: {
 visible: { opacity: 1, x: 0, y: 0 },
 hidden: { opacity: 0, ...getSlideVariants(direction) },
 },
 scale: {
 visible: { opacity: 1, scale: 1 },
 hidden: { opacity: 0, scale: 0.9 },
 },
 }

 if (prefersReducedMotion) {
 return isShown ? <div className={className}>{children}</div> : null
 }

 return (
 <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
 {isShown && (
 <motion.div
 className={className}
 initial="hidden"
 animate="visible"
 exit="hidden"
 variants={variants[variant]}
 transition={{ duration, ease: MOTION_EASE.snappy }}
 >
 {children}
 </motion.div>
 )}
 </AnimatePresence>
 )
}

interface LazyInProps {
 children: React.ReactNode
 delay?: number
 duration?: number
 className?: string
}

export function LazyIn({
 children,
 delay = 0.1,
 duration = 0.6,
 className,
}: LazyInProps) {
 const prefersReducedMotion = useReducedMotion()
 const [isVisible, setIsVisible] = useState(false)
 const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

 useEffect(() => {
 if (prefersReducedMotion) {
  queueMicrotask(() => setIsVisible(true))
 return
 }

 timerRef.current = setTimeout(() => setIsVisible(true), delay * 1000)
 return () => {
  if (timerRef.current) clearTimeout(timerRef.current)
 }
 }, [delay, prefersReducedMotion])

 if (prefersReducedMotion || isVisible) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration, ease: MOTION_EASE.snappy }}
 >
 {children}
 </motion.div>
 )
}
