'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface StatItem {
  value: number
  prefix?: string
  suffix: string
  label: string
  decimals?: number
}

const stats: StatItem[] = [
  { value: 2400, suffix: '+', label: 'Traders' },
  { value: 12, prefix: '$', suffix: 'M', label: 'Funded' },
  { value: 100, suffix: '%', label: 'Coverage' },
  { value: 24, suffix: '/7', label: 'Support' },
]

function AnimatedCounter({
  item,
  isInView,
  prefersReduced,
}: {
  item: StatItem
  isInView: boolean
  prefersReduced: boolean
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView || prefersReduced) {
      setDisplay(item.value)
      return
    }

    const duration = 1500
    const start = performance.now()
    let frameId: number

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(item.value * eased)

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isInView, item.value, prefersReduced])

  const formatted = item.decimals
    ? display.toFixed(item.decimals)
    : Math.round(display).toLocaleString()

  return (
    <span className="font-mono tabular-nums tracking-wider glow-number text-[oklch(0.95_0_0)]">
      {item.prefix}
      {formatted}
      {item.suffix}
    </span>
  )
}

export default function LiveStatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[oklch(0.07_0_0/0.6)] backdrop-blur-md border-y border-[oklch(0.14_0_0/0.3)] py-6"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:gap-0 lg:px-8">
        {stats.map((stat, index) => (
          <>
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl [font-family:var(--home-display)]">
                <AnimatedCounter
                  item={stat}
                  isInView={isInView}
                  prefersReduced={!!prefersReducedMotion}
                />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground/60 [font-family:var(--home-copy)]">
                {stat.label}
              </p>
            </div>
            {index < stats.length - 1 && (
              <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-[oklch(0.55_0.22_264/0.3)] to-transparent" />
            )}
          </>
        ))}
      </div>
    </section>
  )
}
