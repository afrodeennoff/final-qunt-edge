'use client'

import { motion } from 'framer-motion'
import { BadgeV2 } from "@/components/ui/v2"
import { CardV2 as Card, CardV2Content as CardContent } from '@/components/ui/v2'
import { MOTION_EASE } from './_constants'
import { Activity, Zap, Brain, Link2 } from 'lucide-react'

const differentiators = [
  {
    icon: Activity,
    title: 'Behavior Drift Detection',
    description: 'In-session alerts catch process slippage before it becomes habit, with intervention guidance ready.',
    iconColor: 'text-[oklch(0.55_0.22_264)]',
    glowBg: 'bg-[var(--accent-blue-subtle)]',
    iconBorder: 'border-[var(--accent-blue-border)]',
    iconBg: 'bg-[var(--accent-blue-subtle)]',
  },
  {
    icon: Zap,
    title: 'Instant Diagnostics',
    description: 'Guided first-audit flow delivers actionable session signals in under seven minutes from first sync.',
    iconColor: 'text-[oklch(0.55_0.15_166)]',
    glowBg: 'bg-[var(--accent-green-subtle)]',
    iconBorder: 'border-[var(--accent-green-border)]',
    iconBg: 'bg-[var(--accent-green-subtle)]',
  },
  {
    icon: Brain,
    title: 'Prioritized AI Playbook',
    description: 'Ranked coaching output converts raw observations into a concrete plan for your next session.',
    iconColor: 'text-[oklch(0.6_0.18_290)]',
    glowBg: 'bg-[var(--accent-orange-subtle)]',
    iconBorder: 'border-[var(--accent-orange-border)]',
    iconBg: 'bg-[var(--accent-orange-subtle)]',
  },
  {
    icon: Link2,
    title: 'Unified Timeline',
    description: 'Journal entries, fills, and context events live in one stream &mdash; no manual stitching required.',
    iconColor: 'text-[oklch(0.65_0.2_45)]',
    glowBg: 'bg-[var(--accent-yellow-subtle)]',
    iconBorder: 'border-[rgba(255,197,61,0.3)]',
    iconBg: 'bg-[var(--accent-yellow-subtle)]',
  },
] as const

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: MOTION_EASE,
    },
  }),
}

export default function ComparisonSection() {
  return (
    <section className="relative border-y border-[var(--frost-border)] bg-[var(--surface-card)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36 overflow-hidden">

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
        >
          <BadgeV2 variant="outline" className="border border-[var(--frost-border)] bg-[oklch(0.08_0_0)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Difference From Others
          </BadgeV2>
          <h2 className="mt-3 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.92] tracking-[-0.025em] [font-family:var(--home-display)]">
            Why we&apos;re different
            <span className="block text-foreground">from standard trading analytics tools</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground/80 leading-[1.75] [font-family:var(--home-copy)]">
            See how Qunt Edge compares to traditional journaling tools and basic spreadsheet tracking.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {differentiators.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card variant="glass" className="group h-full rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] transition-colors duration-200 hover:border-[var(--frost-border-strong)]">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl">
                      <div className={`absolute inset-0 rounded-xl blur-sm ${item.glowBg}`} />
                      <div className={`relative inline-flex items-center justify-center rounded-xl h-10 w-10 border ${item.iconBorder} ${item.iconBg}`}>
                        <Icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 [font-family:var(--home-copy)]">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
