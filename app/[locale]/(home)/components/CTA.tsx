'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SpringButton } from '@/components/animation/spring-button'

const sectionVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

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

const buttonStaggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.5, 
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
        variants={sectionVariants}
      >
        <div className="marketing-panel mx-auto max-w-4xl rounded-[30px] px-6 py-11 text-center sm:px-10">
          <motion.div variants={staggerItem} className="mb-4">
            <Badge 
              variant="secondary" 
              className="inline-flex items-center gap-2 border border-primary/20 bg-card/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur-sm [font-family:var(--home-copy)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Your Next Edge
            </Badge>
          </motion.div>

          <motion.div variants={staggerContainer} className="space-y-2">
            <motion.h2 
              variants={staggerItem}
              className="text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] [font-family:var(--home-display)]"
            >
              Keep your strategy.
              <span className="block text-foreground">Raise the standard of your decisions.</span>
            </motion.h2>
            
            <motion.p 
              variants={staggerItem}
              className="mx-auto max-w-xl text-[15px] leading-[1.78] text-foreground/85 sm:text-base [font-family:var(--home-copy)]"
            >
              Join in minutes and receive your first AI-backed performance audit before your next session opens.
            </motion.p>
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-8 flex flex-col items-center gap-3">
            <motion.div variants={buttonStaggerItem} className="relative">
              <div 
                className="absolute -inset-1 rounded-2xl opacity-0 blur-md transition-all duration-300 group-hover:opacity-100"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent)' }}
              />
              
              <SpringButton
                className="group relative h-12 min-w-[230px] overflow-hidden rounded-2xl bg-primary px-9 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 [font-family:var(--home-copy)]"
                onClick={() => {}}
              >
                <Link 
                  href={`/${locale}/authentication?next=dashboard`}
                  className="relative z-10 flex h-full w-full items-center justify-center"
                >
                  Start Free Audit
                </Link>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </SpringButton>
            </motion.div>

            <motion.p variants={staggerItem} className="text-xs text-foreground/80 [font-family:var(--home-copy)]">
              No credit card required. 7-day Pro trial unlocks advanced diagnostics.
            </motion.p>
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
      <div className="marketing-panel mx-auto max-w-4xl rounded-[30px] px-6 py-11 text-center sm:px-10">
        <Badge 
          variant="secondary" 
          className="mb-4 inline-flex items-center gap-2 border border-primary/20 bg-card/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur-sm [font-family:var(--home-copy)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Your Next Edge
        </Badge>
        <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] [font-family:var(--home-display)]">
          Keep your strategy.
          <span className="block text-foreground">Raise the standard of your decisions.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.78] text-foreground/85 sm:text-base [font-family:var(--home-copy)]">
          Join in minutes and receive your first AI-backed performance audit before your next session opens.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="inline-flex h-12 min-w-[230px] items-center justify-center rounded-2xl bg-primary px-9 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all duration-300 hover:bg-primary/90 [font-family:var(--home-copy)]"
          >
            Start Free Audit
          </Link>
          <p className="text-xs text-foreground/80 [font-family:var(--home-copy)]">No credit card required. 7-day Pro trial unlocks advanced diagnostics.</p>
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
