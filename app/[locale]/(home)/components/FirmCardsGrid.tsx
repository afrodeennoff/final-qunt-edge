'use client'

import type { UnifiedFirm } from '@/server/deals'
import { useI18n } from '@/locales/client'
import FirmCard from './FirmCard'

interface FirmCardsGridProps {
  firms: UnifiedFirm[]
  locale: string
}

export default function FirmCardsGrid({ firms, locale }: FirmCardsGridProps) {
  const t = useI18n()

  if (firms.length === 0) {
    return (
      <section className="pb-3">
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/60 px-6 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">
            {t('landing.home.explorer.noResultsTitle')}
          </p>
          <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
            {t('landing.home.explorer.noResultsDescription')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="pb-2">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {firms.map((firm) => (
          <FirmCard key={firm.id} firm={firm} locale={locale} />
        ))}
      </div>
    </section>
  )
}
