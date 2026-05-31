'use client'

import { useState, useEffect, useRef } from 'react'
import { useGestures } from '@/components/providers/gesture-provider'
import { AnimatePresence, motion } from 'motion/react'

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
        }, 300)
      },
    })
  }, [registerSwipeArea])

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 48, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center text-xs text-muted-foreground"
          >
            Refreshing...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
