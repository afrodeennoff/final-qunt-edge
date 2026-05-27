import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import AnalyticsClient from './components/analytics-client'

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
