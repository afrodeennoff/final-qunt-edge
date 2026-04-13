'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { MOTION_EASE } from './_constants'

const mockData = [
 { time: '09:30', price: 4312, ema: 4308, volume: 32 },
 { time: '10:00', price: 4326, ema: 4313, volume: 45 },
 { time: '10:30', price: 4318, ema: 4315, volume: 38 },
 { time: '11:00', price: 4337, ema: 4320, volume: 58 },
 { time: '11:30', price: 4345, ema: 4328, volume: 62 },
 { time: '12:00', price: 4332, ema: 4330, volume: 41 },
 { time: '12:30', price: 4348, ema: 4334, volume: 54 },
 { time: '13:00', price: 4358, ema: 4341, volume: 59 },
 { time: '13:30', price: 4349, ema: 4344, volume: 43 },
 { time: '14:00', price: 4367, ema: 4350, volume: 67 },
]

const logs = [
 'Reviewing last 50 executions and journal entries.',
 'Detected consistency drift after two consecutive losses.',
 'Flagged oversized position relative to baseline.',
 'Suggested cooldown and reduced size profile.',
 'Session stabilized, plan compliance restored.',
]

const AnalysisDemoChart = dynamic(() => import('./analysis-demo-chart'), {
 ssr: false,
 loading: () => (
 <div className="h-full w-full animate-pulse rounded-xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.65)]" />
 ),
})

export default function AnalysisDemo() {
 const [logIndex, setLogIndex] = useState(0)
 const isMobile = useIsMobile()

 useEffect(() => {
 if (isMobile) return

 const timer = setInterval(() => {
 setLogIndex((prev) => (prev + 1) % logs.length)
 }, 1700)

 return () => clearInterval(timer)
 }, [isMobile])

 const activeLog = isMobile ? logs[0] : logs[logIndex]

 return (
 <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, ease: MOTION_EASE }}
 className="mx-auto max-w-6xl">
 <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <p className="text-[0.68rem] uppercase tracking-[0.2em] text-foreground/80 [font-family:var(--home-copy)]">Trading Journal Intelligence</p>
 <h2 className="mt-2 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.92] tracking-[-0.025em] [font-family:var(--home-display)]">
 Real-time review for
 <span className="block text-foreground/95">process over outcome</span>
 </h2>
 </div>
 <p className="max-w-md text-[15px] leading-[1.75] text-muted-foreground/80 [font-family:var(--home-copy)]">
 Your journal entries are analyzed in real time, with AI surfacing patterns in execution quality and behavioral drift.
 </p>
 </div>

 <div className="rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] overflow-hidden">
 <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
 <div className="border-b border-[var(--frost-border)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
 <div className="mb-6 flex items-center justify-between">
 <div>
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Execution Stream</p>
 <p className="mt-1 font-mono text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">4,367.00</p>
 </div>
 <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/95 [font-family:var(--home-copy)]">
 +1.27%
 </span>
 </div>

 {isMobile ? (
 <div className="grid gap-3 sm:grid-cols-3">
 <div className="rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4">
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Plan Adherence</p>
 <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">87%</p>
 </div>
 <div className="rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4">
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Risk Drift</p>
 <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground/95 [font-family:var(--home-display)]">-22%</p>
 </div>
 <div className="rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4">
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Review SLA</p>
 <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">9m</p>
 </div>
 </div>
 ) : (
 <div className="h-[300px] overflow-hidden rounded-xl bg-[oklch(0.05_0_0)] p-3">
 <AnalysisDemoChart data={mockData} />
 </div>
 )}
 </div>

 <div className="rounded-xl border border-[var(--frost-border-alt)] bg-[oklch(0.05_0_0)] p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Journal Signals</p>
 <div className="flex items-center gap-2">
 <div className="relative flex items-center justify-center w-2 h-2">
 <div className="absolute w-2 h-2 rounded-full animate-glow-pulse" style={{ backgroundColor: 'var(--accent-green)' }} />
 <div className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-green)' }} />
 </div>
 <span className="text-sm font-mono" style={{ color: 'var(--accent-green)' }}>LIVE</span>
 </div>
 </div>
 <div className={cn("mt-4 space-y-3", isMobile ?"min-h-0" :"min-h-[220px]")}>
 <div className="rounded-xl border border-[var(--frost-border-alt)] bg-[oklch(0.05_0_0)] p-4 text-sm font-mono leading-relaxed text-[oklch(0.65_0.01_275)] [font-family:var(--home-copy)]">
 {activeLog}
 </div>
 </div>

 <div className="mt-5 rounded-xl border border-[var(--frost-border-alt)] bg-[oklch(0.05_0_0)] p-4">
 <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Anomaly Probability</p>
 <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--mk-border)/0.3)]">
 <div
 style={{ width: '72%' }}
 className="h-full rounded-full bg-primary"
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </section>
 )
}
