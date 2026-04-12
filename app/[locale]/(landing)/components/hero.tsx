'use client'
import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { HeroCard } from '@/components/patterns/hero-card'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import { TrendingUp, Zap } from 'lucide-react'

interface HeroProps {
  onStart?: () => void
}

export default function Hero({ }: HeroProps) {
  const ref = useRef(null)
  const locale = useCurrentLocale()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  return (
    <section
      ref={ref}
      className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-20 text-center md:py-24 lg:py-28 sm:px-6 lg:px-8"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        style={{ scale }}
        className="max-w-3xl mx-auto relative z-10 w-full"
      >
        <MotionStagger className="space-y-6" delay={0.12} staggerSpeed={1}>
          <MotionStaggerItem blur>
            <HeroCard
              icon={Zap}
              label="YOUR TRADING COMMAND CENTER"
              value="3.8M"
              unit="+"
              trend={{
                value: '+12.4%',
                direction: 'up',
                label: 'vs. last month',
              }}
              watermarkIcon={TrendingUp}
              className="mx-6 rounded-2xl p-8"
            />
          </MotionStaggerItem>
        </MotionStagger>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <h1 className="mb-6 text-[40px] font-medium leading-[1.10] tracking-[-0.038em] text-foreground [font-family:var(--font-outfit),sans-serif] sm:text-[56px] md:text-[72px] lg:text-[80px]">
            Qunt <span className="text-foreground">Edge.</span>
          </h1>

          <p className="text-base max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed font-normal px-2 text-foreground/85 [font-family:var(--font-dm-sans),sans-serif]">
            Stop auditing the money. Audit the execution. <br className="hidden sm:block" />
            The clinical intelligence layer for professional discretionary traders.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
        >
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center rounded-lg bg-foreground px-8 text-center text-sm font-medium text-background transition-all hover:opacity-90 sm:w-auto overflow-hidden"
          >
            <span className="relative z-10">Start Free Audit</span>
          </Link>

          <Link
            href={`/${locale}/updates`}
            className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 text-center text-sm font-medium text-foreground transition-all hover:border-border/36 hover:bg-card/80 sm:w-auto"
          >
            View Product Updates
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 border-t border-border px-4 pt-8 opacity-60 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0 sm:mt-20 sm:pt-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-20">
            <span className="text-sm font-black tracking-tighter text-foreground/40 transition-all duration-300 hover:text-foreground hover:scale-105 sm:text-base md:text-xl cursor-default">TRADOVATE</span>
            <span className="text-sm font-black tracking-tighter text-foreground/40 transition-all duration-300 hover:text-foreground hover:scale-105 sm:text-base md:text-xl cursor-default">RITHMIC</span>
            <span className="text-sm font-black tracking-tighter text-foreground/40 transition-all duration-300 hover:text-foreground hover:scale-105 sm:text-base md:text-xl cursor-default">IBKR</span>
            <span className="text-sm font-black tracking-tighter text-foreground/40 transition-all duration-300 hover:text-foreground hover:scale-105 sm:text-base md:text-xl cursor-default">CQG</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
