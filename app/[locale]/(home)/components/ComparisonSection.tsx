'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
 <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-24 lg:px-8 lg:py-24">

 <div className="relative mx-auto max-w-6xl">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
 <motion.div
 className="rounded-[2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_80px_-44px_rgba(0,0,0,0.95)] sm:p-8"
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, ease: MOTION_EASE }}
 >
 <Badge variant="outline" className="border border-white/[0.12] bg-[oklch(0.65_0.22_260/0.06)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/34 [font-family:var(--home-copy)]">
 Difference From Others
 </Badge>
 <h2 className="mt-4 text-[clamp(1.9rem,4.9vw,3.45rem)] font-[350] leading-[0.92] tracking-[-0.04em] [font-family:var(--home-display)]">
 Why we&apos;re different
 <span className="block text-foreground/95">from standard trading analytics tools</span>
 </h2>
 <p className="mt-5 max-w-xl leading-[1.85] text-foreground/56 [font-family:var(--home-copy)]">
 See how Qunt Edge compares to traditional journaling tools and basic spreadsheet tracking.
 </p>
 <div className="mt-8 space-y-3">
 {['Execution-first review model', 'AI guidance with reason trails', 'Integrated workflow instead of stitched tools'].map((line) => (
 <div key={line} className="rounded-[1.2rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] px-4 py-3 text-sm text-foreground/72">
 {line}
 </div>
 ))}
 </div>
 </motion.div>

 <div className="grid gap-4 sm:grid-cols-2">
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
 <Card variant="glass" className="group h-full rounded-[1.75rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
 <CardContent className="flex flex-col gap-4 p-5">
 <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl">
 <div className={`absolute inset-0 rounded-xl blur-sm ${item.glowBg}`} />
 <div className={`relative inline-flex items-center justify-center rounded-xl h-10 w-10 border ${item.iconBorder} ${item.iconBg}`}>
 <Icon className={`h-5 w-5 ${item.iconColor}`} />
 </div>
 </div>

 <div>
 <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
 {item.title}
 </h3>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/56 [font-family:var(--home-copy)]">
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
 </div>
 </section>
 )
}
