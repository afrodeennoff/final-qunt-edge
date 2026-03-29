'use client'

import { useI18n } from '@/locales/client'
import { CardV2, CardV2Content, CardV2Header, CardV2Title } from '@/components/ui/v2'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

export function DisclaimersContent() {
  const t = useI18n()
  const extendedDisclaimer = `Trading futures, options, and foreign exchange involves substantial risk and is not suitable for all individuals. Financial instruments may fluctuate in value, and losses may exceed the initial investment, particularly when leverage is used. All trading decisions are made at the individual's own discretion, and any profits or losses are solely the responsibility of the trader. Any performance examples shown are hypothetical and provided for educational purposes only and do not represent actual trading results. Past performance is not indicative of future results, and no representation is made that any account will or is likely to achieve profits or losses similar to those shown. Trade only with capital you can afford to lose.

DISCLAIMER: Futures and forex trading contain substantial risk and is not for every investor. An investor could potentially lose all or more than the initial investment. Risk capital is money that can be lost without jeopardizing ones' financial security or lifestyle. Only risk capital should be used for trading, and only those with sufficient risk capital should consider trading. Past performance is not necessarily indicative of future results.`

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <div className="space-y-6">
        <CardV2 className="border-border/30 bg-card/90">
          <CardV2Header>
            <CardV2Title>{t('disclaimer.risk.title')}</CardV2Title>
          </CardV2Header>
          <CardV2Content>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.risk.content')}
            </p>
          </CardV2Content>
        </CardV2>

        <CardV2 className="border-border/30 bg-card/90">
          <CardV2Header>
            <CardV2Title>{t('disclaimer.hypothetical.title')}</CardV2Title>
          </CardV2Header>
          <CardV2Content>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.hypothetical.content')}
            </p>
          </CardV2Content>
        </CardV2>

        <CardV2 className="border-border/30 bg-card/90">
          <CardV2Header>
            <CardV2Title>Extended Risk Disclosure</CardV2Title>
          </CardV2Header>
          <CardV2Content>
            <p className="text-muted-foreground whitespace-pre-line">{extendedDisclaimer}</p>
          </CardV2Content>
        </CardV2>
      </div>
    </UnifiedPageShell>
  )
}
