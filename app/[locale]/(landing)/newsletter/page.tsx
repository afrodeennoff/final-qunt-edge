import { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { getScopedI18n } from '@/locales/server'
import { CardV2 as Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/v2'
import { buildPublicMetadata } from '@/lib/seo'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/newsletter',
    title: 'Newsletter Preferences | Qunt Edge',
    description: 'Manage newsletter preferences and unsubscribe settings for Qunt Edge updates.',
  })
}

export default async function NewsletterPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const searchParams = await props.searchParams
  const t = await getScopedI18n('newsletter')

  const isUnsubscribed = searchParams?.status === 'unsubscribed'
  const email = searchParams?.email

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface className="space-y-6">
        {isUnsubscribed && (
          <UnifiedSurface variant="subtle">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <CardTitle className="text-lg sm:text-xl">{t('unsubscribed.title')}</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                {t('unsubscribed.description')}
              </CardDescription>
            </div>
            <CardContent className="pt-4">
              <p className="text-sm sm:text-base text-muted-foreground break-all">
                {email && `${t('unsubscribed.email')}: ${email}`}
              </p>
            </CardContent>
          </UnifiedSurface>
        )}

        <UnifiedSurface variant="subtle">
          <CardHeader className="space-y-3 sm:space-y-4">
            <CardTitle className="text-lg sm:text-xl">{t('preferences.title')}</CardTitle>
            <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
              {t('preferences.description')}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('preferences.comingSoon')}
            </p>
          </CardContent>
        </UnifiedSurface>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
