import { notFound } from 'next/navigation'
import { getPropFirmBySlug } from '@/server/prop-firms'
import { FirmDetailClient } from './page-client'

export const revalidate = 3600

export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = await getPropFirmBySlug(slug)
  if (!firm) notFound()
  return <FirmDetailClient firm={firm} />
}
