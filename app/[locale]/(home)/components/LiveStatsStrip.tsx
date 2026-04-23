'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import {
  unifiedSectionEyebrowClassName,
} from '@/components/layout/unified-page-recipes'
import { useI18n } from '@/locales/client'

function useAnimatedCounter(target: number, inView: boolean, reducedMotion: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

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
    <div className="text-center">
      <p className="text-3xl font-bold tabular-nums tracking-tight text-primary lg:text-4xl">
        {prefix}
        {value >= 1000 ? count.toLocaleString() : count}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
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
    { value: 12, prefix: '$', suffix: 'M+', label: String(t('landing.home.liveStats.stat2Label')) },
    { value: 99, prefix: '', suffix: '.9%', label: String(t('landing.home.liveStats.stat3Label')) },
    { value: 24, prefix: '', suffix: '/7', label: String(t('landing.home.liveStats.stat4Label')) },
  ]

  return (
    <section ref={ref} className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px] space-y-10 text-center">
        <p className={unifiedSectionEyebrowClassName}>{t('landing.home.liveStats.heading')}</p>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
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
