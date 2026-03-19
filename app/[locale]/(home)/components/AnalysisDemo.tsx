'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useIsMobile } from '@/hooks/use-mobile'
import { motion, useInView, useReducedMotion } from 'framer-motion'

function AnalysisDemoStatic() {
  const isMobile = useIsMobile()

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 [font-family:var(--home-copy)]">Trading Journal Intelligence</p>
            <h2 className="mt-2 text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Real-time review for
              <span className="block text-foreground">process over outcome</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
            Old journal context stays intact while the interface mirrors a modern SaaS presentation style.
          </p>
        </div>

        <div className="marketing-panel overflow-hidden rounded-[28px]">
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border-b border-[hsl(var(--mk-border)/0.3)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Execution Stream</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
                    {4367}.00
                  </p>
                </div>
                <span className="rounded-full border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground [font-family:var(--home-copy)]">
                  +1.27%
                </span>
              </div>

              {isMobile ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Plan Adherence', value: '87%' },
                    { label: 'Risk Drift', value: '-22%' },
                    { label: 'Review SLA', value: '9m' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] p-3">
                  <AnalysisDemoChart data={mockData} />
                </div>
              )}
            </div>

            <div className="bg-[hsl(var(--mk-surface-muted)/0.42)] p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Journal Signals</p>
              <div className={isMobile ? "mt-4 space-y-3" : "mt-4 space-y-3 min-h-[220px]"}>
                <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.32)] bg-[hsl(var(--mk-surface)/0.72)] p-4 text-sm leading-relaxed text-foreground [font-family:var(--home-copy)]">
                  {logs[0]}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[hsl(var(--mk-border)/0.32)] bg-[hsl(var(--mk-surface)/0.72)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Anomaly Probability</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--mk-border)/0.3)]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                    style={{ width: '72%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AnimatedCounter({
  value,
  suffix = '',
  className
}: {
  value: number
  suffix?: string
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!isInView || hasAnimated || prefersReducedMotion) return
    setHasAnimated(true)
    
    // Simple CSS transition-like animation using setTimeout cascade
    const duration = 1000
    const steps = 20
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplayValue(Math.floor(eased * value))
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, value, hasAnimated, prefersReducedMotion])

  if (prefersReducedMotion) {
    return <span className={className}>{value}{suffix}</span>
  }

  return (
    <span ref={ref} className={className}>
      {displayValue}
      {suffix}
    </span>
  )
}

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
    <div className="h-full w-full rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.65)]" />
  ),
})

function LogRotator({ logs, isMobile }: { logs: string[]; isMobile: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (isMobile) return

    const interval = setInterval(() => {
      setOpacity(0)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % logs.length)
        setOpacity(1)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [isMobile, logs.length])

  return (
    <p 
      className="text-sm leading-relaxed text-foreground transition-opacity duration-200"
      style={{ opacity }}
    >
      {isMobile ? logs[0] : logs[currentIndex]}
    </p>
  )
}

export default function AnalysisDemo() {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  if (prefersReducedMotion) return <AnalysisDemoStatic />

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 [font-family:var(--home-copy)]">Trading Journal Intelligence</p>
            <h2 className="mt-2 text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Real-time review for
              <span className="block text-foreground">process over outcome</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
            Old journal context stays intact while the interface mirrors a modern SaaS presentation style.
          </p>
        </div>

        <motion.div
          className="marketing-panel overflow-hidden rounded-[28px]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border-b border-[hsl(var(--mk-border)/0.3)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Execution Stream</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
                    <AnimatedCounter value={4367} suffix=".00" />
                  </p>
                </div>
                <span className="rounded-full border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground [font-family:var(--home-copy)]">
                  +1.27%
                </span>
              </div>

              {isMobile ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Plan Adherence</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
                      <AnimatedCounter value={87} suffix="%" />
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Risk Drift</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
                      <AnimatedCounter value={-22} suffix="%" />
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.74)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Review SLA</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
                      <AnimatedCounter value={9} suffix="m" />
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] p-3">
                  <AnalysisDemoChart data={mockData} />
                </div>
              )}
            </div>

            <div className="bg-[hsl(var(--mk-surface-muted)/0.42)] p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Journal Signals</p>
              <div className="mt-4 min-h-[220px] space-y-3">
                <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.32)] bg-[hsl(var(--mk-surface)/0.72)] p-4">
                  <LogRotator logs={logs} isMobile={isMobile} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[hsl(var(--mk-border)/0.32)] bg-[hsl(var(--mk-surface)/0.72)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">Anomaly Probability</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--mk-border)/0.3)]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '72%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
