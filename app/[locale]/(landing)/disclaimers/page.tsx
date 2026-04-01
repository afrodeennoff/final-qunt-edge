import { buildPublicMetadata } from '@/lib/seo'
import { DisclaimersContent } from './disclaimers-content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return buildPublicMetadata({
    title: 'Disclaimers | Qunt Edge',
    description: 'Risk disclosures, hypothetical performance disclaimers, and legal notices for Qunt Edge trading analytics platform.',
    path: '/disclaimers',
    locale,
  })
}

export default function DisclaimersPage() {
  return <DisclaimersContent />
}
