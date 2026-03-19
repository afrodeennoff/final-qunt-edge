"use client"

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { motion, useReducedMotion } from 'framer-motion'
import { ButtonV2 } from '@/components/ui/v2'
import { ChartIcon } from '@/components/icons/svg-icons'

const staggerItem = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
}

function CTAAnimated() {
  const locale = useCurrentLocale()

  return (
    <section className="relative px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
      >
        <div className="mx-auto max-w-4xl rounded-v2-lg border border-v2-border bg-v2-bg-surface px-6 py-11 text-center shadow-v2-xl sm:px-10">
          <motion.div variants={staggerItem} className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-v2-accent/20 bg-v2-bg-elevated px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-v2-text-secondary backdrop-blur-sm">
              <ChartIcon size={14} className="text-v2-accent" />
              Your Next Edge
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-2">
            <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] text-v2-text-primary">
              Keep your strategy.
              <span className="block text-v2-text-primary">Raise the standard of your decisions.</span>
            </h2>
            
            <p className="mx-auto max-w-xl text-[15px] leading-[1.78] text-v2-text-secondary sm:text-base">
              Join in minutes and receive your first AI-backed performance audit before your next session opens.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-8 flex flex-col items-center gap-3">
            <ButtonV2 variant="solid" size="lg" className="min-w-[230px]">
              <Link 
                href={`/${locale}/authentication?next=dashboard`}
                className="flex h-full w-full items-center justify-center"
              >
                Start Free Audit
              </Link>
            </ButtonV2>

            <p className="text-xs text-v2-text-secondary">
              No credit card required. 7-day Pro trial unlocks advanced diagnostics.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function CTAStatic() {
  const locale = useCurrentLocale()
  
  return (
    <section className="relative px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-v2-lg border border-v2-border bg-v2-bg-surface px-6 py-11 text-center shadow-v2-xl sm:px-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-v2-accent/20 bg-v2-bg-elevated px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-v2-text-secondary backdrop-blur-sm">
          <ChartIcon size={14} className="text-v2-accent" />
          Your Next Edge
        </div>
        <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] text-v2-text-primary">
          Keep your strategy.
          <span className="block text-v2-text-primary">Raise the standard of your decisions.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.78] text-v2-text-secondary sm:text-base">
          Join in minutes and receive your first AI-backed performance audit before your next session opens.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <ButtonV2 variant="solid" size="lg" className="min-w-[230px]">
            <Link
              href={`/${locale}/authentication?next=dashboard`}
              className="flex h-full w-full items-center justify-center"
            >
              Start Free Audit
            </Link>
          </ButtonV2>
          <p className="text-xs text-v2-text-secondary">No credit card required. 7-day Pro trial unlocks advanced diagnostics.</p>
        </div>
      </div>
    </section>
  )
}

export default function CTA() {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return <CTAStatic />
  }
  
  return <CTAAnimated />
}
