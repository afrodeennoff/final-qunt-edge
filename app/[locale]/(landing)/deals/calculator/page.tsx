import { redirect } from 'next/navigation'

export default async function DealsCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/deals#cost-planner`)
}
