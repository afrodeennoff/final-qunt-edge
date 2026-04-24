'use client'

import { ReactNode } from 'react'
import { motion } from 'motion/react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'article'
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: ScrollRevealProps) {
  const Component = Tag === 'article' ? motion.article : motion.div

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  )
}

interface ScrollRevealSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollRevealSection({
  children,
  className,
  delay = 0,
}: ScrollRevealSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
