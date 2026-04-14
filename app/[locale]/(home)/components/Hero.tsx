'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/animation/interactive'
import DashboardPreview from './DashboardPreview'

const ease = [0.22, 1, 0.36, 1] as const

const capabilityCards = [
 {
 title: 'Execution Audits',
 description: 'Spot quality drift before it hits your PnL',
 tone:
 'rgba(145,108,255,0.16), rgba(92,54,180,0.10), rgba(255,255,255,0.02)',
 },
 {
 title: 'AI Debriefs',
 description: 'Session-level insights with actionable next steps',
 tone:
 'rgba(145,108,255,0.12), rgba(78,42,154,0.08), rgba(255,255,255,0.015)',
 },
 {
 title: 'Team Coaching',
 description: 'Review setups, process, and risk with your desk',
 tone:
 'rgba(188,118,255,0.10), rgba(98,52,170,0.08), rgba(255,255,255,0.012)',
 },
] as const

export default function Hero({ locale }: { locale: string }) {
 return (
 <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-32 pt-[88px]">
 <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0.28)_100%)]" />
 <div className="pointer-events-none absolute inset-0 opacity-80">
 <div className="absolute left-[8%] top-[8%] h-72 w-72 rounded-full bg-[oklch(0.7001_0.1882_313.2907/0.14)] blur-[120px]" />
 <div className="absolute bottom-[6%] right-[10%] h-80 w-80 rounded-full bg-[oklch(0.4865_0.2423_291.8661/0.12)] blur-[130px]" />
 <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:72px_72px] opacity-40" />
 </div>

 <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col items-center text-center">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.7, delay: 0, ease }}
 >
 <Badge
 variant="outline"
 className="mb-8 rounded-full border border-[oklch(0.2505_0.0293_299.5707/0.9)] bg-[oklch(0.6083_0.2172_297.1153/0.10)] px-4 py-1.5 text-foreground/75 shadow-[0_0_0_0.5px_oklch(0.6083_0.2172_297.1153/0.10),0_16px_48px_-28px_rgba(0,0,0,0.82)]"
 >
 <span className="mr-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_oklch(0.6083_0.2172_297.1153/0.45)] animate-pulse" />
 <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-foreground/62">
 Precision Trading Intelligence
 </span>
 </Badge>
 </motion.div>

 <motion.h1
 className="max-w-5xl text-[clamp(3.2rem,7vw,6.6rem)] font-[350] leading-[0.94] tracking-[-0.055em] text-foreground/95 [font-family:var(--home-display)]"
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.9, delay: 0.1, ease }}
 >
 Audit execution quality.
 <span className="mt-1 block bg-gradient-to-r from-[oklch(0.7001_0.1882_313.2907)] via-[oklch(0.6083_0.2172_297.1153)] to-[oklch(0.4865_0.2423_291.8661)] bg-clip-text text-transparent">
 Compound your edge.
 </span>
 </motion.h1>

 <motion.p
 className="mx-auto mb-10 mt-6 max-w-2xl text-[clamp(1rem,2vw,1.18rem)] font-[350] leading-[1.7] tracking-[-0.015em] text-foreground/58 [font-family:var(--home-copy)]"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.7, delay: 0.3, ease }}
 >
 Qunt Edge turns scattered trade data into a clear execution story, so you can
 review decisions faster, coach better, and trade with tighter discipline.
 </motion.p>

 <motion.div
 className="mb-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.4, ease }}
 >
 <MagneticButton strength={6}>
 <Button
 asChild
 size="lg"
 className="h-12 w-full rounded-full bg-primary px-8 text-[13px] font-semibold tracking-[-0.01em] text-primary-foreground shadow-[0_0_40px_oklch(0.6083_0.2172_297.1153/0.18)] hover:bg-[oklch(0.7001_0.1882_313.2907)] sm:w-auto"
 >
 <Link href={`/${locale}/authentication?next=dashboard`}>
 Start Free Audit
 </Link>
 </Button>
 </MagneticButton>
 <Button
 asChild
 size="lg"
 variant="outline"
 className="group h-12 w-full rounded-full border border-[oklch(0.2505_0.0293_299.5707/0.9)] bg-[oklch(0.6083_0.2172_297.1153/0.08)] px-8 text-[13px] font-medium tracking-[-0.01em] text-foreground/78 transition-all duration-200 hover:border-[oklch(0.6083_0.2172_297.1153/0.24)] hover:bg-[oklch(0.6083_0.2172_297.1153/0.12)] hover:text-foreground/95 sm:w-auto"
 >
 <a href="#how-it-works">
 Watch Demo
 <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
 </a>
 </Button>
 </motion.div>

 <motion.p
 className="mb-12 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground/38"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.45 }}
 >
 No credit card · First audit in minutes
 </motion.p>

 <motion.div
 className="mb-12 grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.5, ease }}
 >
 {capabilityCards.map((card) => (
 <div
 key={card.title}
 className="relative overflow-hidden rounded-2xl border border-[oklch(0.2505_0.0293_299.5707/0.9)] px-5 py-4 shadow-[0_0_0_0.5px_oklch(0.6083_0.2172_297.1153/0.10),0_18px_44px_-32px_rgba(0,0,0,0.86)]"
 style={{ background: `linear-gradient(135deg, ${card.tone})` }}
 >
 <div className="relative z-10 rounded-xl bg-[linear-gradient(180deg,rgba(8,10,18,0.8),rgba(8,10,18,0.62))] px-4 py-3">
 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
 {card.title}
 </p>
 <p className="mt-1.5 text-[0.9rem] leading-relaxed text-white/75">
 {card.description}
 </p>
 </div>
 </div>
 ))}
 </motion.div>

 <motion.div
 className="w-full"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 1.0, delay: 0.6, ease }}
 >
 <div
 className="relative"
 style={{
 perspective: '1200px',
 }}
 >
 <motion.div
 initial={{ rotateX: 3 }}
 animate={{ rotateX: 0 }}
 transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
 style={{ transformStyle: 'preserve-3d' }}
 className="relative"
 >
 <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)] opacity-100 blur-2xl" />
 <DashboardPreview />
 </motion.div>
 </div>
 </motion.div>

 {/* Broker logos strip */}
 <motion.div
 className="mt-14 w-full pb-8"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.8, ease }}
 >
 <p className="mb-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-foreground/30 [font-family:var(--home-copy)]">
 Trusted broker integrations
 </p>
 <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
 {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NinjaTrader'].map(
 (broker) => (
 <span
 key={broker}
 className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-foreground/34 transition-all duration-300 hover:border-white/[0.14] hover:text-foreground/80 [font-family:var(--home-display)]"
 >
 {broker}
 </span>
 ),
 )}
 </div>
 </motion.div>
 </div>
 </div>

 {/* Bottom fade */}
 <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
 </section>
 )
}
