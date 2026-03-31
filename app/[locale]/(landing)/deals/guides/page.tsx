import { redirect } from 'next/navigation'

export default async function DealsGuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/deals#playbooks`)
}
