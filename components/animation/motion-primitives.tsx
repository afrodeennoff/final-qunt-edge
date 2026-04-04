import { useReducedMotionValue } from "@/context/reduced-motion-context"
"use client"

import { cn } from "@/lib/utils"
import { motion } from "motion/react"
type MotionPrimitiveProps = {
  children: React.ReactNode
  className?: string
}
const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const MOTION_FAST = 0.4
const MOTION_BASE = 0.55
export function MotionPage({ children, className }: MotionPrimitiveProps) {
  const prefersReducedMotion = useReducedMotionValue()
  return (
    <motion.div
      className={cn("w-full", className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      transition={{ duration: MOTION_FAST, ease: MOTION_EASE }}
    >
      {children}
    </motion.div>
  )
export function MotionSection({ children, className }: MotionPrimitiveProps) {
    <motion.section
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
    </motion.section>
export function MotionStagger({ children, className }: MotionPrimitiveProps) {
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? undefined : "show"}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
          },
        },
      }}
export function MotionStaggerItem({ children, className }: MotionPrimitiveProps) {
        hidden: prefersReducedMotion ? {} : { opacity: 0, y: 18, scale: 0.98 },
        show: prefersReducedMotion
          ? {}
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.42, ease: MOTION_EASE },
            },
