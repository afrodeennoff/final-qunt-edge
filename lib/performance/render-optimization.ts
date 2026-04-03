'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface FPSMetrics {
  current: number
  average: number
  samples: number[]
}

class RenderOptimizationEngine {
  private fpsMetrics: FPSMetrics = {
    current: 60,
    average: 60,
    samples: []
  }
  private frameCount = 0
  private lastFrameTime = performance.now()
  private fpsUpdateInterval: number | null = null
  private rafId: number | null = null
  private isMonitoring = false

  startFPSMonitoring() {
    if (this.isMonitoring || typeof window === 'undefined') return
    this.isMonitoring = true

    const measureFPS = () => {
      const now = performance.now()
      const delta = now - this.lastFrameTime
      this.frameCount++

      if (delta >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / delta)
        this.fpsMetrics.samples.push(fps)
        
        if (this.fpsMetrics.samples.length > 60) {
          this.fpsMetrics.samples.shift()
        }
        
        this.fpsMetrics.current = fps
        this.fpsMetrics.average = Math.round(
          this.fpsMetrics.samples.reduce((a, b) => a + b, 0) / this.fpsMetrics.samples.length
        )
        
        this.frameCount = 0
        this.lastFrameTime = now
        
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}`)
        }
      }
      
      if (this.isMonitoring) {
        this.rafId = requestAnimationFrame(measureFPS)
      }
    }
    
    this.rafId = requestAnimationFrame(measureFPS)
  }

  stopFPSMonitoring() {
    this.isMonitoring = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getFPSMetrics(): FPSMetrics {
    return this.fpsMetrics
  }

  isLowPerformance(): boolean {
    return this.fpsMetrics.average < 40
  }

  isVeryLowPerformance(): boolean {
    return this.fpsMetrics.average < 20
  }
}

export const renderOptimizationEngine = new RenderOptimizationEngine()

export function usePerformanceOptimization(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const [fps, setFps] = useState<FPSMetrics>(() => renderOptimizationEngine.getFPSMetrics())

  useEffect(() => {
    renderOptimizationEngine.startFPSMonitoring()
    const syncMetrics = () => {
      setIsLowPerformance(renderOptimizationEngine.isLowPerformance())
      setFps(renderOptimizationEngine.getFPSMetrics())
    }

    syncMetrics()
    const intervalId = window.setInterval(syncMetrics, 1000)

    return () => {
      window.clearInterval(intervalId)
      renderOptimizationEngine.stopFPSMonitoring()
    }
  }, [])

  useEffect(() => {
    renderStartTime.current = performance.now()
    return () => {
      const renderTime = performance.now() - renderStartTime.current
      if (renderTime > 16) {
        console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })

  return {
    isLowPerformance,
    fps,
  }
}

export function useDebouncedCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: TArgs) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])
}

export function useThrottledCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  interval: number
): (...args: TArgs) => void {
  const lastRunRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: TArgs) => {
    const now = Date.now()
    const timeSinceLastRun = now - lastRunRef.current

    if (timeSinceLastRun >= interval) {
      lastRunRef.current = now
      callbackRef.current(...args)
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        timeoutRef.current = null
        callbackRef.current(...args)
      }, interval - timeSinceLastRun)
    }
  }, [interval])
}
