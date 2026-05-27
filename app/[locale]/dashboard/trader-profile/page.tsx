import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import TraderProfilePageClient from './page-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Trader Profile | Qunt Edge',
    description:
      'Your consolidated trader profile with performance metrics, consistency tracking, and session patterns.',
    robots: { index: false, follow: false },
    alternates: { canonical: getCanonicalUrl(locale, '/dashboard/trader-profile') },
  }
}

export default function TraderProfilePage() {
  return <TraderProfilePageClient />
}
