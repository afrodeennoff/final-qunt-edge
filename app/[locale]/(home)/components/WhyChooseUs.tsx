'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock3, LineChart, ShieldCheck, Sparkles, Users2 } from 'lucide-react'
import { motion } from 'framer-motion'

const proofStats = [
  { label: 'Time To First Diagnostic', value: '< 7 min', note: 'from first sync to actionable process signal' },
  { label: 'Drift Detection Speed', value: 'In Session', note: 'warnings before slippage becomes habit' },
  { label: 'Execution Coverage', value: '100%', note: 'every fill, note, and context event is tracked' },
]

const reasons = [
  {
    title: 'Decision Quality First',
    description: 'We prioritize rule quality and execution discipline before discussing outcome swings.',
    icon: ShieldCheck,
  },
  {
    title: 'Built For Competitors',
    description: 'Solo traders and desks run on one source of truth with role-specific visibility.',
    icon: Users2,
  },
  {
    title: 'Weekly Performance Momentum',
    description: 'AI reviews convert recurring mistakes into measurable, week-over-week progress.',
    icon: Clock3,
  },
  {
    title: 'Journal Intelligence',
    description: 'Structured notes and context become concrete intervention plans, not vague reminders.',
    icon: LineChart,
  },
]

const socialProof = [
  'Used by funded futures traders',
  'Adopted by performance coaches and trading desks',
  'Trusted for multi-account execution review',
]

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export default function WhyChooseUs() {
  return (
    <section 
      id="why-us" 
      className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20"
        style={{ 
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent)'
        }}
      />
      
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <Badge variant="outline" className="border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
            Why Traders Choose Us
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Why high-standard traders
            <span className="block text-foreground">choose Qunt Edge over basic journals</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-[1.78] text-foreground/80 sm:text-base [font-family:var(--home-copy)]">
            Qunt Edge merges execution analytics, journaling, and AI coaching into one weekly cadence so your process gets sharper, not noisier.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-4 md:grid-cols-3"
        >
          {proofStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="marketing-panel rounded-2xl p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">{stat.value}</p>
              <p className="mt-2 text-sm text-foreground/80 [font-family:var(--home-copy)]">{stat.note}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {reasons.map((reason, idx) => {
            const Icon = reason.icon
            const isKeyBenefit = idx < 2
            return (
              <motion.div
                key={reason.title}
                variants={itemVariants}
              >
                <Card variant="glass" className="h-full rounded-2xl border-[hsl(var(--mk-border)/0.35)]">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--mk-border)/0.3)] ${isKeyBenefit ? 'border-[hsl(var(--border-focus)/0.4)]' : ''} bg-[hsl(var(--mk-surface-muted)/0.7)] text-foreground`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl tracking-[-0.01em] [font-family:var(--home-display)]">{reason.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                      {reason.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-3 sm:grid-cols-3"
        >
          {socialProof.map((item, idx) => (
            <motion.div
              key={item}
              variants={itemVariants}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface)/0.7)] px-4 py-3 text-sm"
            >
              {idx === 0 && <Sparkles className="h-4 w-4 text-foreground" />}
              {idx === 1 && <CheckCircle2 className="h-4 w-4 text-foreground" />}
              {idx === 2 && <CheckCircle2 className="h-4 w-4 text-foreground" />}
              <span className="text-foreground/80 [font-family:var(--home-copy)]">{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
