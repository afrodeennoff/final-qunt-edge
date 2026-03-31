import { redirect } from 'next/navigation'

export default async function DealsComparePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/deals#matchup`)
}
