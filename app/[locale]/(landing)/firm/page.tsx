import { buildPublicMetadata } from '@/lib/seo'
import PropFirmsPage from '../propfirms/page'

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

export default async function FirmIndexPage(props: {
  params: Promise<{ locale: string }>
}) {
  return <PropFirmsPage params={props.params} />
}
