import { notFound } from 'next/navigation'
import { getUnifiedFirmBySlug } from '@/server/deals'
import { FirmDetailClient } from './page-client'

export const revalidate = 3600

export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = await getUnifiedFirmBySlug(slug)
  if (!firm) notFound()
  return <FirmDetailClient firm={firm} />
}
