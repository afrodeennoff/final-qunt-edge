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
    path: '/propfirmperk/faq',
    title: 'Prop Firm Deals FAQ | Qunt Edge',
    description:
      'Frequently asked questions about prop firm deals, challenge discounts, and how to choose the right proprietary trading firm.',
  })
}

export default function PropfirmPerkFAQPage() {
  permanentRedirect('/deals/faq')
}
