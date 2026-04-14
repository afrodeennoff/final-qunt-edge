'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'

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
        'overflow-hidden rounded-lg border bg-card/80 shadow-sm transition-colors',
        isOpen ? 'border-primary/30' : 'border-border/50',
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-background/20"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase tracking-[0.12em]',
              isOpen
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-background/70 text-muted-foreground',
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
          <CardContent className="border-t border-border/50 p-5 pt-4">
            <p className="pl-12 text-sm leading-7 text-muted-foreground">{item.answer}</p>
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
    <section id="faq" className="px-4 py-16 sm:px-6 md:py-20 lg:px-8 xl:py-24">
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
        <motion.div
          className="rounded-lg border border-border/50 bg-card/80 p-6 shadow-sm lg:sticky lg:top-28"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Badge
            variant="outline"
            className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary"
          >
            <HelpCircle className="mr-1.5 h-3 w-3" />
            {t('landing.home.faq.badge')}
          </Badge>
          <h2 className="type-h2 mt-5 text-balance text-foreground lg:text-h1">
            {t('landing.home.faq.title')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            {t('landing.home.faq.description')}
          </p>

          <div className="mt-8 rounded-md border border-border/50 bg-background/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.faq.bestForTitle')}
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground/80">
              {t('landing.home.faq.bestForDescription')}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="rounded-lg border border-border/50 bg-card/70 p-4 shadow-sm sm:p-5"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
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
                initial={{ opacity: 0, y: 12 }}
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
        </motion.div>
      </div>
    </section>
  )
}
