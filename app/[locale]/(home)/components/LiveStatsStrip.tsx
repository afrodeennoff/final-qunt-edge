'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/locales/client'

function useAnimatedCounter(target: number, inView: boolean, reducedMotion: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) {
      return
    }

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setCount(target))
      return () => cancelAnimationFrame(frame)
    }

    const duration = 1800
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, inView, reducedMotion])

  return count
}

function StatItem({
  label,
  value,
  prefix,
  suffix,
  inView,
  reducedMotion,
}: {
  label: string
  value: number
  prefix: string
  suffix: string
  inView: boolean
  reducedMotion: boolean
}) {
  const count = useAnimatedCounter(value, inView, reducedMotion)

  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-4 text-left shadow-sm transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-border/80 hover:bg-card/65">
      <p className="tabular-nums text-2xl font-semibold text-foreground sm:text-3xl">
        {prefix}
        {value >= 1000 ? count.toLocaleString() : count}
        {suffix}
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

export default function LiveStatsStrip() {
  const t = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })
  const reducedMotion = useReducedMotion() ?? false

  const stats = [
    { value: 2400, prefix: '', suffix: '+', label: String(t('landing.home.liveStats.stat1Label')) },
    { value: 12, prefix: '$', suffix: 'M', label: String(t('landing.home.liveStats.stat2Label')) },
    { value: 100, prefix: '', suffix: '%', label: String(t('landing.home.liveStats.stat3Label')) },
    { value: 24, prefix: '', suffix: '/7', label: String(t('landing.home.liveStats.stat4Label')) },
  ]

  return (
    <section
      ref={ref}
      className="px-4 py-8 sm:py-10 md:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-[1360px] gap-6 border-y border-border/60 py-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t('landing.home.liveStats.heading')}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('landing.home.liveStats.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              inView={isInView}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
