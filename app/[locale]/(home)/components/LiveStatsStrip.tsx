import { useReducedMotionValue } from "@/context/reduced-motion-context"
import { useReducedMotionValue } from "@/context/reduced-motion-context"
'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'motion/react'

const stats = [
  { value: 2400, prefix: '', suffix: '+', label: 'Traders' },
  { value: 12, prefix: '$', suffix: 'M', label: 'Funded' },
  { value: 100, prefix: '', suffix: '%', label: 'Coverage' },
  { value: 24, prefix: '', suffix: '/7', label: 'Support' },
] as const

function useAnimatedCounter(
  target: number,
  inView: boolean,
  reducedMotion: boolean,
) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) {
      if (reducedMotion && inView) setCount(target)
      return
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
  stat,
  inView,
  reducedMotion,
}: {
  stat: (typeof stats)[number]
  inView: boolean
  reducedMotion: boolean
}) {
  const count = useAnimatedCounter(stat.value, inView, reducedMotion)

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold tabular-nums text-foreground [font-family:var(--home-display)]">
        {stat.prefix}
        {stat.value >= 1000 ? count.toLocaleString() : count}
        {stat.suffix}
      </span>
      <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground/60 [font-family:var(--home-copy)]">
        {stat.label}
      </span>
    </div>
  )
}

export default function LiveStatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const reducedMotion = useReducedMotionValue() ?? false

  return (
    <section
      ref={ref}
      className="relative w-full border-y border-border/50 bg-card/40 py-10"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <StatItem
                stat={stat}
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
