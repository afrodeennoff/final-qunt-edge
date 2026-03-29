import { redirect } from 'next/navigation'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  return buildPublicMetadata({
    locale,
    path: `/propfirms/${slug}`,
    title: 'Prop Firm Profile | Qunt Edge',
    description:
      'View detailed prop firm profiles including pricing, rules, payouts, and trader reviews. Find the right proprietary trading firm for you.',
  })
}

export default async function LegacyPropFirmDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  redirect(`/${locale}/firm/${slug}`)
}
