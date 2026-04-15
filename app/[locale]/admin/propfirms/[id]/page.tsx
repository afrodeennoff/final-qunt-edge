import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import {
  createPropFirm,
  updatePropFirm,
  createPropFirmReview,
  updatePropFirmReview,
  deletePropFirmReview,
  createPropFirmCoupon,
  updatePropFirmCoupon,
  deletePropFirmCoupon,
} from '@/server/prop-firms'
import { assertAdminAccess } from '@/server/authz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

type PropFirmData = {
  id: string
  slug: string
  name: string
  category: string | null
  description: string | null
  shortDesc: string | null
  platform: string | null
  payoutModel: string | null
  drawdownType: string | null
  profitSplit: string | null
  maxAllocation: string | null
  referralUrl: string | null
  logoUrl: string | null
  isActive: boolean
  reviews: {
    id: string
    rating: number
    title: string | null
    content: string | null
    isVerified: boolean
    createdAt: Date
  }[]
  coupons: {
    id: string
    code: string
    description: string | null
    discountPercent: number | null
    challengeFee: number | null
    drawdownType: string | null
    payoutModel: string | null
    platform: string | null
    claimUrl: string | null
    isActive: boolean
    startsAt: Date | null
    expiresAt: Date | null
    createdAt: Date
  }[]
}

interface ReviewsSectionProps {
  firm: PropFirmData
  locale: string
  onCreateReview: (formData: FormData) => Promise<void>
  onUpdateReview: (formData: FormData) => Promise<void>
  onDeleteReview: (formData: FormData) => Promise<void>
}

interface CouponsSectionProps {
  firm: PropFirmData
  locale: string
  onCreateCoupon: (formData: FormData) => Promise<void>
  onUpdateCoupon: (formData: FormData) => Promise<void>
  onDeleteCoupon: (formData: FormData) => Promise<void>
}

function normalizeOptionalText(value: FormDataEntryValue | null): string | undefined {
  const text = value?.toString().trim()
  return text ? text : undefined
}

