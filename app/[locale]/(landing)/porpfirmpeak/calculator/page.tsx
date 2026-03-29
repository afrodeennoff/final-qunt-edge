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
    path: '/porpfirmpeak/calculator',
    title: 'Prop Firm Deal Calculator | Qunt Edge',
    description:
      'Calculate and compare prop firm challenge costs, payouts, and discounts to find the best deal for your trading goals.',
  })
}

export default function PorpfirmpeakCalculatorPage() {
  permanentRedirect('/deals/calculator')
}
