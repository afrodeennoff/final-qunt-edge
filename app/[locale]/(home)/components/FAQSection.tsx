'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { BadgeV2 as Badge } from '@/components/ui/v2'
import { CardV2 as Card, CardContent } from '@/components/ui/v2'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import { MarketingSection } from '@/components/layout/marketing-sections'

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg border bg-[oklch(0.65_0.22_260/0.03)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-colors',
        isOpen ? 'border-primary/30' : 'border-[oklch(0.65_0.22_260/0.08)]',
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-[oklch(0.65_0.22_260/0.02)]"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase tracking-[0.12em]',
              isOpen
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] text-muted-foreground',
            )}
          >
            Q
          </span>
          <span className="type-h4 pr-4 text-foreground">{item.question}</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t border-[oklch(0.65_0.22_260/0.08)] p-5 pt-4">
            <p className="pl-12 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

export default function FAQSection() {
  const t = useTypedI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FAQItem[] = [1, 2, 3, 4, 5, 6].map((index) => ({
    question: String(t(`faq.question${index}`)),
    answer: String(t(`faq.answer${index}`)),
  }))

  return (
    <MarketingSection id="faq" className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
        <Card variant="glass" className="p-6 lg:sticky lg:top-28">
          <Badge
            variant="frost-info"
            className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]"
          >
            <HelpCircle className="mr-1.5 h-3 w-3" />
            {t('landing.home.faq.badge')}
          </Badge>
          <h2 className="mt-5 text-balance text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em]">
            {t('landing.home.faq.title')}
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {t('landing.home.faq.description')}
          </p>

          <Card variant="flat" className="mt-8 p-5 border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.faq.bestForTitle')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {t('landing.home.faq.bestForDescription')}
            </p>
          </Card>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.faq.commonQuestions')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('landing.home.faq.answersLabel', { count: faqs.length })}
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <FAQAccordion
                  item={faq}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </MarketingSection>
  )
}
