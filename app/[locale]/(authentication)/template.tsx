'use client'
import React from 'react'

import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
    >
      {children}
    </motion.div>
  )
}