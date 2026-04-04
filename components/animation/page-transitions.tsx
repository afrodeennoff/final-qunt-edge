import { useReducedMotionValue } from "@/context/reduced-motion-context"
"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PRESETS } from "./entrance-exit"
const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
export type TransitionType = "fade" | "slide" | "scale" | "fade-slide" | "scale-fade"
export type SlideDirection = "up" | "down" | "left" | "right"
interface PageTransitionProps {
  children: ReactNode
  className?: string
  type?: TransitionType
  direction?: SlideDirection
  duration?: number
  mode?: "wait" | "sync" | "popLayout"
}
export function PageTransition({
  children,
  className,
  type = "fade-slide",
  direction = "up",
  duration = 0.4,
  mode = "wait",
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotionValue()
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
      initial: { x: direction === "left" ? 40 : direction === "right" ? -40 : 0, y: direction === "up" ? 40 : direction === "down" ? -40 : 0 },
      animate: { x: 0, y: 0 },
      exit: { x: direction === "left" ? -40 : direction === "right" ? 40 : 0, y: direction === "up" ? -40 : direction === "down" ? 40 : 0 },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    "fade-slide": {
      initial: { opacity: 0, x: direction === "left" ? 20 : direction === "right" ? -20 : 0, y: direction === "up" ? 20 : direction === "down" ? -20 : 0 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: direction === "left" ? -20 : direction === "right" ? 20 : 0, y: direction === "up" ? -20 : direction === "down" ? 20 : 0 },
    "scale-fade": {
      initial: { opacity: 0, scale: 0.98 },
      exit: { opacity: 0, scale: 0.98 },
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
interface StaggeredTransitionProps {
  staggerDelay?: number
  delay?: number
export function StaggeredTransition({
  staggerDelay = 0.08,
  delay = 0,
}: StaggeredTransitionProps) {
    <AnimatePresence>
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
interface StaggeredItemProps {
export function StaggeredItem({ children, className, delay = 0 }: StaggeredItemProps) {
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
interface ModalTransitionProps {
  isOpen: boolean
  onClose?: () => void
export function ModalTransition({ children, isOpen, className, onClose }: ModalTransitionProps) {
    return isOpen ? <div className={className}>{children}</div> : null
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
            className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}
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
interface RouteTransitionProps {
export function RouteTransition({ children, className }: RouteTransitionProps) {
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: MOTION_EASE }}
interface StaggeredViewProps {
export function StaggeredView({ children, className, staggerDelay = 0.06 }: StaggeredViewProps) {
      initial="hidden"
      animate="visible"
        hidden: { opacity: 0 },
          transition: {
            staggerChildren: staggerDelay,
interface StaggeredViewItemProps {
export function StaggeredViewItem({ children, className }: StaggeredViewItemProps) {
        hidden: { opacity: 0, y: 15 },
          transition: { duration: 0.4, ease: MOTION_EASE },
