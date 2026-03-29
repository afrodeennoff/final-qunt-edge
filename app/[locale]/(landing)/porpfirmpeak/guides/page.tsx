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
    path: '/porpfirmpeak/guides',
    title: 'Prop Firm Deal Guides | Qunt Edge',
    description:
      'Comprehensive guides on choosing the best prop firm deals, understanding challenge rules, and maximizing your trading career.',
  })
}

export default function PorpfirmpeakGuidesPage() {
  permanentRedirect('/deals/guides')
}
