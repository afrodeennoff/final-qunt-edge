"use client"

import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
const stats = [
  { value: 2400, suffix: '+', label: 'Traders' },
  { value: 12, prefix: '$', suffix: 'M', label: 'Funded' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
  { value: 24, suffix: '/7', label: 'Support' },
]

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, target])
  
  return <span ref={ref}>{prefix}{isInView ? count : 0}{suffix}</span>
}

function StatBlock({ stat }: { stat: typeof stats[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-v2-lg border border-v2-border bg-v2-bg-surface p-v2-6 text-center"
    >
      <p className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-v2-text-primary">
        <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
      </p>
      <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-v2-text-secondary">
        {stat.label}
      </p>
    </motion.div>
  )
}

export default function TrustStats() {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return (
      <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-v2-6 md:grid-cols-4">
          {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-v2-lg border border-v2-border bg-v2-bg-surface p-v2-6 text-center"
              >
                <p className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-v2-text-primary">
                  {stat.prefix}{stat.value}{stat.suffix}
                </p>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-v2-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-v2-6 md:grid-cols-4">
          {stats.map((stat) => (
            <StatBlock key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
