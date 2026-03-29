import { permanentRedirect } from 'next/navigation'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/firm',
    title: 'Prop Firms Catalog | Qunt Edge',
    description:
      'Browse and compare proprietary trading firms. Find the best prop firm for your trading style with detailed reviews, pricing, and performance data.',
  })
}

export default function FirmIndexPage() {
  permanentRedirect('/propfirms')
}
