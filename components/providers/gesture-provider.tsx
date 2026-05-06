'use client'

import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface GestureCallbacks {
  onSwipe?: (direction: SwipeDirection) => void
  onPullToRefresh?: () => void
}

interface GestureContextValue {
  registerSwipeArea: (element: HTMLElement, callbacks: GestureCallbacks) => () => void
  vibrate: (pattern?: number | number[]) => void
}

const GestureContext = createContext<GestureContextValue | null>(null)

const SWIPE_THRESHOLD = 50
const PULL_THRESHOLD = 80

export function GestureProvider({ children }: { children: ReactNode }) {
  const areasRef = useRef<Map<HTMLElement, GestureCallbacks>>(new Map())

  const registerSwipeArea = useCallback((element: HTMLElement, callbacks: GestureCallbacks) => {
    areasRef.current.set(element, callbacks)

    let startX = 0
    let startY = 0
    let pulling = false

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      pulling = false
    }

    const onTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY
      if (startY < 60 && deltaY > PULL_THRESHOLD && callbacks.onPullToRefresh) {
        pulling = true
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (pulling && callbacks.onPullToRefresh) {
        callbacks.onPullToRefresh()
        pulling = false
        return
      }

      const deltaX = e.changedTouches[0].clientX - startX
      const deltaY = e.changedTouches[0].clientY - startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (Math.max(absDeltaX, absDeltaY) < SWIPE_THRESHOLD) return
      if (!callbacks.onSwipe) return

      if (absDeltaX > absDeltaY) {
        callbacks.onSwipe(deltaX > 0 ? 'right' : 'left')
      } else {
        callbacks.onSwipe(deltaY > 0 ? 'down' : 'up')
      }
    }

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      areasRef.current.delete(element)
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return (
    <GestureContext.Provider value={{ registerSwipeArea, vibrate }}>
      {children}
    </GestureContext.Provider>
  )
}

export function useGestures() {
  const ctx = useContext(GestureContext)
  if (!ctx) throw new Error('useGestures must be used within GestureProvider')
  return ctx
}
