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
      {/* Left accent bar — visible when expanded */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-[var(--accent-blue)] opacity-0 group-data-[state=open]:opacity-100 transition-opacity duration-200" />
      <Card className={cn(
        'overflow-hidden rounded-xl border bg-[var(--surface-card)]',
        isOpen ? 'border-[var(--frost-border-strong)]' : 'border-[var(--frost-border)]'
      )}>
        <button
          onClick={onToggle}
          className="flex flex-1 w-full items-center justify-between gap-4 p-4 text-left rounded-xl transition-colors duration-200 hover:bg-[oklch(0.08_0_0)]"
          aria-expanded={isOpen}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <span className="pr-4 text-sm font-semibold [font-family:var(--home-display)]">{item.question}</span>
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
            <CardContent className="border-t border-[oklch(0.14_0_0/0.4)] p-4 pt-3">
              <p className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">{item.answer}</p>
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
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
            <HelpCircle className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="mt-3 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.92] tracking-[-0.025em] [font-family:var(--home-display)]">
            Common
            <span className="block text-foreground">questions answered</span>
          </h2>
        </motion.div>

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
      </div>
    </section>
  )
}
