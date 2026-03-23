import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, ShieldCheck, FileDown, Workflow } from 'lucide-react'
<<<<<<< HEAD
import { motion } from 'framer-motion'
=======
>>>>>>> main

const proofItems = [
  {
    title: 'Account-Scoped By Default',
    description: 'Imports, layouts, and uploads are enforced under your authenticated identity.',
    icon: Lock,
  },
  {
    title: 'Fail-Closed Guardrails',
    description: 'Budgets, routing, and critical checks are designed to error loudly instead of silently drifting.',
    icon: ShieldCheck,
  },
  {
    title: 'Coach-Ready Exports',
    description: 'Turn weekly review into a clean brief you can share with a mentor or desk lead.',
    icon: FileDown,
  },
  {
    title: 'Fits Your Stack',
    description: 'Connect, import, or upload CSVs without rebuilding your execution workflow.',
    icon: Workflow,
  },
]

<<<<<<< HEAD
const logos = [
  { name: 'Tradovate', abbr: 'TV' },
  { name: 'Rithmic', abbr: 'RI' },
  { name: 'MetaTrader 5', abbr: 'MT5' },
  { name: 'Interactive Brokers', abbr: 'IB' },
  { name: 'FTMO', abbr: 'FT' },
  { name: 'Topstep', abbr: 'TS' },
  { name: 'Apex Trader', abbr: 'AX' },
  { name: 'TFT', abbr: 'TF' },
  { name: 'Blue Wave', abbr: 'BW' },
  { name: 'MyFundedFX', abbr: 'MF' },
]

=======
>>>>>>> main
export default function ProofStrip() {
  return (
    <section className="relative px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-center sm:text-left">
            <Badge
              variant="secondary"
              className="border-border/70 bg-card/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]"
            >
              Trust and Proof
            </Badge>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/85 [font-family:var(--home-copy)]">
              Social proof should be earned. Until then, we lead with enforceable constraints and an observable review loop.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/80 [font-family:var(--home-copy)]">Start in minutes</p>
            <p className="mt-1 text-sm text-foreground/85 [font-family:var(--home-copy)]">No credit card required on Starter.</p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-card/75 shadow-xl backdrop-blur-md">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {proofItems.map((item) => {
                const Icon = item.icon
                return (
                  <article
                    key={item.title}
                    className="rounded-xl border border-border/70 bg-background/35 p-4 transition-colors hover:bg-background/55"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/45 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85 [font-family:var(--home-copy)]">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </CardContent>
        </Card>
<<<<<<< HEAD

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-8"
        >
          <div className="mb-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/60 [font-family:var(--home-copy)]">
              Trusted by traders at
            </p>
          </div>
          <div className="overflow-hidden py-4">
            <div className="animate-marquee flex animate-marquee-pause gap-8">
              {[...logos, ...logos, ...logos].map((logo, idx) => (
                <div
                  key={`${logo.name}-${idx}`}
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-4 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-xs font-semibold text-foreground/80">
                    {logo.abbr}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-foreground/70">
                    {logo.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
=======
>>>>>>> main
      </div>
    </section>
  )
}
