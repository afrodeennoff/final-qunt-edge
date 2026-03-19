'use server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { updateTag } from 'next/cache'

const _listPropFirms = async () => {
  return prisma.propFirm.findMany({
    where: { isActive: true },
    include: {
      coupons: { where: { isActive: true } },
      _count: { select: { reviews: true, coupons: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export const listPropFirms = unstable_cache(
  _listPropFirms,
  ['prop-firms-list'],
  { revalidate: 3600, tags: ['prop-firms'] }
)

const _getPropFirmBySlug = async (slug: string) => {
  return prisma.propFirm.findUnique({
    where: { slug },
    include: {
      coupons: { where: { isActive: true } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { reviews: true, coupons: true } },
    },
  })
}

export const getPropFirmBySlug = unstable_cache(
  _getPropFirmBySlug,
  ['prop-firm-by-slug'],
  { revalidate: 3600, tags: ['prop-firms'] }
)

export async function createPropFirm(data: { slug: string; name: string; category: string; description?: string; shortDesc?: string; platform?: string; payoutModel?: string; drawdownType?: string; profitSplit?: string; maxAllocation?: string; referralUrl?: string; logoUrl?: string }) {
  const result = await prisma.propFirm.create({ data })
  updateTag('prop-firms')
  return result
}

export async function updatePropFirm(id: string, data: Partial<{ name: string; description: string; shortDesc: string; platform: string; payoutModel: string; drawdownType: string; profitSplit: string; maxAllocation: string; referralUrl: string; logoUrl: string; isActive: boolean }>) {
  const result = await prisma.propFirm.update({ where: { id }, data })
  updateTag('prop-firms')
  return result
}
