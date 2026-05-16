'use client'

import { useEffect, useState } from 'react'

type IdleScheduler = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    cancelIdleCallback?: (handle: number) => void
  }

export function useIdleMount(delayMs = 900) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const idleWindow = window as IdleScheduler

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(() => setMounted(true), {
        timeout: delayMs + 600,
      })

      return () => idleWindow.cancelIdleCallback?.(handle)
    }

    const handle = window.setTimeout(() => setMounted(true), delayMs)

    return () => window.clearTimeout(handle)
  }, [delayMs])

  return mounted
}
