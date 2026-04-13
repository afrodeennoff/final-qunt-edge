'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'

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
 <span className="text-3xl font-bold tabular-nums font-mono text-[var(--text-primary)]">
 {stat.prefix}
 {stat.value >= 1000 ? count.toLocaleString() : count}
 {stat.suffix}
 </span>
 <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-secondary)] [font-family:var(--home-copy)]">
 {stat.label}
 </span>
 </div>
 )
}

export default function LiveStatsStrip() {
 const ref = useRef<HTMLDivElement>(null)
 const isInView = useInView(ref, { once: true, amount: 0.3 })
 const reducedMotion = useReducedMotion() ?? false

 return (
 <section
 ref={ref}
 className="relative w-full py-24"
 >
 <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
 <div className="rounded-[2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] px-5 py-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_24px_60px_-36px_rgba(0,0,0,0.92)] sm:px-8">
 <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
 <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/32">Desk Pulse</span>
 <span className="text-[11px] font-medium tracking-[-0.01em] text-foreground/46">Live activity snapshot across the platform</span>
 </div>
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
 </div>
 </section>
 )
}
