'use client'

import { motion } from 'framer-motion'
import { Lock, Server, ShieldCheck, LifeBuoy } from 'lucide-react'
import { BadgeV2 } from '@/components/ui/v2'
import { MOTION_EASE } from './_constants'

const trustPillars = [
  { title: 'Security By Design', body: 'Account-scoped reads and writes with ownership checks across imports, layouts, optimized updates, and uploads.', icon: Lock },
  { title: 'Reliable Operations', body: 'Fail-closed budget enforcement, explicit error contracts, and hardened routes that don\'t silently fall back.', icon: Server },
  { title: 'Data You Control', body: 'Bring your existing workflow, export review briefs, and keep your performance loop portable.', icon: ShieldCheck },
  { title: 'Support You Can Reach', body: 'Product support, in-app guidance, and direct escalation paths for active traders and teams.', icon: LifeBuoy },
]

export default function SocialProof() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <BadgeV2
            variant="outline"
            className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]"
          >
            Trusted By Serious Traders
          </BadgeV2>
          <h2 className="mt-3 text-[clamp(2rem,4.8vw,3.4rem)] font-semibold leading-[0.92] tracking-[-0.02em] [font-family:var(--home-display)]">
            Why high-standard traders
            <span className="block text-foreground">choose Qunt Edge</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                className="marketing-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: MOTION_EASE }}
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                  {pillar.body}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
