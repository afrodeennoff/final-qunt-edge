'use client'

import { motion } from 'framer-motion'
import { BadgeV2 } from "@/components/ui/v2"
import { CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle } from '@/components/ui/v2'
import { Check, X } from 'lucide-react'

const MotionTr = motion.create('tr')

const comparisonRows = [
  {
    item: 'Behavior drift detection',
    qunt: 'In-session alerts with intervention guidance',
    others: 'Mostly post-session summaries',
  },
  {
    item: 'Time to first useful insight',
    qunt: 'Guided first-audit flow with immediate session diagnostics',
    others: 'Delayed value after manual setup and report configuration',
  },
  {
    item: 'AI coaching output',
    qunt: 'Prioritized playbook for the next session',
    others: 'Generic observations with no ranking',
  },
  {
    item: 'Journal + execution sync',
    qunt: 'Single timeline with note-to-trade context',
    others: 'Fragmented tools and manual stitching',
  },
  {
    item: 'Manager visibility',
    qunt: 'Desk-level process consistency analytics',
    others: 'Mostly account-level performance totals',
  },
]

export default function ComparisonSection() {
  return (
    <section className="relative border-y border-border/30 bg-card/20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-12">
          <BadgeV2 variant="outline" className="border-primary/35 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Difference From Others
          </BadgeV2>
          <h2 className="mt-3 text-[clamp(2rem,4.7vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Why we’re different
            <span className="block text-foreground">from standard trading analytics tools</span>
          </h2>
        </div>

        <Card variant="glass" className="overflow-hidden rounded-3xl border-[hsl(var(--mk-border)/0.35)] shadow-lg shadow-[hsl(var(--foreground)/0.16)]">
          <CardHeader className="border-b border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.5)]">
            <CardTitle className="text-lg tracking-[-0.01em] sm:text-xl [font-family:var(--home-display)]">Head-to-head comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-3 p-4 md:hidden">
              {comparisonRows.map((row) => (
                <article key={row.item} className="rounded-xl border border-[hsl(var(--mk-border)/0.24)] bg-[hsl(var(--mk-surface)/0.6)] p-4">
                  <h3 className="text-sm font-semibold text-foreground [font-family:var(--home-display)]">{row.item}</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span className="[font-family:var(--home-copy)]">{row.qunt}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <X className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="[font-family:var(--home-copy)]">{row.others}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--mk-border)/0.28)]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">Capability</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">Qunt Edge</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">Most Alternatives</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <MotionTr
                      key={row.item}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="border-b border-[hsl(var(--mk-border)/0.24)]"
                    >
                      <td className="px-4 py-4 text-sm font-medium [font-family:var(--home-display)]">{row.item}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 text-foreground" />
                          <span className="[font-family:var(--home-copy)]">{row.qunt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <X className="h-4 w-4" />
                          <span className="[font-family:var(--home-copy)]">{row.others}</span>
                        </div>
                      </td>
                    </MotionTr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
