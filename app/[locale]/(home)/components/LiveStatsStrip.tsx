'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
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
    <div className="rounded-lg border-border/60 bg-card/70 p-5 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md">
      <p className="tabular-nums text-3xl font-bold text-foreground">
        {prefix}
        {value >= 1000 ? count.toLocaleString() : count}
        {suffix}
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
      className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-20 lg:px-8 xl:py-24"
    >
      {/* Atmospheric glow orb */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="mx-auto max-w-[1360px] rounded-lg border-border/60 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t('landing.home.liveStats.heading')}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('landing.home.liveStats.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <StatItem
                label={stat.label}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                inView={isInView}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
