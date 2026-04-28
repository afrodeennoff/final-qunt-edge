import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getSpotlightCouponSuggestionForFirm } from '@/lib/prop-firms/spotlight-coupon-suggestions'
import { getPropFirmAdminPageState } from '@/lib/prop-firms/admin-state'
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
import { getPropFirmCouponAdminErrorMessage } from '@/lib/errors'
import { assertAdminAccess } from '@/server/authz'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Eye, Plus, Trash2 } from 'lucide-react'
import { AdminStatCard } from '../../components/admin-surface'
import {
  buildCouponAdminRedirectUrl,
  formatAdminDateTimeInput,
  getCouponAdminNotice,
  getFirmAdminNotice,
  getCouponTimingState,
} from '../../components/coupon-admin-utils'
import { FormActionButton } from '../../components/form-action-button'
import {
  requireText,
  parseOptionalNumber,
  normalizeOptionalText,
  normalizeOptionalTextForUpdate,
  parseOptionalDate,
  parseOptionalNumberForUpdate,
  requireFormString,
} from '../../lib/admin-form-helpers'

// ---------------------------------------------------------------------------
// Server actions (module scope — read locale from FormData, not closure)
// ---------------------------------------------------------------------------

async function handleAction(formData: FormData) {
  'use server'
  const locale = requireFormString(formData, 'locale')
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
    try {
      const result = await updatePropFirm(firmId!, data)
      redirect(`/${locale}/admin/propfirms/${result.id}?firmStatus=saved`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save the prop firm.'
      redirect(
        `/${locale}/admin/propfirms/${firmId}?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
      )
    }
  } else {
    try {
      const result = await createPropFirm(data)
      redirect(`/${locale}/admin/propfirms/${result.id}?firmStatus=saved`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create the prop firm.'
      redirect(
        `/${locale}/admin/propfirms/new?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
      )
    }
  }
}

