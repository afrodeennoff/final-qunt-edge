'use client'
import React from 'react'

import { createContext, useContext, useCallback, useRef, useEffect, type ReactNode } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface GestureCallbacks {
  onSwipe?: (direction: SwipeDirection) => void
  onPullToRefresh?: () => void
}

interface GestureContextValue {
  registerSwipeArea: (element: HTMLElement, callbacks: GestureCallbacks) => () => void
  vibrate: (pattern?: number | number[]) => void
  isTouchDevice: boolean
}

const GestureContext = createContext<GestureContextValue | null>(null)

const SWIPE_THRESHOLD = 50
const PULL_THRESHOLD = 80

function getPointerCoords(e: PointerEvent | TouchEvent) {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
  }
  const pe = e as PointerEvent
  return { x: pe.clientX, y: pe.clientY }
}

export function GestureProvider({ children }: { children: ReactNode }) {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const areasRef = useRef<Map<HTMLElement, GestureCallbacks>>(new Map())

  const registerSwipeArea = useCallback((element: HTMLElement, callbacks: GestureCallbacks) => {
    areasRef.current.set(element, callbacks)

    let startX = 0
    let startY = 0
    let pulling = false
    let activePointerId: number | null = null

    const onPointerStart = (e: PointerEvent) => {
      element.setPointerCapture(e.pointerId)
      activePointerId = e.pointerId
      const coords = getPointerCoords(e)
      startX = coords.x
      startY = coords.y
      pulling = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return
      const coords = getPointerCoords(e)
      const deltaY = coords.y - startY
      if (startY < 60 && deltaY > PULL_THRESHOLD && callbacks.onPullToRefresh) {
        pulling = true
      }
    }

    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return
      activePointerId = null

      if (pulling && callbacks.onPullToRefresh) {
        callbacks.onPullToRefresh()
        pulling = false
        return
      }

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
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

    const onTouchStart = (e: TouchEvent) => {
      const coords = getPointerCoords(e)
      startX = coords.x
      startY = coords.y
      pulling = false
    }

    const onTouchMove = (e: TouchEvent) => {
      const coords = getPointerCoords(e)
      const deltaY = coords.y - startY
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

      const coords = getPointerCoords(e)
      const deltaX = coords.x - startX
      const deltaY = coords.y - startY
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
    element.addEventListener('pointerdown', onPointerStart, { passive: true })
    element.addEventListener('pointermove', onPointerMove, { passive: true })
    element.addEventListener('pointerup', onPointerEnd, { passive: true })
    element.addEventListener('pointercancel', onPointerEnd, { passive: true })

    return () => {
      areasRef.current.delete(element)
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
      element.removeEventListener('pointerdown', onPointerStart)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerEnd)
      element.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [])

  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return (
    <GestureContext.Provider value={{ registerSwipeArea, vibrate, isTouchDevice }}>
      {children}
    </GestureContext.Provider>
  )
}

export function useGestures() {
  const ctx = useContext(GestureContext)
  if (!ctx) throw new Error('useGestures must be used within GestureProvider')
  return ctx
}
