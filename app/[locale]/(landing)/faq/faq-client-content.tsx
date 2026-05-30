'use client'

import { useState } from 'react'
import {
  UnifiedPageShell,
  UnifiedPageHeader,
  UnifiedSurface,
} from '@/components/layout/unified-page-shell'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { X, Search } from 'lucide-react'
import { faqCategories, type FaqCategory, type FaqItem } from '@/lib/faq-data'

interface FAQClientContentProps {
  locale: string
  allFaqs: FaqItem[]
}

export function FAQClientContent({ locale, allFaqs }: FAQClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<FaqCategory | null>(null)

  // Live filtered FAQs (search + category) - client-side only, instant
  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !activeCategory || faq.category === activeCategory

    return matchesSearch && matchesCategory
  })

  // Popular Questions (curated 4 high-value ones for preview)
  const popularIds = [
    'different-from-traditional-journals',
    'behavior-analysis-value',
    'prop-firm-drawdown-tracking',
    'team-collaboration',
  ]
  const popularFaqs = allFaqs.filter((f) => popularIds.includes(f.id))

  const clearFilters = () => {
    setSearchTerm('')
    setActiveCategory(null)
  }

  const toggleCategory = (cat: FaqCategory) => {
    setActiveCategory(activeCategory === cat ? null : cat)
  }

  const hasActiveFilters = searchTerm !== '' || activeCategory !== null

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedPageHeader
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Find answers to common questions about Qunt Edge trading journal workflows, broker support, behavior analytics, team features, and security."
      />

      <div className="space-y-8">
        {/* Search - always visible, large tap target */}
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full rounded-xl border-0 bg-background pl-10 pr-10 py-3 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Search FAQ"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted/40"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Popular Questions Preview (4 cards) - subtle elevation + hover */}
        <UnifiedSurface className="space-y-4" density="comfortable">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Popular Questions
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularFaqs.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const el = document.getElementById(`faq-${item.id}`)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="group cursor-pointer rounded-xl border-00 bg-card/50 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-sm"
              >
                <div className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                  {item.category}
                </div>
                <div className="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                  {item.question}
                </div>
              </div>
            ))}
          </div>
        </UnifiedSurface>

        {/* Category Filters (tabs on desktop, scrollable chips on mobile) */}
        <div className="-mx-1 flex flex-wrap gap-2 border-b-0 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all border whitespace-nowrap ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
            }`}
          >
            All
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all border whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Accordion List - filtered live */}
        <UnifiedSurface className="space-y-2" density="comfortable">
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  id={`faq-${faq.id}`}
                  value={`item-${index}`}
                  className="mb-2 rounded-xl border-0 bg-muted/30 px-5 py-1 transition-colors hover:bg-muted/50"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                    <span className="text-sm sm:text-[15px]">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-1 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No questions match your search.</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Clear filters and try again
              </button>
            </div>
          )}
        </UnifiedSurface>

        {/* Still have questions? */}
        <UnifiedSurface className="mt-6 text-center space-y-4" density="comfortable">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Still have questions?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            We&apos;re here to help you elevate your trading execution and pass prop evaluations.
          </p>
          <a
            href={`/${locale}/support`}
            className="inline-flex items-center justify-center rounded-full border-0 bg-card px-8 py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          >
            Contact Support
          </a>
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}
