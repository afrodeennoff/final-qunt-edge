'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { MOTION_EASE } from './_constants'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
 question: string
 answer: string
}

interface FAQSectionProps {
 // Reserved for future i18n support
}

const faqs: FAQItem[] = [
 {
 question: 'What is Qunt Edge?',
 answer: 'Qunt Edge is an AI-powered trading journal and performance review platform for discretionary futures traders. It analyzes your execution quality, detects behavioral drift, and provides actionable diagnostics to improve your trading discipline.',
 },
 {
 question: 'How does the AI analysis work?',
 answer: 'Our AI engine reviews every trade against your defined ruleset, identifies patterns in your execution, and flags drift in sizing, timing, and risk management. It generates prioritized playbooks for your next session based on what matters most.',
 },
 {
 question: 'Which brokers are supported?',
 answer: 'We support Tradovate, Rithmic, MetaTrader 5, Interactive Brokers (IBKR), CQG, NinjaTrader, and CSV import for any broker. New integrations are added regularly based on community demand.',
 },
 {
 question: 'Is my trading data secure?',
 answer: 'Yes. All data is encrypted at rest and in transit. We use Supabase with Row Level Security (RLS) to ensure complete data isolation between users. We never share or sell your trading data.',
 },
 {
 question: 'Can I use Qunt Edge with my trading team?',
 answer: 'Absolutely. Qunt Edge has a full Teams platform where you can create teams, invite members, and view combined performance analytics. Team owners get desk-level visibility into process consistency across all traders.',
 },
 {
 question: 'What prop firms are tracked?',
 answer: 'We track over 20 prop firms including TopStep, Apex Trader Funding, Earn2Trade, Bulenox, and more. Our catalogue includes real statistics from verified trader accounts, coupon codes, and challenge comparisons.',
 },
 {
 question: 'How much does it cost?',
 answer: 'Qunt Edge offers a free tier with basic journaling and analytics. Our Pro plan unlocks AI diagnostics, advanced metrics, and team features. Check our pricing page for current plans and available discounts.',
 },
 {
 question: 'How do I get started?',
 answer: 'Sign up for free, connect your broker or import your trade history, and get your first AI diagnostic within minutes. No credit card required for the free tier.',
 },
]

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
 return (
 <div className="relative group">
 <Card className={cn(
 'overflow-hidden rounded-[1.7rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] transition-all duration-300',
 isOpen
 ? 'border-white/[0.14] shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_24px_50px_-36px_rgba(0,0,0,0.92)]'
 : 'border-white/[0.08] shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)]'
 )}>
 <button
 onClick={onToggle}
 className="flex w-full flex-1 items-center justify-between gap-4 p-5 text-left transition-colors duration-200 hover:bg-[oklch(0.65_0.22_260/0.06)]"
 aria-expanded={isOpen}
 data-state={isOpen ? 'open' : 'closed'}
 >
 <div className="flex items-start gap-4">
 <span className={cn(
 'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold uppercase tracking-[0.12em]',
 isOpen
 ? 'border-[var(--accent-blue-border)] bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]'
 : 'border-white/[0.10] bg-[oklch(0.65_0.22_260/0.06)] text-foreground/40'
 )}>
 Q
 </span>
 <span className="pr-4 text-[0.98rem] font-semibold leading-[1.5] [font-family:var(--home-display)]">
 {item.question}
 </span>
 </div>
 <ChevronDown
 className={cn(
 'h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-200',
 isOpen && 'rotate-180'
 )}
 />
 </button>
 <div
 className={cn(
 'grid transition-all duration-200',
 isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
 )}
 >
 <div className="overflow-hidden">
 <CardContent className="border-t border-white/[0.08] p-5 pt-4">
 <p className="pl-12 text-sm leading-[1.85] text-foreground/68 [font-family:var(--home-copy)]">
 {item.answer}
 </p>
 </CardContent>
 </div>
 </div>
 </Card>
 </div>
 )
}

export default function FAQSection(_props: FAQSectionProps) {
 const [openIndex, setOpenIndex] = useState<number | null>(0)

 return (
 <section id="faq" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
 <div className="mx-auto max-w-[1360px]">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
 <motion.div
 className="rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_24px_60px_-40px_rgba(0,0,0,0.95)] lg:sticky lg:top-28 lg:p-7"
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 >
 <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-foreground/95 [font-family:var(--home-copy)]">
 <HelpCircle className="mr-1.5 h-3 w-3" />
 FAQ
 </Badge>
 <h2 className="mt-5 text-[clamp(2rem,4.9vw,3.9rem)] font-[350] leading-[0.92] tracking-[-0.05em] [font-family:var(--home-display)]">
 Clear answers for traders evaluating the platform seriously.
 </h2>
 <p className="mt-5 max-w-xl text-[0.96rem] leading-[1.8] text-foreground/60 [font-family:var(--home-copy)]">
 This section is designed to remove uncertainty fast: product scope, broker support, AI behavior, security, pricing, and team usage.
 </p>

 <div className="mt-8 rounded-[1.6rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-5">
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Best for</p>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/64">
 Discretionary futures traders, funded accounts, performance coaches, and teams that want one review system instead of scattered notes and screenshots.
 </p>
 </div>
 </motion.div>

 <motion.div
 className="rounded-[2rem] border border-white/[0.08] bg-[oklch(0.035_0.005_264)] p-4 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05),0_24px_60px_-40px_rgba(0,0,0,0.96)] sm:p-5"
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 >
 <div className="mb-4 flex items-center justify-between gap-3 px-1">
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">
 Common questions
 </p>
 <p className="text-xs text-foreground/42">{faqs.length} answers</p>
 </div>
 <div className="space-y-3">
 {faqs.map((faq, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: index * 0.08, ease: MOTION_EASE }}
 >
 <FAQAccordion
 item={faq}
 isOpen={openIndex === index}
 onToggle={() => setOpenIndex(openIndex === index ? null : index)}
 />
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>
 </div>
 </section>
 )
}
