import { Download, BarChart3, Users, Shield, FileText, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { CardV2 as Card } from '@/components/ui/v2'
import { getTypedI18n } from '@/locales/server'

const featureIcons = [Download, BarChart3, Users, Shield, FileText, Brain]

export default async function FeaturesBento() {
  const t = await getTypedI18n()

  const features = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`landing.home.features.feature${index}Title`),
    description: t(`landing.home.features.feature${index}Description`),
    icon: featureIcons[index - 1],
    highlighted: index === 2, // Only feature 2 is highlighted
    colSpan: index === 1 ? 'lg:col-span-2' : '', // First feature spans 2 columns
  }))

  return (
    <MarketingSection className="py-8 sm:py-10" innerClassName="max-w-[1280px]">
      <div className="space-y-5">
        <Card className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{t('landing.home.features.eyebrow')}</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <div>
              <h2 className="text-balance text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-foreground">
                {t('landing.home.features.title')}
                <span className="block text-primary">{t('landing.home.features.highlight')}</span>
              </h2>
            </div>
            <p className="text-[14px] leading-relaxed text-muted-foreground max-w-2xl">
              {t('landing.home.features.description')}
            </p>
          </div>
        </Card>

        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('landing.home.features.listLabel')}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={String(feature.title)}
                className={cn('flex h-full flex-col gap-3 p-4', feature.colSpan)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                {feature.highlighted ? (
                  <span className="w-fit rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                    {t('landing.home.features.feature2Badge')}
                  </span>
                ) : null}
                <div className="space-y-1.5">
                  <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-[1.55] text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </MarketingSection>
  )
}
