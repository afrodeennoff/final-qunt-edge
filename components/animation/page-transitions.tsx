"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PRESETS } from "./entrance-exit"

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export type TransitionType ="fade" |"slide" |"scale" |"fade-slide" |"scale-fade"
export type SlideDirection ="up" |"down" |"left" |"right"

interface PageTransitionProps {
 children: ReactNode
 className?: string
 type?: TransitionType
 direction?: SlideDirection
 duration?: number
 mode?:"wait" |"sync" |"popLayout"
}

export function PageTransition({
 children,
 className,
 type ="fade-slide",
 direction ="up",
 duration = 0.4,
 mode ="wait",
}: PageTransitionProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 const variants = {
 fade: {
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 },
 slide: {
 initial: { x: direction ==="left" ? 40 : direction ==="right" ? -40 : 0, y: direction ==="up" ? 40 : direction ==="down" ? -40 : 0 },
 animate: { x: 0, y: 0 },
 exit: { x: direction ==="left" ? -40 : direction ==="right" ? 40 : 0, y: direction ==="up" ? -40 : direction ==="down" ? 40 : 0 },
 },
 scale: {
 initial: { opacity: 0, scale: 0.95 },
 animate: { opacity: 1, scale: 1 },
 exit: { opacity: 0, scale: 0.95 },
 },"fade-slide": {
 initial: { opacity: 0, x: direction ==="left" ? 20 : direction ==="right" ? -20 : 0, y: direction ==="up" ? 20 : direction ==="down" ? -20 : 0 },
 animate: { opacity: 1, x: 0, y: 0 },
 exit: { opacity: 0, x: direction ==="left" ? -20 : direction ==="right" ? 20 : 0, y: direction ==="up" ? -20 : direction ==="down" ? 20 : 0 },
 },"scale-fade": {
 initial: { opacity: 0, scale: 0.98 },
 animate: { opacity: 1, scale: 1 },
 exit: { opacity: 0, scale: 0.98 },
 },
 }

 return (
 <AnimatePresence mode={mode}>
 <motion.div
 className={className}
 initial="initial"
 animate="animate"
 exit="exit"
 variants={variants[type]}
 transition={{ duration, ease: MOTION_EASE }}
 >
 {children}
 </motion.div>
 </AnimatePresence>
 )
}

interface StaggeredTransitionProps {
 children: ReactNode
 className?: string
 staggerDelay?: number
 delay?: number
}

export function StaggeredTransition({
 children,
 className,
 staggerDelay = 0.08,
 delay = 0,
}: StaggeredTransitionProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <AnimatePresence>
 <motion.div
 className={className}
 initial="hidden"
 animate="visible"
 exit="hidden"
 variants={{
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: staggerDelay,
 delayChildren: delay,
 },
 },
 }}
 >
 {children}
 </motion.div>
 </AnimatePresence>
 )
}

interface StaggeredItemProps {
 children: ReactNode
 className?: string
 delay?: number
}

export function StaggeredItem({ children, className, delay = 0 }: StaggeredItemProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { delay, duration: 0.4, ease: MOTION_EASE },
 },
 }}
 >
 {children}
 </motion.div>
 )
}

interface ModalTransitionProps {
 children: ReactNode
 isOpen: boolean
 className?: string
 onClose?: () => void
}

export function ModalTransition({ children, isOpen, className, onClose }: ModalTransitionProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return isOpen ? <div className={className}>{children}</div> : null
 }

 return (
 <AnimatePresence onExitComplete={onClose}>
 {isOpen && (
 <>
 <motion.div
 className="fixed inset-0 bg-background/80 z-50"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 />
 <motion.div
 className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 20 }}
 transition={SPRING_PRESETS.gentle}
 >
 {children}
 </motion.div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 )
}

interface RouteTransitionProps {
 children: ReactNode
 className?: string
}

export function RouteTransition({ children, className }: RouteTransitionProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3, ease: MOTION_EASE }}
 >
 {children}
 </motion.div>
 )
}

interface StaggeredViewProps {
 children: ReactNode
 className?: string
 staggerDelay?: number
}

export function StaggeredView({ children, className, staggerDelay = 0.06 }: StaggeredViewProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 initial="hidden"
 animate="visible"
 variants={{
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: staggerDelay,
 },
 },
 }}
 >
 {children}
 </motion.div>
 )
}

interface StaggeredViewItemProps {
 children: ReactNode
 className?: string
}

export function StaggeredViewItem({ children, className }: StaggeredViewItemProps) {
 const prefersReducedMotion = useReducedMotion()

 if (prefersReducedMotion) {
 return <div className={className}>{children}</div>
 }

 return (
 <motion.div
 className={className}
 variants={{
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.4, ease: MOTION_EASE },
 },
 }}
 >
 {children}
 </motion.div>
 )
}