function requireText(value: FormDataEntryValue | null, fallback = ''): string {
  return value?.toString().trim() || fallback
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = value?.toString().trim()
  if (!text) return undefined
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

function buildFallbackFirm(id: string): PropFirmData | null {
  const fallbackKey = id.startsWith('fallback-') ? id.slice('fallback-'.length) : id
  const firm = propFirms[fallbackKey]
  if (!firm) return null
  const profile = getVerifiedPropFirmProfileByName(firm.name)

  return {
    id,
    slug: profile?.slug ?? fallbackKey,
    name: firm.name,
    category: profile?.category ?? 'Futures',
    description: profile?.shortDesc ?? null,
    shortDesc: profile?.shortDesc ?? null,
    platform: profile?.platform ?? null,
    payoutModel: profile?.payoutModel ?? null,
    drawdownType: profile?.drawdownType ?? null,
    profitSplit: profile?.profitSplit ?? null,
    maxAllocation: profile?.maxAllocation ?? null,
    referralUrl: profile?.referralUrl ?? null,
    logoUrl: null,
    isActive: true,
    reviews: [],
    coupons: [],
  }
}

// This page intentionally co-locates the related server actions for one admin workflow.
// eslint-disable-next-line complexity
export default async function PropFirmEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  await assertAdminAccess()
  const { locale, id } = await params
  const isNew = id === 'new'

  let firm: PropFirmData | null = null
  if (!isNew) {
    firm = hasConfiguredDatabaseConnection
      ? await prisma.propFirm.findUnique({
          where: { id },
          include: {
            reviews: { orderBy: { createdAt: 'desc' } },
            coupons: { orderBy: { createdAt: 'desc' } },
          },
        })
      : buildFallbackFirm(id)
    if (!firm) {
      notFound()
    }
  }

  async function handleAction(formData: FormData) {
    'use server'
    const firmId = formData.get('id')?.toString()
    const isUpdating = firmId && firmId !== 'new'

    const data = {
      name: requireText(formData.get('name')),
      slug: requireText(formData.get('slug')),
      category: requireText(formData.get('category')),
      description: normalizeOptionalText(formData.get('description')),
      shortDesc: normalizeOptionalText(formData.get('shortDesc')),
      platform: normalizeOptionalText(formData.get('platform')),
      payoutModel: normalizeOptionalText(formData.get('payoutModel')),
      drawdownType: normalizeOptionalText(formData.get('drawdownType')),
      profitSplit: normalizeOptionalText(formData.get('profitSplit')),
      maxAllocation: normalizeOptionalText(formData.get('maxAllocation')),
      referralUrl: normalizeOptionalText(formData.get('referralUrl')),
      logoUrl: normalizeOptionalText(formData.get('logoUrl')),
      isActive: formData.has('isActive'),
    }

    if (isUpdating) {
      await updatePropFirm(firmId!, data)
    } else {
      await createPropFirm(data)
    }

    redirect(`/${locale}/admin/propfirms`)
  }

  async function handleCreateReview(formData: FormData) {
    'use server'
    const propFirmId = formData.get('propFirmId') as string
    await createPropFirmReview(propFirmId, {
      rating: Number.parseInt(requireText(formData.get('rating'), '0'), 10),
      title: normalizeOptionalText(formData.get('title')),
      content: normalizeOptionalText(formData.get('content')),
      isVerified: formData.has('isVerified'),
    })
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  async function handleUpdateReview(formData: FormData) {
    'use server'
    const reviewId = formData.get('reviewId') as string
    const propFirmId = formData.get('propFirmId') as string
    await updatePropFirmReview(reviewId, {
      rating: Number.parseInt(requireText(formData.get('rating'), '0'), 10),
      title: normalizeOptionalText(formData.get('title')),
      content: normalizeOptionalText(formData.get('content')),
      isVerified: formData.has('isVerified'),
    })
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  async function handleDeleteReview(formData: FormData) {
    'use server'
    const reviewId = formData.get('reviewId') as string
    const propFirmId = formData.get('propFirmId') as string
    await deletePropFirmReview(reviewId)
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  function parseOptionalDate(value: FormDataEntryValue | null): Date | null | undefined {
    const text = value?.toString().trim()
    if (!text) return undefined
    const parsed = new Date(text)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  async function handleCreateCoupon(formData: FormData) {
    'use server'
    const propFirmId = formData.get('propFirmId') as string
    await createPropFirmCoupon(propFirmId, {
      code: requireText(formData.get('code')),
      discountPercent: parseOptionalNumber(formData.get('discountPercent')),
      description: normalizeOptionalText(formData.get('description')),
      challengeFee: parseOptionalNumber(formData.get('challengeFee')),
      drawdownType: normalizeOptionalText(formData.get('drawdownType')),
      payoutModel: normalizeOptionalText(formData.get('payoutModel')),
      platform: normalizeOptionalText(formData.get('platform')),
      claimUrl: normalizeOptionalText(formData.get('claimUrl')),
      isActive: formData.has('couponIsActive'),
      startsAt: parseOptionalDate(formData.get('startsAt')),
      expiresAt: parseOptionalDate(formData.get('expiresAt')),
    })
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  async function handleUpdateCoupon(formData: FormData) {
    'use server'
    const couponId = formData.get('couponId') as string
    const propFirmId = formData.get('propFirmId') as string
    await updatePropFirmCoupon(couponId, {
      code: requireText(formData.get('code')),
      discountPercent: parseOptionalNumber(formData.get('discountPercent')),
      description: normalizeOptionalText(formData.get('description')),
      challengeFee: parseOptionalNumber(formData.get('challengeFee')),
      drawdownType: normalizeOptionalText(formData.get('drawdownType')),
      payoutModel: normalizeOptionalText(formData.get('payoutModel')),
      platform: normalizeOptionalText(formData.get('platform')),
      claimUrl: normalizeOptionalText(formData.get('claimUrl')),
      isActive: formData.has('couponIsActive'),
      startsAt: parseOptionalDate(formData.get('startsAt')),
      expiresAt: parseOptionalDate(formData.get('expiresAt')),
    })
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  async function handleDeleteCoupon(formData: FormData) {
    'use server'
    const couponId = formData.get('couponId') as string
    const propFirmId = formData.get('propFirmId') as string
    await deletePropFirmCoupon(couponId)
    redirect(`/${locale}/admin/propfirms/${propFirmId}`)
  }

  const fieldClass = 'grid gap-2'

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button  variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/admin/propfirms`}>← Back</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? 'Add Prop Firm' : 'Edit Prop Firm'}
        </h1>
      </div>

      <form action={handleAction}>
        <Card>
          <CardHeader>
            <CardTitle>Firm Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {firm && <input type="hidden" name="id" value={id} />}

            <div className={fieldClass}>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={firm?.name ?? ''} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={fieldClass}>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={firm?.slug ?? ''} required />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={firm?.category ?? ''} placeholder="Futures, Forex, Crypto..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={fieldClass}>
                <Label htmlFor="platform">Platform</Label>
                <Input id="platform" name="platform" defaultValue={firm?.platform ?? ''} />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="payoutModel">Payout Model</Label>
                <Input id="payoutModel" name="payoutModel" defaultValue={firm?.payoutModel ?? ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={fieldClass}>
                <Label htmlFor="drawdownType">Drawdown Type</Label>
                <Input id="drawdownType" name="drawdownType" defaultValue={firm?.drawdownType ?? ''} />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="profitSplit">Profit Split</Label>
                <Input id="profitSplit" name="profitSplit" defaultValue={firm?.profitSplit ?? ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={fieldClass}>
                <Label htmlFor="maxAllocation">Max Allocation</Label>
                <Input id="maxAllocation" name="maxAllocation" defaultValue={firm?.maxAllocation ?? ''} />
              </div>
              <div className={fieldClass}>
                <Label htmlFor="referralUrl">Referral URL</Label>
                <Input id="referralUrl" name="referralUrl" type="url" defaultValue={firm?.referralUrl ?? ''} />
              </div>
            </div>

            <div className={fieldClass}>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" name="logoUrl" type="url" defaultValue={firm?.logoUrl ?? ''} />
            </div>

            <div className={fieldClass}>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={firm?.description ?? ''}
              />
            </div>

            <div className={fieldClass}>
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input id="shortDesc" name="shortDesc" defaultValue={firm?.shortDesc ?? ''} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                value="1"
                defaultChecked={firm?.isActive ?? true}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">Active</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Inactive firms are hidden from public catalogue pages and the rolling prop-firm banner.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button  variant="outline" asChild>
                <Link href={`/${locale}/admin/propfirms`}>Cancel</Link>
              </Button>
              <Button  type="submit">{isNew ? 'Create' : 'Save Changes'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {!isNew && firm && (
        <>
          <ReviewsSection
            firm={firm}
            locale={locale}
            onCreateReview={handleCreateReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />

          <CouponsSection
            firm={firm}
            locale={locale}
            onCreateCoupon={handleCreateCoupon}
            onUpdateCoupon={handleUpdateCoupon}
            onDeleteCoupon={handleDeleteCoupon}
          />
        </>
      )}
    </div>
  )
}

function ReviewsSection({
  firm,
  onCreateReview,
  onUpdateReview,
  onDeleteReview,
}: ReviewsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reviews ({firm.reviews.length})</CardTitle>
        <form action={onCreateReview}>
          <input type="hidden" name="propFirmId" value={firm.id} />
          <div className="flex items-center gap-2">
            <Input name="title" placeholder="Review title" className="w-40" />
            <Input name="rating" type="number" min="0" max="5" placeholder="Rating" className="w-20" />
            <Input name="content" placeholder="Content" className="w-60" />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="isVerified" className="h-4 w-4 rounded border-input accent-primary" />
              Verified
            </label>
            <Button  type="submit" size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </form>
      </CardHeader>
      <CardContent>
        {firm.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {firm.reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.6]">
                <div className="flex-1 gap-2">
                  <form action={onUpdateReview} className="space-y-2">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="propFirmId" value={firm.id} />
                    <div className="flex items-center gap-2">
                      <Input name="title" defaultValue={review.title ?? ''} placeholder="Title" className="w-40" />
                      <Input name="rating" type="number" min="0" max="5" defaultValue={review.rating} className="w-20" />
                      <label className="flex items-center gap-1 text-sm">
                        <input type="checkbox" name="isVerified" defaultChecked={review.isVerified} className="h-4 w-4 rounded border-input accent-primary" />
                        Verified
                      </label>
                      <Button  type="submit" size="sm" variant="outline">Save</Button>
                    </div>
                    <Textarea
                      name="content"
                      defaultValue={review.content ?? ''}
                      placeholder="Review content"
                      rows={2}
                    />
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <form action={onDeleteReview}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input type="hidden" name="propFirmId" value={firm.id} />
                  <Button  type="submit" size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CouponsSection({
  firm,
  onCreateCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
}: CouponsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Coupons ({firm.coupons.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new coupon form */}
        <form action={onCreateCoupon} className="space-y-4 rounded-lg border border-white/[0.6] p-4">
          <input type="hidden" name="propFirmId" value={firm.id} />
          <p className="text-sm font-medium">Add New Coupon</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="new-code">Code *</Label>
              <Input id="new-code" name="code" placeholder="SAVE20" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-discount">Discount %</Label>
              <Input id="new-discount" name="discountPercent" type="number" step="0.01" placeholder="20" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-fee">Challenge Fee</Label>
              <Input id="new-fee" name="challengeFee" type="number" step="0.01" placeholder="149" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-claim">Claim / Affiliate URL</Label>
              <Input id="new-claim" name="claimUrl" type="url" placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-desc">Description</Label>
            <Input id="new-desc" name="description" placeholder="20% off all challenges" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="new-platform">Platform Override</Label>
              <Input id="new-platform" name="platform" placeholder="Auto" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-payout">Payout Override</Label>
              <Input id="new-payout" name="payoutModel" placeholder="Auto" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-dd">Drawdown Override</Label>
              <Input id="new-dd" name="drawdownType" placeholder="Auto" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="new-starts">Starts At</Label>
              <Input id="new-starts" name="startsAt" type="datetime-local" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-expires">Expires At</Label>
              <Input id="new-expires" name="expiresAt" type="datetime-local" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="new-active"
              name="couponIsActive"
              value="1"
              defaultChecked
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="new-active" className="font-normal cursor-pointer">Active</Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Coupon
            </Button>
          </div>
        </form>

        {/* Existing coupons */}
        {firm.coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No coupons yet.</p>
        ) : (
          <div className="space-y-4">
            {firm.coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-start gap-3 p-4 rounded-lg border border-white/[0.6]">
                <div className="flex-1 gap-2">
                  <form action={onUpdateCoupon} className="space-y-3">
                    <input type="hidden" name="couponId" value={coupon.id} />
                    <input type="hidden" name="propFirmId" value={firm.id} />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Code *</Label>
                        <Input name="code" defaultValue={coupon.code} placeholder="Code" required />
                      </div>
                      <div className="space-y-1">
                        <Label>Discount %</Label>
                        <Input name="discountPercent" type="number" step="0.01" defaultValue={coupon.discountPercent ?? ''} placeholder="0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Challenge Fee</Label>
                        <Input name="challengeFee" type="number" step="0.01" defaultValue={coupon.challengeFee ?? ''} placeholder="149" />
                      </div>
                      <div className="space-y-1">
                        <Label>Claim / Affiliate URL</Label>
                        <Input name="claimUrl" type="url" defaultValue={coupon.claimUrl ?? ''} placeholder="https://..." />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Input name="description" defaultValue={coupon.description ?? ''} placeholder="Coupon description" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Platform Override</Label>
                        <Input name="platform" defaultValue={coupon.platform ?? ''} placeholder="Auto" />
                      </div>
                      <div className="space-y-1">
                        <Label>Payout Override</Label>
                        <Input name="payoutModel" defaultValue={coupon.payoutModel ?? ''} placeholder="Auto" />
                      </div>
                      <div className="space-y-1">
                        <Label>Drawdown Override</Label>
                        <Input name="drawdownType" defaultValue={coupon.drawdownType ?? ''} placeholder="Auto" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Starts At</Label>
                        <Input
                          name="startsAt"
                          type="datetime-local"
                          defaultValue={coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : ''}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Expires At</Label>
                        <Input
                          name="expiresAt"
                          type="datetime-local"
                          defaultValue={coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="couponIsActive"
                          value="1"
                          defaultChecked={coupon.isActive}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <Button type="submit" size="sm" variant="outline">Save</Button>
                    </div>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(coupon.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <form action={onDeleteCoupon}>
                  <input type="hidden" name="couponId" value={coupon.id} />
                  <input type="hidden" name="propFirmId" value={firm.id} />
                  <Button  type="submit" size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
