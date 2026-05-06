'use client'

import { useState, useEffect, useMemo } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type Orientation = 'portrait' | 'landscape'

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
}

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['3xl']) return '3xl'
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

export function useResponsive() {
  const [width, setWidth] = useState<number>(0)
  const [orientation, setOrientation] = useState<Orientation>('portrait')

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth)
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return useMemo(() => {
    const breakpoint = getBreakpoint(width)
    return {
      breakpoint,
      width,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
    }
  }, [width, orientation])
}
