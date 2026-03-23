'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
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
    <Card className="overflow-hidden rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[hsl(var(--mk-surface-muted)/0.3)]"
        aria-expanded={isOpen}
      >
        <span className="pr-4 text-sm font-semibold [font-family:var(--home-display)]">{item.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-foreground/80 transition-transform duration-200',
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
          <CardContent className="border-t border-[hsl(var(--mk-border)/0.28)] p-5 pt-4">
            <p className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">{item.answer}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

export default function FAQSection(_props: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Badge variant="outline" className="border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
            <HelpCircle className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Common
            <span className="block text-foreground">questions answered</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQAccordion
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
