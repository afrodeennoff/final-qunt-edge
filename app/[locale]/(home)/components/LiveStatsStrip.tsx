'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import {
  unifiedBodyCopyClassName,
  unifiedMetricPanelClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
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
    <div className={cn(unifiedMetricPanelClassName, 'space-y-2 p-4')}>
      <p className="tabular-nums text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">
        {prefix}
        {value >= 1000 ? count.toLocaleString() : count}
        {suffix}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
    <section ref={ref} className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div
        className={cn(
          unifiedSectionPanelClassName,
          'grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end',
        )}
      >
        <div className="space-y-3">
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.liveStats.heading')}</p>
          <p className={cn(unifiedBodyCopyClassName, 'max-w-2xl')}>
            {t('landing.home.liveStats.description')}
          </p>
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
