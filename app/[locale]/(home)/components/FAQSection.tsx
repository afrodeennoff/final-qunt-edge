'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { BadgeV2 as Badge } from '@/components/ui/v2'
import { CardV2 as Card } from '@/components/ui/v2'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import { MarketingSection } from '@/components/layout/marketing-sections'

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className={cn('overflow-hidden rounded-lg border', isOpen ? 'border-primary/30' : 'border-border')}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/10"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <span className="type-h4 text-foreground">{item.question}</span>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </div>
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
        <Card className="p-6">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
            <HelpCircle className="mr-1.5 h-3 w-3" />
            {t('landing.home.faq.badge')}
          </Badge>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            {t('landing.home.faq.title')}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {t('landing.home.faq.description')}
          </p>

          <Card className="mt-8 border border-border p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.faq.bestForTitle')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {t('landing.home.faq.bestForDescription')}
            </p>
          </Card>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.faq.commonQuestions')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('landing.home.faq.answersLabel', { count: faqs.length })}
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={faq.question}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </Card>
      </div>
    </MarketingSection>
  )
}
