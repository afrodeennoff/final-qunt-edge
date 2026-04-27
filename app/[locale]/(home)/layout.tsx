import { Suspense } from 'react'
import MarketingLayoutShell from '../(landing)/components/marketing-layout-shell'
import { PublicRootProviders } from '@/components/providers/root-providers'

import type { Metadata } from 'next'

type Locale = 'en' | 'fr'

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const params = await props.params
  const descriptions: Record<Locale, string> = {
    en: 'Sync trades, review behavior, and turn every session into a cleaner trading plan.',
    fr: 'Synchronisez vos trades, analysez vos comportements et transformez chaque session en plan plus clair.',
  }
  const description = descriptions[params.locale] || descriptions.en
  return {
    title: 'Qunt Edge',
    description,
  }
}

function HomeLayoutFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-black pb-safe">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      <p className="text-sm text-muted-foreground">Loading&hellip;</p>
    </div>
  )
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PublicRootProviders>
      <MarketingLayoutShell
        className="home-borderless-shell dark"
        contentClassName="w-full flex-1"
        showRollingBanner={false}
        topSpacingClassName=""
        contentSpacingClassName="pb-safe"
        shellVariant="black"
        fullWidth
      >
        <Suspense fallback={<HomeLayoutFallback />}>
          {children}
        </Suspense>
      </MarketingLayoutShell>
    </PublicRootProviders>
  )
}
