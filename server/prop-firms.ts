'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { updateTag } from 'next/cache'
import { assertAdminAccess } from '@/server/authz'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'

const _listPropFirms = async () => {
  if (!hasConfiguredDatabaseConnection) {
    return Object.entries(propFirms).map(([key, firm]) => {
      const profile = getVerifiedPropFirmProfileByName(firm.name)
      return {
        id: `fallback-${key}`,
        slug: profile?.slug ?? key,
        name: firm.name,
        category: profile?.category ?? null,
        platform: profile?.platform ?? null,
        isActive: true,
        coupons: [],
        _count: { reviews: 0, coupons: 0 },
      }
    })
  }

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

export type PropFirmBannerItem = {
  id: string
  firmName: string
  firmSlug: string
  badge: string
  type: 'deal' | 'firm'
}

function toBannerBadge(coupon?: { code: string; discountPercent: number | null }): Pick<PropFirmBannerItem, 'badge' | 'type'> {
  if (!coupon) {
    return { badge: 'Live', type: 'firm' }
  }

  if (typeof coupon.discountPercent === 'number' && coupon.discountPercent > 0) {
    return { badge: `${Math.round(coupon.discountPercent)}% OFF`, type: 'deal' }
  }

  return { badge: coupon.code.trim() || 'Deal', type: 'deal' }
}

const _listPropFirmBannerItems = async (): Promise<PropFirmBannerItem[]> => {
  if (!hasConfiguredDatabaseConnection) {
    return Object.entries(propFirms)
      .map(([key, firm]) => {
        const profile = getVerifiedPropFirmProfileByName(firm.name)
        return {
          id: `fallback-${key}`,
          firmName: firm.name,
          firmSlug: profile?.slug ?? key,
          badge: 'Live',
          type: 'firm' as const,
        }
      })
      .sort((a, b) => a.firmName.localeCompare(b.firmName))
  }

  const now = new Date()

  const firms = await prisma.propFirm.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      coupons: {
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
        orderBy: [{ discountPercent: 'desc' }, { updatedAt: 'desc' }],
        take: 1,
        select: {
          code: true,
          discountPercent: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return firms.map((firm) => {
    const badge = toBannerBadge(firm.coupons[0])
    return {
      id: firm.id,
      firmName: firm.name,
      firmSlug: firm.slug,
      badge: badge.badge,
      type: badge.type,
    }
  })
}

export const listPropFirmBannerItems = unstable_cache(
  _listPropFirmBannerItems,
  ['prop-firms-banner-items'],
  { revalidate: 3600, tags: ['prop-firms'] }
)

const _getPropFirmBySlug = async (slug: string) => {
  if (!hasConfiguredDatabaseConnection) {
    return null
  }

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

export type PropFirmCreateInput = {
  slug: string
  name: string
  category: string
  description?: string
  shortDesc?: string
  platform?: string
  payoutModel?: string
  drawdownType?: string
  profitSplit?: string
  maxAllocation?: string
  referralUrl?: string
  logoUrl?: string
}

export type PropFirmUpdateInput = PropFirmCreateInput & {
  isActive?: boolean
}

export async function createPropFirm(data: PropFirmCreateInput) {
  await assertAdminAccess()
  const result = await prisma.propFirm.create({ data })
  updateTag('prop-firms')
  return result
}

export async function updatePropFirm(id: string, data: PropFirmUpdateInput) {
  await assertAdminAccess()
  const result = await prisma.propFirm.update({ where: { id }, data })
  updateTag('prop-firms')
  return result
}

export async function deletePropFirm(id: string) {
  await assertAdminAccess()
  const result = await prisma.propFirm.delete({ where: { id } })
  updateTag('prop-firms')
  return result
}

export async function softDeletePropFirm(id: string) {
  await assertAdminAccess()
  const result = await prisma.propFirm.update({
    where: { id },
    data: { isActive: false },
  })
  updateTag('prop-firms')
  return result
}

export type PropFirmReviewInput = {
  rating: number
  title?: string
  content?: string
  isVerified?: boolean
}

export async function createPropFirmReview(propFirmId: string, data: PropFirmReviewInput) {
  await assertAdminAccess()
  const result = await prisma.propFirmReview.create({
    data: { propFirmId, ...data },
  })
  updateTag('prop-firms')
  return result
}

export async function updatePropFirmReview(id: string, data: PropFirmReviewInput) {
  await assertAdminAccess()
  const result = await prisma.propFirmReview.update({
    where: { id },
    data,
  })
  updateTag('prop-firms')
  return result
}

export async function deletePropFirmReview(id: string) {
  await assertAdminAccess()
  const result = await prisma.propFirmReview.delete({ where: { id } })
  updateTag('prop-firms')
  return result
}

export type PropFirmCouponInput = {
  code: string
  discountPercent?: number
}

export async function createPropFirmCoupon(propFirmId: string, data: PropFirmCouponInput) {
  await assertAdminAccess()
  const result = await prisma.propFirmCoupon.create({
    data: { propFirmId, ...data },
  })
  updateTag('prop-firms')
  return result
}

export async function updatePropFirmCoupon(id: string, data: PropFirmCouponInput) {
  await assertAdminAccess()
  const result = await prisma.propFirmCoupon.update({
    where: { id },
    data,
  })
  updateTag('prop-firms')
  return result
}

export async function deletePropFirmCoupon(id: string) {
  await assertAdminAccess()
  const result = await prisma.propFirmCoupon.delete({ where: { id } })
  updateTag('prop-firms')
  return result
}
