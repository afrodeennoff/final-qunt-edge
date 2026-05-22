'use client'

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface InteractiveWrapperProps {
  children: ReactNode
  hover?: 'scale' | 'none'
  className?: string
}

// Binance minimal: simple scale only, no cursor tracking (perf + professional calm)
export function InteractiveWrapper({ children, hover = 'none', className }: InteractiveWrapperProps) {
  const prefersReducedMotion = useReducedMotion()

  const hoverStyle = hover === 'scale' && !prefersReducedMotion ? { scale: 1.01 } : undefined

  return (
    <motion.div
      className={cn('transition-transform duration-80 ease-[cubic-bezier(0.16,1,0.3,1)]', className)}
      whileHover={hoverStyle}
      transition={{ duration: 0.08, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {children}
    </motion.div>
  )
}
