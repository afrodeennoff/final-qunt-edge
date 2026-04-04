import { useReducedMotionValue } from "@/context/reduced-motion-context"
"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PRESETS } from "./entrance-exit"
export { SPRING_PRESETS } from "./entrance-exit"
export type HoverEffect = "lift" | "glow" | "scale" | "none"
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
  hover = "none",
  press = false,
  magnetic = false,
  draggable = false,
  onDragEnd,
  glowColor = "rgba(41, 98, 255, 0.25)",
}: InteractiveWrapperProps) {
  const prefersReducedMotion = useReducedMotionValue()
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !magnetic || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    const maxDistance = 12
    const distanceX = Math.min(Math.max(mouseX / 6, -maxDistance), maxDistance)
    const distanceY = Math.min(Math.max(mouseY / 6, -maxDistance), maxDistance)
    setPosition({ x: distanceX, y: distanceY })
  }, [magnetic, prefersReducedMotion])
  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (prefersReducedMotion) return
    dragX.set(0)
    dragY.set(0)
    onDragEnd?.()
  }, [dragX, dragY, onDragEnd, prefersReducedMotion])
  const hoverVariants = {
    lift: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
    glow: {
      transition: { duration: 0.2 },
    scale: {
      scale: 1.05,
    none: {},
  }
  const pressVariants = {
    tap: {
      scale: 0.97,
      transition: { duration: 0.1 },
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      drag={draggable}
      dragConstraints={draggable ? { left: -50, right: 50, top: -50, bottom: 50 } : false}
      dragElastic={draggable ? 0.1 : undefined}
      onDragEnd={handleDragEnd}
      style={
        magnetic
          ? { x: position.x, y: position.y }
          : draggable
          ? { x: dragX, y: dragY }
          : undefined
      }
      whileHover={hover !== "none" ? hoverVariants[hover] : undefined}
      whileTap={press ? pressVariants.tap : undefined}
      transition={magnetic || draggable ? SPRING_PRESETS.gentle : undefined}
    >
      {(hover === "glow" || draggable) && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: glowColor,
            filter: "blur(16px)",
            opacity: 0,
            zIndex: -1,
          }}
          animate={hover === "glow" ? { opacity: [0, 0.6, 0] } : { opacity: draggable ? 0.4 : 0 }}
          transition={hover === "glow" ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
        />
      )}
      {children}
    </motion.div>
  )
interface MagneticButtonProps {
  onClick?: () => void
  disabled?: boolean
  strength?: number
export function MagneticButton({
  onClick,
  disabled,
  strength = 8,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || !ref.current) return
    const distanceX = Math.min(Math.max(mouseX / 5, -strength), strength)
    const distanceY = Math.min(Math.max(mouseY / 5, -strength), strength)
  }, [strength, prefersReducedMotion])
    return (
      <button className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      animate={{ x: position.x, y: position.y }}
      transition={SPRING_PRESETS.gentle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    </motion.button>
interface DraggableCardProps {
  onDragEnd?: (offset: { x: number; y: number }) => void
  dragConstraints?: { left?: number; right?: number; top?: number; bottom?: number }
export function DraggableCard({
  dragConstraints = { left: -100, right: 100, top: -50, bottom: 50 },
}: DraggableCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
    onDragEnd?.({ x: info.offset.x, y: info.offset.y })
  }, [onDragEnd, prefersReducedMotion])
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.1}
      style={{ x, y }}
      whileDrag={{ scale: 1.02, rotate: 1 }}
      transition={SPRING_PRESETS.smooth}
interface HoverLiftProps {
  liftDistance?: number
  shadowIntensity?: number
export function HoverLift({
  liftDistance = 8,
  shadowIntensity = 0.15,
}: HoverLiftProps) {
      whileHover={{
        y: -liftDistance,
        boxShadow: `0 ${liftDistance + 12}px ${liftDistance + 20}px -${liftDistance + 8}px rgba(0, 0, 0, ${shadowIntensity})`,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
interface GlowOnHoverProps {
  glowSize?: number
export function GlowOnHover({
  glowColor = "rgba(41, 98, 255, 0.4)",
  glowSize = 20,
}: GlowOnHoverProps) {
        boxShadow: `0 0 ${glowSize}px -4px ${glowColor}`,
      transition={{ duration: 0.3 }}
