'use client'

import { type ReactNode, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

interface InteractiveWrapperProps {
  children: ReactNode
  hover?: 'scale' | 'glow' | 'lift' | 'cursor'
  className?: string
  cursorStrength?: number
}

export function InteractiveWrapper({ children, hover = 'lift', className, cursorStrength = 8 }: InteractiveWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(springY, [0, 1], [cursorStrength, -cursorStrength])
  const rotateY = useTransform(springX, [0, 1], [-cursorStrength, cursorStrength])
  const glowX = useTransform(springX, [0, 1], [0, 100])
  const glowY = useTransform(springY, [0, 1], [0, 100])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    x.set(0.5)
    y.set(0.5)
  }

  const variants = {
    scale: { whileHover: { scale: 1.03 } },
    glow: { whileHover: { boxShadow: '0 0 30px rgba(var(--primary), 0.15)' } },
    lift: { whileHover: { y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' } },
    cursor: {},
  }

  const isCursorMode = hover === 'cursor'

  return (
    <motion.div
      ref={ref}
      className={cn(className, isCursorMode && 'perspective-[800px]')}
      onMouseMove={isCursorMode ? handleMouseMove : undefined}
      onMouseLeave={isCursorMode ? handleMouseLeave : undefined}
      style={isCursorMode ? { rotateX, rotateY } : undefined}
      {...(!isCursorMode ? variants[hover] : {})}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
      {isCursorMode && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(var(--primary), 0.08) 0%, transparent 60%)`
            ),
          }}
        />
      )}
    </motion.div>
  )
}
