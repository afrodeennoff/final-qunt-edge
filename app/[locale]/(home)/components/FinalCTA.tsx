'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/animation/interactive'
import { MOTION_EASE } from './_constants'

const ease = MOTION_EASE as unknown as number[]

interface FinalCTAProps {
 locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
 return (
 <section className="classes "">
 <div className="pointer-events-none absolute inset-0 bg-background" />
 <div className="pointer-events-none absolute inset-0">
 <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[oklch(0.65_0.22_260/0.16)] blur-[130px]" />
 </div>

 <motion.div
 className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
 initial={{ opacity: 0, y: 10 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, ease }}
 >
 <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[oklch(0.035_0.005_264)] px-6 py-16 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_80px_-40px_rgba(0,0,0,0.95),0_0_100px_-40px_oklch(0.65_0.22_260/0.16)] sm:px-12 sm:py-20">
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.65_0.22_260/0.14),transparent_45%)]" />
 <div className="relative z-10">
 <h2 className="mb-6 text-[clamp(2.2rem,4.6vw,3.6rem)] font-[350] leading-[1.02] tracking-[-0.05em] text-foreground/95 [font-family:var(--home-display)]">
 Ready to{' '}
 <span className="line-through decoration-muted-foreground/30 decoration-2">stop guessing</span>
 {' '}and{' '}
 <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
 start knowing
 </span>
 ?
 </h2>
 <p className="mb-10 text-[0.98rem] leading-[1.7] tracking-[-0.01em] text-foreground/58 sm:text-lg [font-family:var(--home-copy)]">
 Join traders tracking their performance with Qunt Edge.
 Start your free audit today.
 </p>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, ease, delay: 0.2 }}
 >
 <MagneticButton strength={8}>
 <Button
 asChild
 size="lg"
 className="rounded-full bg-white px-8 text-[13px] font-semibold tracking-[-0.01em] text-black shadow-[0_0_40px_rgba(255,255,255,0.16)] hover:bg-white/90"
 >
 <Link href={`/${locale}/authentication?next=dashboard`}>
 Start Your Free Audit — No Credit Card
 <ArrowRight className="ml-2 h-5 w-5" />
 </Link>
 </Button>
 </MagneticButton>
 </motion.div>

 <div className="mt-4">
 <Button
 asChild
 size="lg"
 className="rounded-full border border-white/[0.12] bg-white/[0.04] px-8 text-[13px] font-medium tracking-[-0.01em] text-foreground/78 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-foreground/95"
 >
 <Link href={`/${locale}/propfirms`}>
 Browse Prop Firms
 </Link>
 </Button>
 </div>

 <motion.p
 className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground/34"
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.4 }}
 >
 No credit card required · Setup in 2 minutes · Cancel anytime
 </motion.p>
 </div>
 </div>
 </motion.div>
 </section>
 )
}
