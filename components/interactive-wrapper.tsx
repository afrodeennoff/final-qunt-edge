'use client'

import { type ReactNode, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface InteractiveWrapperProps {
  children: ReactNode
  hover?: 'scale' | 'glow' | 'lift'
  className?: string
}

export function InteractiveWrapper({ children, hover = 'lift', className }: InteractiveWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

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
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...variants[hover]}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
