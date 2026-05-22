'use client'

import { useI18n } from '@/locales/client'
import { CardV2 as Card, CardContent, CardHeader, CardTitle } from '@/components/ui/v2'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'

export function DisclaimersContent() {
  const t = useI18n()
  const extendedDisclaimer = `Trading futures, options, and foreign exchange involves substantial risk and is not suitable for all individuals. Financial instruments may fluctuate in value, and losses may exceed the initial investment, particularly when leverage is used. All trading decisions are made at the individual's own discretion, and any profits or losses are solely the responsibility of the trader. Any performance examples shown are hypothetical and provided for educational purposes only and do not represent actual trading results. Past performance is not indicative of future results, and no representation is made that any account will or is likely to achieve profits or losses similar to those shown. Trade only with capital you can afford to lose.

DISCLAIMER: Futures and forex trading contain substantial risk and is not for every investor. An investor could potentially lose all or more than the initial investment. Risk capital is money that can be lost without jeopardizing ones' financial security or lifestyle. Only risk capital should be used for trading, and only those with sufficient risk capital should consider trading. Past performance is not necessarily indicative of future results.`

  return (
    <MarketingSection className="pt-24 lg:pt-32">
      <MarketingSectionHeader
        eyebrow="Legal"
        title="Disclaimers"
        titleAs="h1"
        description="Risk disclosures and legal notices for Qunt Edge trading analytics."
      />
      <div className="space-y-6">
        <Card className="border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.05)]">
          <CardHeader>
            <CardTitle>{t('disclaimer.risk.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.risk.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.05)]">
          <CardHeader>
            <CardTitle>{t('disclaimer.hypothetical.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {t('disclaimer.hypothetical.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.05)]">
          <CardHeader>
            <CardTitle>Extended Risk Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{extendedDisclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </MarketingSection>
  )
}