async function handleCreateReview(formData: FormData) {
  'use server'
  const propFirmId = requireFormString(formData, 'propFirmId')
  const locale = requireFormString(formData, 'locale')
  try {
    await createPropFirmReview(propFirmId, {
      rating: Number.parseInt(requireText(formData.get('rating'), '0'), 10),
      title: normalizeOptionalText(formData.get('title')),
      content: normalizeOptionalText(formData.get('content')),
      isVerified: formData.has('isVerified'),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create the review.'
    redirect(
      `/${locale}/admin/propfirms/${propFirmId}?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
    )
  }
  redirect(`/${locale}/admin/propfirms/${propFirmId}?firmStatus=saved`)
}

async function handleUpdateReview(formData: FormData) {
  'use server'
  const reviewId = requireFormString(formData, 'reviewId')
  const propFirmId = requireFormString(formData, 'propFirmId')
  const locale = requireFormString(formData, 'locale')
  try {
    await updatePropFirmReview(reviewId, {
      rating: Number.parseInt(requireText(formData.get('rating'), '0'), 10),
      title: normalizeOptionalText(formData.get('title')),
      content: normalizeOptionalText(formData.get('content')),
      isVerified: formData.has('isVerified'),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update the review.'
    redirect(
      `/${locale}/admin/propfirms/${propFirmId}?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
    )
  }
  redirect(`/${locale}/admin/propfirms/${propFirmId}?firmStatus=saved`)
}

async function handleDeleteReview(formData: FormData) {
  'use server'
  const reviewId = requireFormString(formData, 'reviewId')
  const propFirmId = requireFormString(formData, 'propFirmId')
  const locale = requireFormString(formData, 'locale')
  try {
    await deletePropFirmReview(reviewId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete the review.'
    redirect(
      `/${locale}/admin/propfirms/${propFirmId}?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
    )
  }
  redirect(`/${locale}/admin/propfirms/${propFirmId}?firmStatus=deleted`)
}

async function handleCreateCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')
  const fallbackPropFirmId = requireText(formData.get('propFirmId'))

  try {
    const propFirmId = requireFormString(formData, 'propFirmId')
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
  } catch (error) {
    redirect(
      buildCouponAdminRedirectUrl(
        `/${locale}/admin/propfirms/${fallbackPropFirmId}`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(
    buildCouponAdminRedirectUrl(`/${locale}/admin/propfirms/${fallbackPropFirmId}`, 'created'),
  )
}

async function handleUpdateCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')
  const fallbackPropFirmId = requireText(formData.get('propFirmId'))
  let propFirmId = fallbackPropFirmId

  try {
    const couponId = requireFormString(formData, 'couponId')
    propFirmId = requireFormString(formData, 'propFirmId')
    await updatePropFirmCoupon(couponId, {
      code: requireText(formData.get('code')),
      discountPercent: parseOptionalNumberForUpdate(formData.get('discountPercent')),
      description: normalizeOptionalTextForUpdate(formData.get('description')),
      challengeFee: parseOptionalNumberForUpdate(formData.get('challengeFee')),
      drawdownType: normalizeOptionalTextForUpdate(formData.get('drawdownType')),
      payoutModel: normalizeOptionalTextForUpdate(formData.get('payoutModel')),
      platform: normalizeOptionalTextForUpdate(formData.get('platform')),
      claimUrl: normalizeOptionalTextForUpdate(formData.get('claimUrl')),
      isActive: formData.has('couponIsActive'),
      startsAt: parseOptionalDate(formData.get('startsAt')),
      expiresAt: parseOptionalDate(formData.get('expiresAt')),
    })
  } catch (error) {
    redirect(
      buildCouponAdminRedirectUrl(
        `/${locale}/admin/propfirms/${fallbackPropFirmId}`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(buildCouponAdminRedirectUrl(`/${locale}/admin/propfirms/${propFirmId}`, 'updated'))
}

async function handleDeleteCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')
  const fallbackPropFirmId = requireText(formData.get('propFirmId'))
  let propFirmId = fallbackPropFirmId

  try {
    const couponId = requireFormString(formData, 'couponId')
    propFirmId = requireFormString(formData, 'propFirmId')
    await deletePropFirmCoupon(couponId)
  } catch (error) {
    redirect(
      buildCouponAdminRedirectUrl(
        `/${locale}/admin/propfirms/${fallbackPropFirmId}`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(buildCouponAdminRedirectUrl(`/${locale}/admin/propfirms/${propFirmId}`, 'deleted'))
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

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

function FormFieldGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border/30 bg-background/40 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page (Server Component — no function props passed to client boundaries)
// ---------------------------------------------------------------------------

// eslint-disable-next-line complexity
export default async function PropFirmEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await assertAdminAccess()
  await connection()
  const { locale, id } = await params
  const couponNotice = getCouponAdminNotice(await searchParams)
  const firmNotice = getFirmAdminNotice(await searchParams)
  const notice = firmNotice ?? couponNotice
  const isNew = id === 'new'

  let firm: PropFirmData | null = null
  if (!isNew) {
    if (hasConfiguredDatabaseConnection) {
      try {
        firm = await prisma.propFirm.findUnique({
          where: { id },
          include: {
            reviews: { orderBy: { createdAt: 'desc' } },
            coupons: { orderBy: { createdAt: 'desc' } },
          },
        })
      } catch (error) {
        console.warn('[Admin PropFirm] DB error loading firm:', error)
        firm = buildFallbackFirm(id)
      }
    } else {
      firm = buildFallbackFirm(id)
    }
    if (!firm) {
      notFound()
    }
  }

  const pageState = getPropFirmAdminPageState({
    hasConfiguredDatabaseConnection,
    firmId: firm?.id ?? (isNew ? null : id),
  })

  const fieldClass = 'grid gap-2'

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link href={`/${locale}/admin/propfirms`}>← Back to firms</Link>
          </Button>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {isNew ? 'Add Prop Firm' : (firm?.name ?? 'Edit Prop Firm')}
              </h1>
              {!isNew && firm ? (
                <Badge variant={firm.isActive ? 'default' : 'secondary'}>
                  {firm.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ) : null}
              {pageState.isReadOnly ? <Badge variant="outline">Read-only</Badge> : null}
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Edit the firm profile, manage reviews, and keep coupon data aligned with the public
              deals surfaces from one workspace.
            </p>
          </div>
        </div>

        {!isNew && firm ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/firm/${firm.slug}`}>
                <Eye className="h-4 w-4" />
                Public page
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {notice ? (
        <Alert variant={notice.variant}>
          {notice.variant === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.description}</AlertDescription>
        </Alert>
      ) : null}

      {pageState.isReadOnly ? (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Prop-firm workspace is read-only</AlertTitle>
          <AlertDescription>
            {pageState.isFallbackRecord
              ? 'This page is rendering fallback/reference firm data, so save and delete actions are disabled until a live database record is available again.'
              : 'The database connection is not configured in this environment, so firm, review, and coupon mutations are disabled until the live schema is connected.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {!isNew && firm ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminStatCard label="Reviews" value={firm.reviews.length.toString()} />
          <AdminStatCard label="Coupons" value={firm.coupons.length.toString()} />
          <AdminStatCard
            label="Workspace mode"
            value={pageState.isReadOnly ? 'Read-only' : 'Editable'}
            hint={
              pageState.isReadOnly ? 'Fallback or DB unavailable' : 'Live admin schema connected'
            }
          />
        </div>
      ) : null}

      <form action={handleAction}>
        <Card
          variant="frost"
          className="border-border/45 bg-background/72 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]"
        >
          <CardHeader className="space-y-1 border-b border-border/30">
            <CardTitle>Firm details</CardTitle>
            <p className="text-sm text-muted-foreground">
              These fields drive the public catalogue, firm detail page, and admin suggestion
              matching.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            {firm && <input type="hidden" name="id" value={id} />}
            <fieldset disabled={!pageState.canManageFirm} className="space-y-4">
              <FormFieldGroup
                title="Identity"
                description="Core details that control how the firm appears in the catalogue and routing."
              >
                <div className={fieldClass}>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={firm?.name ?? ''} required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={fieldClass}>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={firm?.slug ?? ''} required />
                  </div>
                  <div className={fieldClass}>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={firm?.category ?? ''}
                      placeholder="Futures, Forex, Crypto..."
                    />
                  </div>
                </div>

                <div className={fieldClass}>
                  <Label htmlFor="shortDesc">Short description</Label>
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
                  <Label htmlFor="isActive" className="cursor-pointer font-normal">
                    Active
                  </Label>
                </div>
              </FormFieldGroup>

              <FormFieldGroup
                title="Commercial profile"
                description="Platform, payout, and funding terms used across the firm detail and deals surfaces."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={fieldClass}>
                    <Label htmlFor="platform">Platform</Label>
                    <Input id="platform" name="platform" defaultValue={firm?.platform ?? ''} />
                  </div>
                  <div className={fieldClass}>
                    <Label htmlFor="payoutModel">Payout model</Label>
                    <Input
                      id="payoutModel"
                      name="payoutModel"
                      defaultValue={firm?.payoutModel ?? ''}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={fieldClass}>
                    <Label htmlFor="drawdownType">Drawdown type</Label>
                    <Input
                      id="drawdownType"
                      name="drawdownType"
                      defaultValue={firm?.drawdownType ?? ''}
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label htmlFor="profitSplit">Profit split</Label>
                    <Input
                      id="profitSplit"
                      name="profitSplit"
                      defaultValue={firm?.profitSplit ?? ''}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={fieldClass}>
                    <Label htmlFor="maxAllocation">Max allocation</Label>
                    <Input
                      id="maxAllocation"
                      name="maxAllocation"
                      defaultValue={firm?.maxAllocation ?? ''}
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label htmlFor="referralUrl">Referral URL</Label>
                    <Input
                      id="referralUrl"
                      name="referralUrl"
                      type="url"
                      defaultValue={firm?.referralUrl ?? ''}
                    />
                  </div>
                </div>
              </FormFieldGroup>

              <FormFieldGroup
                title="Copy and media"
                description="Public-facing copy and branding assets used on firm pages."
              >
                <div className={fieldClass}>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    defaultValue={firm?.logoUrl ?? ''}
                  />
                </div>

                <div className={fieldClass}>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={5}
                    defaultValue={firm?.description ?? ''}
                  />
                </div>
              </FormFieldGroup>
            </fieldset>

            <p className="text-xs text-muted-foreground">
              Inactive firms are hidden from public catalogue pages and the rolling prop-firm
              banner.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/admin/propfirms`}>Cancel</Link>
              </Button>
              <FormActionButton type="submit" disabled={!pageState.canManageFirm}>
                {isNew ? 'Create firm' : 'Save changes'}
              </FormActionButton>
            </div>
          </CardContent>
        </Card>
      </form>

      {!isNew && firm && (
        <>
          <ReviewsSection
            firm={firm}
            locale={locale}
            canManageReviews={pageState.canManageReviews}
          />
          <CouponsSection
            firm={firm}
            locale={locale}
            canManageCoupons={pageState.canManageCoupons}
          />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section components (Server Components — use module-scope actions directly)
// ---------------------------------------------------------------------------

function ReviewsSection({
  firm,
  locale,
  canManageReviews,
}: {
  firm: PropFirmData
  locale: string
  canManageReviews: boolean
}) {
  return (
    <Card
      variant="frost"
      className="border-border/45 bg-background/72 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="space-y-3 border-b border-border/30">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle>Reviews ({firm.reviews.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use this section to keep the visible review set clean and consistent with the public
              firm page.
            </p>
          </div>
        </div>

        {!canManageReviews ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Review editing unavailable</AlertTitle>
            <AlertDescription>
              This firm record is currently read-only, so review create, edit, and delete actions
              are disabled.
            </AlertDescription>
          </Alert>
        ) : null}

        <form
          action={handleCreateReview}
          className="rounded-xl border border-border/30 bg-background/40 p-4"
        >
          <input type="hidden" name="propFirmId" value={firm.id} />
          <input type="hidden" name="locale" value={locale} />
          <fieldset disabled={!canManageReviews} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_120px]">
              <Input name="title" placeholder="Review title" />
              <Input name="rating" type="number" min="0" max="5" step="1" placeholder="Rating" />
            </div>
            <Textarea
              name="content"
              placeholder="Review content"
              rows={3}
              className="min-h-[96px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isVerified"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Verified
              </label>
              <FormActionButton type="submit" size="sm" variant="outline" pendingLabel="Adding...">
                <Plus className="mr-1 h-4 w-4" /> Add review
              </FormActionButton>
            </div>
          </fieldset>
        </form>
      </CardHeader>
      <CardContent>
        {firm.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {firm.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-border/30 p-4"
              >
                <div className="space-y-3">
                  <form action={handleUpdateReview} className="space-y-2">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="propFirmId" value={firm.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <fieldset disabled={!canManageReviews} className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_120px]">
                        <Input name="title" defaultValue={review.title ?? ''} placeholder="Title" />
                        <Input
                          name="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="1"
                          defaultValue={review.rating}
                        />
                      </div>
                      <Textarea
                        name="content"
                        defaultValue={review.content ?? ''}
                        placeholder="Review content"
                        rows={3}
                        className="min-h-[96px]"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="isVerified"
                            defaultChecked={review.isVerified}
                            className="h-4 w-4 rounded border-input accent-primary"
                          />
                          Verified
                        </label>
                        <FormActionButton
                          type="submit"
                          size="sm"
                          variant="outline"
                          pendingLabel="Saving..."
                        >
                          Save review
                        </FormActionButton>
                      </div>
                    </fieldset>
                  </form>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <form action={handleDeleteReview}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="propFirmId" value={firm.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <FormActionButton
                        type="submit"
                        size="sm"
                        variant="ghost"
                        disabled={!canManageReviews}
                        pendingLabel="Deleting..."
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete review
                      </FormActionButton>
                    </form>
                  </div>
                </div>
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
  locale,
  canManageCoupons,
}: {
  firm: PropFirmData
  locale: string
  canManageCoupons: boolean
}) {
  const publicFirmHref = `/${locale}/firm/${firm.slug}`
  const spotlightSuggestion = getSpotlightCouponSuggestionForFirm({
    name: firm.name,
    slug: firm.slug,
  })
  const createDefaults = firm.coupons.length === 0 ? spotlightSuggestion : null

  return (
    <Card
      variant="frost"
      className="border-border/45 bg-background/72 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="space-y-3 border-b border-border/30">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle>Coupons ({firm.coupons.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage the codes shown on the firm page and keep their live timing aligned with the
              public deals surfaces.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/admin/coupons`}>Open coupon workspace</Link>
          </Button>
        </div>

        {!canManageCoupons ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Coupon editing unavailable</AlertTitle>
            <AlertDescription>
              This prop-firm detail page is in read-only fallback mode until the database connection
              is configured.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {canManageCoupons ? (
          <form
            action={handleCreateCoupon}
            className="space-y-4 rounded-xl border border-border/30 p-4"
          >
            <input type="hidden" name="propFirmId" value={firm.id} />
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <p className="text-sm font-medium">Add new coupon</p>
              {createDefaults ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Public deal found for this firm</AlertTitle>
                  <AlertDescription>
                    The deals page already has spotlight values for this firm. They are prefilled
                    below so you can save them as a real admin coupon and edit them normally.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-code">Code *</Label>
                <Input
                  id="new-code"
                  name="code"
                  placeholder="SAVE20"
                  defaultValue={createDefaults?.couponCode ?? ''}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-discount">Discount %</Label>
                <Input
                  id="new-discount"
                  name="discountPercent"
                  type="number"
                  step="0.01"
                  placeholder="20"
                  defaultValue={createDefaults?.discountPercent ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-fee">Challenge Fee</Label>
                <Input
                  id="new-fee"
                  name="challengeFee"
                  type="number"
                  step="0.01"
                  placeholder="149"
                  defaultValue={createDefaults?.challengeFee || ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-claim">Claim / Affiliate URL</Label>
                <Input
                  id="new-claim"
                  name="claimUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={createDefaults?.claimUrl ?? ''}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-desc">Description</Label>
              <Textarea
                id="new-desc"
                name="description"
                placeholder="20% off all challenges"
                defaultValue={createDefaults?.description ?? ''}
                className="min-h-[92px] resize-y"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="new-platform">Platform Override</Label>
                <Input
                  id="new-platform"
                  name="platform"
                  placeholder="Auto"
                  defaultValue={createDefaults?.platform ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-payout">Payout Override</Label>
                <Input
                  id="new-payout"
                  name="payoutModel"
                  placeholder="Auto"
                  defaultValue={createDefaults?.payoutModel ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-dd">Drawdown Override</Label>
                <Input
                  id="new-dd"
                  name="drawdownType"
                  placeholder="Auto"
                  defaultValue={createDefaults?.drawdownType ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
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
              <Label htmlFor="new-active" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex justify-end">
              <FormActionButton type="submit" size="sm" pendingLabel="Creating coupon...">
                <Plus className="w-4 h-4 mr-1" /> Add coupon
              </FormActionButton>
            </div>
          </form>
        ) : null}

        {firm.coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No coupons stored for this firm yet.</p>
        ) : (
          <div className="space-y-4">
            {firm.coupons.map((coupon) => (
              <CouponEditorCard
                key={coupon.id}
                coupon={coupon}
                firmId={firm.id}
                locale={locale}
                publicFirmHref={publicFirmHref}
                canManageCoupons={canManageCoupons}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CouponEditorCard({
  coupon,
  firmId,
  locale,
  publicFirmHref,
  canManageCoupons,
}: {
  coupon: PropFirmData['coupons'][number]
  firmId: string
  locale: string
  publicFirmHref: string
  canManageCoupons: boolean
}) {
  const timing = getCouponTimingState(coupon)

  return (
    <div className="rounded-xl border border-border/30 p-4">
      <div className="flex flex-col gap-4 border-b border-border/30 pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold tracking-tight">{coupon.code}</p>
            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
              {coupon.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {timing.isLive ? (
              <Badge variant="outline" className="border-success/30 text-success">
                Live on deals
              </Badge>
            ) : null}
            {timing.isScheduled ? (
              <Badge variant="outline" className="border-primary/40 text-primary">
                Scheduled
              </Badge>
            ) : null}
            {timing.isExpired ? (
              <Badge variant="outline" className="border-border/40 text-muted-foreground">
                Expired
              </Badge>
            ) : null}
            {timing.isExpiringSoon ? (
              <Badge variant="outline" className="border-warning/40 text-warning">
                Expires soon
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {coupon.description?.trim() || 'No coupon description saved yet.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={publicFirmHref}>
              <Eye className="h-4 w-4" />
              Public
            </Link>
          </Button>
          {coupon.claimUrl ? (
            <Button variant="ghost" size="sm" asChild>
              <a href={coupon.claimUrl} target="_blank" rel="noreferrer">
                <ArrowUpRight className="h-4 w-4" />
                Claim
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <form action={handleUpdateCoupon} className="mt-4 space-y-4">
        <input type="hidden" name="couponId" value={coupon.id} />
        <input type="hidden" name="propFirmId" value={firmId} />
        <input type="hidden" name="locale" value={locale} />

        <fieldset disabled={!canManageCoupons} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Code *</Label>
              <Input name="code" defaultValue={coupon.code} placeholder="SAVE20" required />
            </div>
            <div className="space-y-1">
              <Label>Discount %</Label>
              <Input
                name="discountPercent"
                type="number"
                step="0.01"
                defaultValue={coupon.discountPercent ?? ''}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Challenge Fee</Label>
              <Input
                name="challengeFee"
                type="number"
                step="0.01"
                defaultValue={coupon.challengeFee ?? ''}
                placeholder="149"
              />
            </div>
            <div className="space-y-1">
              <Label>Claim / Affiliate URL</Label>
              <Input
                name="claimUrl"
                type="url"
                defaultValue={coupon.claimUrl ?? ''}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={coupon.description ?? ''}
              placeholder="Coupon description"
              className="min-h-[92px] resize-y"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Platform Override</Label>
              <Input name="platform" defaultValue={coupon.platform ?? ''} placeholder="Auto" />
            </div>
            <div className="space-y-1">
              <Label>Payout Override</Label>
              <Input
                name="payoutModel"
                defaultValue={coupon.payoutModel ?? ''}
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1">
              <Label>Drawdown Override</Label>
              <Input
                name="drawdownType"
                defaultValue={coupon.drawdownType ?? ''}
                placeholder="Auto"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Starts At</Label>
              <Input
                name="startsAt"
                type="datetime-local"
                defaultValue={formatAdminDateTimeInput(coupon.startsAt)}
              />
            </div>
            <div className="space-y-1">
              <Label>Expires At</Label>
              <Input
                name="expiresAt"
                type="datetime-local"
                defaultValue={formatAdminDateTimeInput(coupon.expiresAt)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="couponIsActive"
                value="1"
                defaultChecked={coupon.isActive}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Active
            </label>
            <FormActionButton
              type="submit"
              size="sm"
              variant="outline"
              disabled={!canManageCoupons}
              pendingLabel="Saving coupon..."
            >
              Save coupon
            </FormActionButton>
          </div>
        </fieldset>
      </form>

      <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Created {new Date(coupon.createdAt).toLocaleString()}</p>
          <p>
            Starts {coupon.startsAt ? new Date(coupon.startsAt).toLocaleString() : 'immediately'} •
            Expires {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString() : 'never'}
          </p>
        </div>
        <form action={handleDeleteCoupon}>
          <input type="hidden" name="couponId" value={coupon.id} />
          <input type="hidden" name="propFirmId" value={firmId} />
          <input type="hidden" name="locale" value={locale} />
          <FormActionButton
            type="submit"
            size="sm"
            variant="ghost"
            disabled={!canManageCoupons}
            pendingLabel="Deleting..."
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete coupon
          </FormActionButton>
        </form>
      </div>
    </div>
  )
}
