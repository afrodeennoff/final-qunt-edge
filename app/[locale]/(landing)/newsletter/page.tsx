import { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { getScopedI18n } from '@/locales/server'
import { CardV2 as Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/v2'
import { buildPublicMetadata } from '@/lib/seo'

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
    <main className="min-h-[calc(100vh-4rem)] flex items-start">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {isUnsubscribed && (
            <Card className="border-[oklch(0.65_0.22_260/0.08)] dark:border-[oklch(0.65_0.22_260/0.10)] bg-[oklch(0.65_0.22_260/0.035)] dark:bg-[oklch(0.65_0.22_260/0.03)]">
              <CardHeader className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-x-2.5">
                  <CheckCircle2 className="h-5 w-5 text-semantic-success shrink-0" />
                  <CardTitle className="text-lg sm:text-xl">{t('unsubscribed.title')}</CardTitle>
                </div>
                <CardDescription className="text-foreground text-sm sm:text-base">
                  {t('unsubscribed.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-foreground break-all">
                  {email && `${t('unsubscribed.email')}: ${email}`}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)]">
            <CardHeader className="space-y-3 sm:space-y-4">
              <CardTitle className="text-lg sm:text-xl">{t('preferences.title')}</CardTitle>
              <p className="text-sm text-muted-foreground sm:text-base">
                {t('preferences.description')}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('preferences.comingSoon')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
