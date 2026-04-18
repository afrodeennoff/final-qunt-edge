'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { buildPublicCouponWindowWhere } from '@/lib/prop-firms/coupon-visibility'
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
const PROP_FIRM_COUPON_TABLE_NAME = 'PropFirmCoupon'
const PROP_FIRM_REVIEW_TABLE_NAME = 'PropFirmReview'
const MAX_COUPON_CODE_LENGTH = 64
const ALLOWED_CLAIM_URL_PROTOCOLS = new Set(['http:', 'https:'])

// PropFirmCouponAdminError is in lib/errors.ts (not exportable from "use server")
import { PropFirmCouponAdminError } from '@/lib/errors'

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
    message.includes("can't reach database server") ||
    message.includes('timeout exceeded when trying to connect') ||
    message.includes('timed out when trying to connect')
  )
}

function logPropFirmFallback(source: string, error: unknown) {
  console.warn(`[PropFirms] Falling back in ${source}`, error)
}

function normalizeOptionalCouponText(value: string | null | undefined): string | null | undefined {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeOptionalCouponDate(value: Date | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null

  const normalized = new Date(value)
  if (Number.isNaN(normalized.getTime())) {
    throw new PropFirmCouponAdminError(
      'Use a valid start and expiry date before saving the coupon.',
    )
  }

  return normalized
}

function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

function normalizePropFirmCouponInput(data: PropFirmCouponInput): PropFirmCouponInput {
  const code = normalizeCouponCode(data.code)
  if (!code) {
    throw new PropFirmCouponAdminError('Coupon code is required.')
  }

  if (code.length > MAX_COUPON_CODE_LENGTH) {
    throw new PropFirmCouponAdminError(
      `Coupon code must be ${MAX_COUPON_CODE_LENGTH} characters or fewer.`,
    )
  }

  if (/\s/.test(code)) {
    throw new PropFirmCouponAdminError('Coupon code cannot contain spaces.')
  }

  const discountPercent = data.discountPercent ?? null
  if (
    discountPercent !== null &&
    (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100)
  ) {
    throw new PropFirmCouponAdminError('Discount percent must be between 0 and 100.')
  }

  const challengeFee = data.challengeFee ?? null
  if (challengeFee !== null && (!Number.isFinite(challengeFee) || challengeFee < 0)) {
    throw new PropFirmCouponAdminError('Challenge fee must be 0 or greater.')
  }

  const claimUrl = normalizeOptionalCouponText(data.claimUrl)
  if (claimUrl) {
    let parsedUrl: URL
    try {
      parsedUrl = new URL(claimUrl)
    } catch {
      throw new PropFirmCouponAdminError('Claim / affiliate URL must be a valid link.')
    }

    if (!ALLOWED_CLAIM_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      throw new PropFirmCouponAdminError('Claim / affiliate URL must start with http or https.')
    }
  }

  const startsAt = normalizeOptionalCouponDate(data.startsAt)
  const expiresAt = normalizeOptionalCouponDate(data.expiresAt)

  if (
    startsAt instanceof Date &&
    expiresAt instanceof Date &&
    startsAt.getTime() > expiresAt.getTime()
  ) {
    throw new PropFirmCouponAdminError('Start date must be earlier than expiry date.')
  }

  return {
    ...data,
    code,
    discountPercent,
    challengeFee,
    description: normalizeOptionalCouponText(data.description),
    drawdownType: normalizeOptionalCouponText(data.drawdownType),
    payoutModel: normalizeOptionalCouponText(data.payoutModel),
    platform: normalizeOptionalCouponText(data.platform),
    claimUrl,
    startsAt,
    expiresAt,
  }
}

async function assertCouponMutationAvailable() {
  if (!hasConfiguredDatabaseConnection) {
    throw new PropFirmCouponAdminError('Coupon editing requires a configured database connection.')
  }

  const couponTableAvailable = await isPrismaTableAvailable(PROP_FIRM_COUPON_TABLE_NAME)
  const firmTableAvailable = await isPrismaTableAvailable(PROP_FIRM_TABLE_NAME)

  if (!couponTableAvailable || !firmTableAvailable) {
    throw new PropFirmCouponAdminError(
      'Coupon editing is unavailable because the prop-firm schema is not ready.',
    )
  }
}

function toPropFirmCouponMutationError(error: unknown): Error {
  if (error instanceof PropFirmCouponAdminError) {
    return error
  }

  const maybeError = error as { code?: string }

  if (maybeError?.code === 'P2002') {
    return new PropFirmCouponAdminError('This prop firm already has a coupon with that code.')
  }

  if (maybeError?.code === 'P2003' || maybeError?.code === 'P2025') {
    return new PropFirmCouponAdminError(
      'The coupon or linked prop firm could not be found anymore.',
    )
  }

  if (isPrismaSchemaMismatchError(error)) {
    return new PropFirmCouponAdminError('The coupon schema is missing in the current database.')
  }

  if (isPropFirmDataUnavailableError(error)) {
    return new PropFirmCouponAdminError(
      'The coupon database is unavailable right now. Try again in a moment.',
    )
  }

  return error instanceof Error
    ? error
    : new PropFirmCouponAdminError('Unable to save coupon changes right now.')
}

// getPropFirmCouponAdminErrorMessage is in lib/errors.ts (not exportable from "use server")
// getPropFirmCouponAdminErrorMessage moved to lib/errors.ts

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
    const now = new Date()

    return await prisma.propFirm.findMany({
      where: { isActive: true },
      include: {
        coupons: {
          where: {
            isActive: true,
            ...buildPublicCouponWindowWhere(now),
          },
        },
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

function toBannerBadge(coupon?: {
  code: string
  discountPercent: number | null
}): Pick<PropFirmBannerItem, 'badge' | 'type'> {
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
                ...buildPublicCouponWindowWhere(now),
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
      fallbackItems,
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
    const now = new Date()

    return await withPrismaSchemaMismatchFallback(
      `prop-firms-by-slug-${slug}`,
      async () =>
        prisma.propFirm.findUnique({
          where: { slug },
          include: {
            coupons: {
              where: {
                isActive: true,
                ...buildPublicCouponWindowWhere(now),
              },
            },
            reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
            _count: { select: { reviews: true, coupons: true } },
          },
        }),
      null,
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

// ---------------------------------------------------------------------------
// Prop firm validation
// ---------------------------------------------------------------------------

const SLUG_PATTERN = /^[a-z0-9-]+$/
const HTTP_URL_PATTERN = /^https?:\/\/.+/

async function assertPropFirmMutationAvailable(): Promise<void> {
  if (!hasConfiguredDatabaseConnection) {
    throw new PropFirmCouponAdminError(
      'Database connection is not available. Please try again later.',
    )
  }
  if (!(await isPrismaTableAvailable(PROP_FIRM_TABLE_NAME))) {
    throw new PropFirmCouponAdminError('PropFirm table is not available. Please try again later.')
  }
}

async function assertPropFirmReviewMutationAvailable(): Promise<void> {
  await assertPropFirmMutationAvailable()

  if (!(await isPrismaTableAvailable(PROP_FIRM_REVIEW_TABLE_NAME))) {
    throw new PropFirmCouponAdminError(
      'PropFirmReview table is not available. Please try again later.',
    )
  }
}

function normalizePropFirmInput(data: PropFirmCreateInput | PropFirmUpdateInput) {
  const name = data.name?.trim()
  if (!name || name.length === 0) {
    throw new PropFirmCouponAdminError('Firm name is required.')
  }
  if (name.length > 200) {
    throw new PropFirmCouponAdminError('Firm name must be 200 characters or fewer.')
  }

  const slug = data.slug?.trim().toLowerCase()
  if (!slug || slug.length === 0) {
    throw new PropFirmCouponAdminError('Slug is required.')
  }
  if (slug.length > 100) {
    throw new PropFirmCouponAdminError('Slug must be 100 characters or fewer.')
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new PropFirmCouponAdminError(
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    )
  }

  if (data.referralUrl && data.referralUrl.trim() !== '') {
    const url = data.referralUrl.trim()
    if (!HTTP_URL_PATTERN.test(url)) {
      throw new PropFirmCouponAdminError('Referral URL must start with http:// or https://.')
    }
  }

  if (data.logoUrl && data.logoUrl.trim() !== '') {
    const url = data.logoUrl.trim()
    if (!HTTP_URL_PATTERN.test(url)) {
      throw new PropFirmCouponAdminError('Logo URL must start with http:// or https://.')
    }
  }

  if (data.description && data.description.length > 2000) {
    throw new PropFirmCouponAdminError('Description must be 2000 characters or fewer.')
  }

  return {
    ...data,
    name,
    slug,
    referralUrl: data.referralUrl?.trim() || undefined,
    logoUrl: data.logoUrl?.trim() || undefined,
    description: data.description?.trim() || undefined,
    platform: data.platform?.trim() || undefined,
  }
}

function normalizePropFirmReviewInput(data: PropFirmReviewInput) {
  const title = data.title?.trim()
  if (!title || title.length === 0) {
    throw new PropFirmCouponAdminError('Review title is required.')
  }
  if (title.length > 200) {
    throw new PropFirmCouponAdminError('Review title must be 200 characters or fewer.')
  }

  const content = data.content?.trim()
  if (!content || content.length === 0) {
    throw new PropFirmCouponAdminError('Review content is required.')
  }
  if (content.length > 5000) {
    throw new PropFirmCouponAdminError('Review content must be 5000 characters or fewer.')
  }

  const rating = Number(data.rating)
  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    throw new PropFirmCouponAdminError('Rating must be between 0 and 5.')
  }

  return {
    ...data,
    title,
    content,
    rating,
  }
}

export async function createPropFirm(data: PropFirmCreateInput) {
  await assertAdminAccess()
  await assertPropFirmMutationAvailable()
  const normalized = normalizePropFirmInput(data)
  const result = await prisma.propFirm.create({ data: normalized })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

export async function updatePropFirm(id: string, data: PropFirmUpdateInput) {
  await assertAdminAccess()
  await assertPropFirmMutationAvailable()
  const normalized = normalizePropFirmInput(data)
  const result = await prisma.propFirm.update({ where: { id }, data: normalized })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

/** @deprecated Use softDeletePropFirm instead. Hard deletes cascade to all related data. */
export async function deletePropFirm(id: string) {
  await assertAdminAccess()
  const result = await prisma.propFirm.delete({ where: { id } })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

export async function softDeletePropFirm(id: string) {
  await assertAdminAccess()
  await assertPropFirmMutationAvailable()
  const result = await prisma.propFirm.update({
    where: { id },
    data: { isActive: false },
  })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
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
  await assertPropFirmReviewMutationAvailable()
  const normalized = normalizePropFirmReviewInput(data)
  const result = await prisma.propFirmReview.create({
    data: { propFirmId, ...normalized },
  })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

export async function updatePropFirmReview(id: string, data: PropFirmReviewInput) {
  await assertAdminAccess()
  await assertPropFirmReviewMutationAvailable()
  const normalized = normalizePropFirmReviewInput(data)
  const result = await prisma.propFirmReview.update({
    where: { id },
    data: normalized,
  })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

export async function deletePropFirmReview(id: string) {
  await assertAdminAccess()
  await assertPropFirmReviewMutationAvailable()
  const result = await prisma.propFirmReview.delete({ where: { id } })
  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  return result
}

export type PropFirmCouponInput = {
  code: string
  discountPercent?: number | null
  description?: string | null
  challengeFee?: number | null
  drawdownType?: string | null
  payoutModel?: string | null
  platform?: string | null
  claimUrl?: string | null
  isActive?: boolean
  startsAt?: Date | null
  expiresAt?: Date | null
}

export async function createPropFirmCoupon(propFirmId: string, data: PropFirmCouponInput) {
  await assertAdminAccess()
  await assertCouponMutationAvailable()

  const normalizedData = normalizePropFirmCouponInput(data)

  let result
  try {
    result = await prisma.propFirmCoupon.create({
      data: { propFirmId, ...normalizedData },
    })
  } catch (error) {
    throw toPropFirmCouponMutationError(error)
  }

  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  updateTag('firm-coupons')
  updateTag(`prop-firm-${propFirmId}`)
  return result
}

export async function updatePropFirmCoupon(id: string, data: PropFirmCouponInput) {
  await assertAdminAccess()
  await assertCouponMutationAvailable()

  const normalizedData = normalizePropFirmCouponInput(data)

  let result
  try {
    result = await prisma.propFirmCoupon.update({
      where: { id },
      data: normalizedData,
    })
  } catch (error) {
    throw toPropFirmCouponMutationError(error)
  }

  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  updateTag('firm-coupons')
  if (result.propFirmId) {
    updateTag(`prop-firm-${result.propFirmId}`)
  }
  return result
}

export async function deletePropFirmCoupon(id: string) {
  await assertAdminAccess()
  await assertCouponMutationAvailable()

  // Look up the coupon first to get propFirmId for cache invalidation
  let propFirmId: string | undefined
  try {
    const existing = await prisma.propFirmCoupon.findUnique({
      where: { id },
      select: { propFirmId: true },
    })
    propFirmId = existing?.propFirmId
  } catch {
    // Continue - best effort lookup
  }

  let result
  try {
    result = await prisma.propFirmCoupon.delete({ where: { id } })
  } catch (error) {
    throw toPropFirmCouponMutationError(error)
  }

  updateTag('prop-firms')
  updateTag('deals')
  updateTag('prop-firms-catalogue')
  updateTag('firm-coupons')
  if (propFirmId) {
    updateTag(`prop-firm-${propFirmId}`)
  }
  return result
}
