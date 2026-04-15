'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { cacheLife, cacheTag, updateTag } from 'next/cache'
import { assertAdminAccess } from '@/server/authz'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import {
  isPrismaOperationCoolingDown,
  isPrismaSchemaMismatchError,
  isPrismaTableAvailable,
  markPrismaTableUnavailable,
  markPrismaOperationSchemaMismatch,
  withPrismaSchemaMismatchFallback,
} from '@/lib/prisma-guard'

const PROP_FIRMS_CACHE_LIFETIME = {
  stale: 3_600,
  revalidate: 3_600,
  expire: 7_200,
} as const

const PROP_FIRMS_CACHE_TAG = 'prop-firms'
const PROP_FIRMS_BANNER_ITEMS_COOLDOWN_KEY = 'prop-firms-banner-items'
const PROP_FIRM_TABLE_NAME = 'PropFirm'

function isPropFirmDataUnavailableError(error: unknown): boolean {
  if (isPrismaSchemaMismatchError(error)) return true

  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'P1001' ||
    maybeError.code === 'ECONNREFUSED' ||
    message.includes('database connection is not configured') ||
    message.includes('attempted to access prisma.') ||
    message.includes('prisma missing connection proxy') ||
    message.includes('econnrefused') ||
    message.includes('can\'t reach database server') ||
    message.includes('timeout exceeded when trying to connect') ||
    message.includes('timed out when trying to connect')
  )
}

function logPropFirmFallback(source: string, error: unknown) {
  console.warn(`[PropFirms] Falling back in ${source}`, error)
}

function buildFallbackPropFirmRows() {
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

const _listPropFirms = async () => {
  if (!hasConfiguredDatabaseConnection) {
    return buildFallbackPropFirmRows()
  }

  if (!(await isPrismaTableAvailable(PROP_FIRM_TABLE_NAME))) {
    return buildFallbackPropFirmRows()
  }

  try {
    return await prisma.propFirm.findMany({
      where: { isActive: true },
      include: {
        coupons: { where: { isActive: true } },
        _count: { select: { reviews: true, coupons: true } },
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    if (!isPropFirmDataUnavailableError(error)) {
      throw error
    }

    markPrismaTableUnavailable(PROP_FIRM_TABLE_NAME)
    logPropFirmFallback('listPropFirms', error)
    return buildFallbackPropFirmRows()
  }
}

async function listPropFirmsCached() {
  'use cache'
  cacheLife(PROP_FIRMS_CACHE_LIFETIME)
  cacheTag(PROP_FIRMS_CACHE_TAG)
  return _listPropFirms()
}

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
  const fallbackItems = Object.entries(propFirms)
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

  if (!hasConfiguredDatabaseConnection) {
    return fallbackItems
  }

  if (!(await isPrismaTableAvailable(PROP_FIRM_TABLE_NAME))) {
    return fallbackItems
  }

  if (isPrismaOperationCoolingDown(PROP_FIRMS_BANNER_ITEMS_COOLDOWN_KEY)) {
    return fallbackItems
  }

  try {
    return await withPrismaSchemaMismatchFallback(
      PROP_FIRMS_BANNER_ITEMS_COOLDOWN_KEY,
      async () => {
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
      },
      fallbackItems
    )
  } catch (error) {
    if (!isPropFirmDataUnavailableError(error)) {
      throw error
    }

    markPrismaTableUnavailable(PROP_FIRM_TABLE_NAME)
    markPrismaOperationSchemaMismatch(PROP_FIRMS_BANNER_ITEMS_COOLDOWN_KEY)
    logPropFirmFallback('listPropFirmBannerItems', error)
    return fallbackItems
  }
}

async function listPropFirmBannerItemsCached() {
  'use cache'
  cacheLife(PROP_FIRMS_CACHE_LIFETIME)
  cacheTag(PROP_FIRMS_CACHE_TAG)
  return _listPropFirmBannerItems()
}

const _getPropFirmBySlug = async (slug: string) => {
  if (!hasConfiguredDatabaseConnection) {
    return null
  }

  if (!(await isPrismaTableAvailable(PROP_FIRM_TABLE_NAME))) {
    return null
  }

  try {
    return await withPrismaSchemaMismatchFallback(
      `prop-firms-by-slug-${slug}`,
      async () =>
        prisma.propFirm.findUnique({
          where: { slug },
          include: {
            coupons: { where: { isActive: true } },
            reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
            _count: { select: { reviews: true, coupons: true } },
          },
        }),
      null
    )
  } catch (error) {
    if (!isPropFirmDataUnavailableError(error)) {
      throw error
    }

    markPrismaTableUnavailable(PROP_FIRM_TABLE_NAME)
    logPropFirmFallback('getPropFirmBySlug', error)
    return null
  }
}

async function getPropFirmBySlugCached(slug: string) {
  'use cache'
  cacheLife(PROP_FIRMS_CACHE_LIFETIME)
  cacheTag(PROP_FIRMS_CACHE_TAG, `prop-firm-${slug}`)
  return _getPropFirmBySlug(slug)
}

export async function listPropFirms() {
  return listPropFirmsCached()
}

export async function listPropFirmBannerItems() {
  return listPropFirmBannerItemsCached()
}

export async function getPropFirmBySlug(slug: string) {
  return getPropFirmBySlugCached(slug)
}

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
  description?: string
  challengeFee?: number
  drawdownType?: string
  payoutModel?: string
  platform?: string
  claimUrl?: string
  isActive?: boolean
  startsAt?: Date | null
  expiresAt?: Date | null
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
