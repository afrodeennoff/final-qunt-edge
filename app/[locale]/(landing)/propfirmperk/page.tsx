import { permanentRedirect } from 'next/navigation'

export default async function PropfirmPerkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  permanentRedirect(`/${locale}/prop-firm-deals`)
}
