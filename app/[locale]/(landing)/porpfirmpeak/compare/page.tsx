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
    path: '/porpfirmpeak/compare',
    title: 'Compare Prop Firm Deals | Qunt Edge',
    description:
      'Compare prop firm deals side by side. Evaluate challenge pricing, profit splits, rules, and available discounts across multiple firms.',
  })
}

export default function PorpfirmpeakComparePage() {
  permanentRedirect('/deals/compare')
}
