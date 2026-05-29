import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import dynamic from 'next/dynamic'

const AnalyticsClient = dynamic(
  () => import('./components/analytics-client'),
  { loading: () => <div className="flex h-[80vh] items-center justify-center"><div className="h-32 w-full max-w-4xl animate-pulse rounded-xl bg-muted/30" /></div> }
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Analytics | Qunt Edge',
    description: 'Trading copilot with behavioral analytics, performance reports, and AI-driven insights.',
    robots: { index: false, follow: false },
    alternates: { canonical: getCanonicalUrl(locale, '/dashboard/analytics') },
  }
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
