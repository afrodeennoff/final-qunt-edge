'use client'

import { useState, useEffect, useRef } from 'react'
import { useGestures } from '@/components/providers/gesture-provider'
import { AnimatePresence, motion } from 'motion/react'

function Spinner() {
  return (
    <motion.svg
      className="h-5 w-5 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        opacity={0.3}
      />
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="8"
        opacity={0.9}
      />
    </motion.svg>
  )
}

export function PullToRefreshIndicator() {
  const [refreshing, setRefreshing] = useState(false)
  const { registerSwipeArea } = useGestures()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    return registerSwipeArea(containerRef.current, {
      onPullToRefresh: () => {
        setRefreshing(true)
        setTimeout(() => {
          window.location.reload()
        }, 400)
      },
    })
  }, [registerSwipeArea])

  return (
    <div ref={containerRef} className="relative z-10">
      <AnimatePresence>
        {refreshing && (
          <motion.div
            key="pull-refresh"
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 48, opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground bg-background"
          >
            <Spinner />
            <span className="font-medium">Refreshing...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
