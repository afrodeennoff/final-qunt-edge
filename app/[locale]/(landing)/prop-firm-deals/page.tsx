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
    path: '/prop-firm-deals',
    title: 'Prop Firm Deals & Challenge Discounts | Qunt Edge',
    description:
      'Browse verified prop-firm discounts, compare challenge costs, and find the best deals for proprietary trading firms.',
  })
}

export default function PropFirmDealsPage() {
  permanentRedirect('/deals')
}
