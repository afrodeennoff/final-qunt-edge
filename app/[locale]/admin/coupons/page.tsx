import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import { getSpotlightCouponSuggestionForFirm } from '@/lib/prop-firms/spotlight-coupon-suggestions'
import {
  createPropFirmCoupon,
  deletePropFirmCoupon,
  updatePropFirmCoupon,
} from '@/server/prop-firms'
import { getPropFirmCouponAdminErrorMessage } from '@/lib/errors'
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Percent,
  Plus,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import {
  buildCouponAdminRedirectUrl,
  formatAdminDateTimeInput,
  getCouponAdminNotice,
  getCouponTimingState,
} from '../components/coupon-admin-utils'
import { FormActionButton } from '../components/form-action-button'

function requireText(value: FormDataEntryValue | null, fallback = ''): string {
  return value?.toString().trim() || fallback
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = value?.toString().trim()
  if (!text) return undefined
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeOptionalText(value: FormDataEntryValue | null): string | undefined {
  const text = value?.toString().trim()
  return text ? text : undefined
}

function normalizeOptionalTextForUpdate(value: FormDataEntryValue | null): string | null | undefined {
  const text = value?.toString().trim()
  return typeof text === 'string' ? (text ? text : null) : undefined
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null | undefined {
  const text = value?.toString().trim()
  if (!text) return null
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function parseOptionalNumberForUpdate(value: FormDataEntryValue | null): number | null | undefined {
  const text = value?.toString().trim()
  if (!text) return null
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

function requireFormString(formData: FormData, key: string): string {
  const val = formData.get(key)
  if (!val || typeof val !== 'string') throw new Error(`Missing required field: ${key}`)
  return val
}

// ---------------------------------------------------------------------------
// Server actions (module scope — read locale from FormData, not closure)
// ---------------------------------------------------------------------------

async function handleCreateCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')

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
        `/${locale}/admin/coupons`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(buildCouponAdminRedirectUrl(`/${locale}/admin/coupons`, 'created'))
}

async function handleUpdateCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')

  try {
    const couponId = requireFormString(formData, 'couponId')
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
        `/${locale}/admin/coupons`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(buildCouponAdminRedirectUrl(`/${locale}/admin/coupons`, 'updated'))
}

async function handleDeleteCoupon(formData: FormData) {
  'use server'
  const locale = requireText(formData.get('locale'), 'en')

  try {
    const couponId = requireFormString(formData, 'couponId')
    await deletePropFirmCoupon(couponId)
  } catch (error) {
    redirect(
      buildCouponAdminRedirectUrl(
        `/${locale}/admin/coupons`,
        'error',
        getPropFirmCouponAdminErrorMessage(error),
      ),
    )
  }

  redirect(buildCouponAdminRedirectUrl(`/${locale}/admin/coupons`, 'deleted'))
}

async function loadCoupons() {
  if (!hasConfiguredDatabaseConnection) {
    return []
  }

  try {
    return await prisma.propFirmCoupon.findMany({
      include: {
        propFirm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ isActive: 'desc' }, { expiresAt: 'asc' }, { updatedAt: 'desc' }],
    })
  } catch (error) {
    console.warn('[Admin Coupons] Failed to load coupons:', error)
    return []
  }
}

async function loadFirms() {
  if (!hasConfiguredDatabaseConnection) {
    return Object.entries(propFirms).map(([key, firm]) => {
      const profile = getVerifiedPropFirmProfileByName(firm.name)
      return {
        id: `fallback-${key}`,
        name: firm.name,
        slug: profile?.slug ?? key,
        isActive: true,
      }
    })
  }

  return prisma.propFirm.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  })
}

function buildPublicFirmHref(locale: string, slug: string) {
  return `/${locale}/firm/${slug}`
}

function CouponBadges({
  active,
  live,
  scheduled,
  expired,
  expiringSoon,
}: {
  active: boolean
  live: boolean
  scheduled: boolean
  expired: boolean
  expiringSoon: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Active' : 'Inactive'}
      </Badge>
      {live ? (
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
          Live on deals
        </Badge>
      ) : null}
      {scheduled ? (
        <Badge variant="outline" className="border-sky-500/40 text-sky-300">
          Scheduled
        </Badge>
      ) : null}
      {expired ? (
        <Badge variant="outline" className="border-border/40 text-muted-foreground">
          Expired
        </Badge>
      ) : null}
      {expiringSoon ? (
        <Badge variant="outline" className="border-amber-500/40 text-amber-300">
          Expires soon
        </Badge>
      ) : null}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card variant="flat" hover>
      <CardContent size="sm" className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

function CouponEditCard({
  coupon,
  locale,
}: {
  coupon: Awaited<ReturnType<typeof loadCoupons>>[number]
  locale: string
}) {
  const active = coupon.isActive
  const timing = getCouponTimingState(coupon)

  return (
    <Card variant="flat" hover className="overflow-hidden">
      <CardHeader size="sm" className="space-y-3 border-b border-[oklch(0.65_0.22_260/0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle size="md" className="tracking-tight">
                {coupon.code}
              </CardTitle>
              <CouponBadges
                active={active}
                live={timing.isLive}
                scheduled={timing.isScheduled}
                expired={timing.isExpired}
                expiringSoon={timing.isExpiringSoon}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/95">{coupon.propFirm.name}</span>
              {' '}• {coupon.propFirm.slug}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={buildPublicFirmHref(locale, coupon.propFirm.slug)}>
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
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/admin/propfirms/${coupon.propFirm.id}`}>
                <Building2 className="h-4 w-4" />
                Firm
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent size="sm" className="space-y-4 pt-4">
        <form action={handleUpdateCoupon} className="space-y-3">
          <input type="hidden" name="couponId" value={coupon.id} />
          <input type="hidden" name="propFirmId" value={coupon.propFirmId} />
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`code-${coupon.id}`}>Code</Label>
              <Input id={`code-${coupon.id}`} name="code" defaultValue={coupon.code} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`discountPercent-${coupon.id}`}>Discount %</Label>
              <Input
                id={`discountPercent-${coupon.id}`}
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
              <Label htmlFor={`challengeFee-${coupon.id}`}>Challenge Fee</Label>
              <Input
                id={`challengeFee-${coupon.id}`}
                name="challengeFee"
                type="number"
                step="0.01"
                defaultValue={coupon.challengeFee ?? ''}
                placeholder="149"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`claimUrl-${coupon.id}`}>Claim / Affiliate URL</Label>
              <Input
                id={`claimUrl-${coupon.id}`}
                name="claimUrl"
                type="url"
                defaultValue={coupon.claimUrl ?? ''}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`description-${coupon.id}`}>Description</Label>
            <Textarea
              id={`description-${coupon.id}`}
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
              <Input name="payoutModel" defaultValue={coupon.payoutModel ?? ''} placeholder="Auto" />
            </div>
            <div className="space-y-1">
              <Label>Drawdown Override</Label>
              <Input name="drawdownType" defaultValue={coupon.drawdownType ?? ''} placeholder="Auto" />
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

          <div className="flex items-center justify-between gap-4">
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
            <FormActionButton type="submit" variant="outline" size="sm" pendingLabel="Saving coupon...">
              Save coupon
            </FormActionButton>
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-[oklch(0.65_0.22_260/0.08)] pt-4">
          <div className="text-xs text-muted-foreground">
            Updated {new Date(coupon.updatedAt).toLocaleString()}
          </div>
          <form action={handleDeleteCoupon}>
            <input type="hidden" name="couponId" value={coupon.id} />
            <input type="hidden" name="propFirmId" value={coupon.propFirmId} />
            <input type="hidden" name="locale" value={locale} />
            <FormActionButton
              type="submit"
              size="sm"
              variant="ghost"
              pendingLabel="Deleting..."
              className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </FormActionButton>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

function CouponSuggestionCard({
  firm,
  locale,
  suggestion,
}: {
  firm: Awaited<ReturnType<typeof loadFirms>>[number]
  locale: string
  suggestion: NonNullable<ReturnType<typeof getSpotlightCouponSuggestionForFirm>>
}) {
  return (
    <Card variant="flat" hover className="overflow-hidden border-primary/15">
      <CardHeader size="sm" className="space-y-3 border-b border-[oklch(0.65_0.22_260/0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle size="md" className="tracking-tight">
                {suggestion.couponCode}
              </CardTitle>
              <Badge variant="frost-info" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Spotlight suggestion
              </Badge>
              <Badge variant="outline">{suggestion.discountPercent}% off</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/95">{firm.name}</span>
              {' '}• visible on the public deals page, but not yet saved as an admin coupon
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={buildPublicFirmHref(locale, firm.slug)}>
                <Eye className="h-4 w-4" />
                Public
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={suggestion.sourceUrl} target="_blank" rel="noreferrer">
                <ArrowUpRight className="h-4 w-4" />
                Source
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/admin/propfirms/${firm.id}`}>
                <Building2 className="h-4 w-4" />
                Firm
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent size="sm" className="space-y-4 pt-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not saved in the coupon table yet</AlertTitle>
          <AlertDescription>
            Save this suggestion once so the discount, code, fee, and claim link become fully editable from admin.
          </AlertDescription>
        </Alert>

        <form action={handleCreateCoupon} className="space-y-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="propFirmId" value={firm.id} />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`suggestion-code-${firm.id}`}>Code</Label>
              <Input
                id={`suggestion-code-${firm.id}`}
                name="code"
                defaultValue={suggestion.couponCode}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`suggestion-discount-${firm.id}`}>Discount %</Label>
              <Input
                id={`suggestion-discount-${firm.id}`}
                name="discountPercent"
                type="number"
                step="0.01"
                defaultValue={suggestion.discountPercent}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`suggestion-fee-${firm.id}`}>Challenge Fee</Label>
              <Input
                id={`suggestion-fee-${firm.id}`}
                name="challengeFee"
                type="number"
                step="0.01"
                defaultValue={suggestion.challengeFee || ''}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`suggestion-claim-${firm.id}`}>Claim / Affiliate URL</Label>
              <Input
                id={`suggestion-claim-${firm.id}`}
                name="claimUrl"
                type="url"
                defaultValue={suggestion.claimUrl}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`suggestion-description-${firm.id}`}>Description</Label>
            <Textarea
              id={`suggestion-description-${firm.id}`}
              name="description"
              defaultValue={suggestion.description}
              className="min-h-[92px] resize-y"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor={`suggestion-platform-${firm.id}`}>Platform Override</Label>
              <Input
                id={`suggestion-platform-${firm.id}`}
                name="platform"
                defaultValue={suggestion.platform}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`suggestion-payout-${firm.id}`}>Payout Override</Label>
              <Input
                id={`suggestion-payout-${firm.id}`}
                name="payoutModel"
                defaultValue={suggestion.payoutModel}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`suggestion-drawdown-${firm.id}`}>Drawdown Override</Label>
              <Input
                id={`suggestion-drawdown-${firm.id}`}
                name="drawdownType"
                defaultValue={suggestion.drawdownType}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`suggestion-starts-${firm.id}`}>Starts At</Label>
              <Input id={`suggestion-starts-${firm.id}`} name="startsAt" type="datetime-local" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`suggestion-expires-${firm.id}`}>Expires At</Label>
              <Input id={`suggestion-expires-${firm.id}`} name="expiresAt" type="datetime-local" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="couponIsActive"
                value="1"
                defaultChecked
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm">Active</span>
            </div>
            <FormActionButton type="submit" pendingLabel="Creating coupon...">
              <Plus className="h-4 w-4" />
              Save as coupon
            </FormActionButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default async function AdminCouponsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await connection()
  await assertAdminAccess()
  const { locale } = await params
  const notice = getCouponAdminNotice(await searchParams)

  const [firms, coupons] = await Promise.all([loadFirms(), loadCoupons()])

  const activeCount = coupons.filter((coupon) => coupon.isActive).length
  const inactiveCount = coupons.length - activeCount
  const soonExpiringCount = coupons.filter((coupon) => getCouponTimingState(coupon).isExpiringSoon).length
  const firmCoverageCount = new Set(coupons.map((coupon) => coupon.propFirmId)).size
  const isReadOnlyFallback = !hasConfiguredDatabaseConnection
  const couponSuggestions = isReadOnlyFallback
    ? []
    : firms
        .filter((firm) => firm.isActive)
        .map((firm) => {
          if (coupons.some((coupon) => coupon.propFirmId === firm.id)) return null

          const suggestion = getSpotlightCouponSuggestionForFirm({
            name: firm.name,
            slug: firm.slug,
          })
          if (!suggestion) return null

          return { firm, suggestion }
        })
        .filter(
          (
            value,
          ): value is {
            firm: Awaited<ReturnType<typeof loadFirms>>[number]
            suggestion: NonNullable<ReturnType<typeof getSpotlightCouponSuggestionForFirm>>
          } => value !== null,
        )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[oklch(0.65_0.22_260/0.08)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
            Admin Coupons
          </p>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">Coupon Codes</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Create, edit, retire, and audit coupon codes and discount percentages from one central admin workspace.
                Active coupons are also used in the public rolling prop-firm banner.
              </p>
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button  variant="outline" asChild>
            <Link href={`/${locale}/admin/propfirms`}>
              <Building2 className="h-4 w-4" />
              Prop firms
            </Link>
          </Button>
        </div>
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

      {isReadOnlyFallback ? (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Coupon workspace is read-only</AlertTitle>
          <AlertDescription>
            The database connection is not configured in this environment, so coupon create, edit, and delete actions are unavailable until the app is connected to the live schema.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Tags className="h-4 w-4" />} label="Total coupons" value={coupons.length.toString()} />
        <StatCard icon={<Percent className="h-4 w-4" />} label="Active" value={activeCount.toString()} />
        <StatCard icon={<Clock3 className="h-4 w-4" />} label="Expiring soon" value={soonExpiringCount.toString()} />
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Firms covered" value={firmCoverageCount.toString()} hint={`${inactiveCount} inactive coupon${inactiveCount === 1 ? '' : 's'}`} />
      </div>

      <Card variant="flat" hover>
        <CardHeader className="space-y-2 border-b border-[oklch(0.65_0.22_260/0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle size="md">Add coupon</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new code, attach it to a prop firm, and publish it immediately.
              </p>
            </div>
            <Badge variant="secondary">{firms.length} firms available</Badge>
          </div>
        </CardHeader>
        <CardContent size="sm" className="pt-4">
          {isReadOnlyFallback ? (
            <p className="text-sm text-muted-foreground">
              Connect the database to create and manage coupons from this screen.
            </p>
          ) : firms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one prop firm before creating coupons.
            </p>
          ) : (
            <form action={handleCreateCoupon} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="propFirmId">Prop firm</Label>
                  <select
                    id="propFirmId"
                    name="propFirmId"
                    defaultValue={firms[0]?.id ?? ''}
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    {firms.map((firm) => (
                      <option key={firm.id} value={firm.id}>
                        {firm.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-code">Code</Label>
                  <Input id="new-code" name="code" required placeholder="SAVE20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-discountPercent">Discount %</Label>
                  <Input id="new-discountPercent" name="discountPercent" type="number" step="0.01" placeholder="20" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="new-challengeFee">Challenge Fee</Label>
                  <Input id="new-challengeFee" name="challengeFee" type="number" step="0.01" placeholder="149" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-claimUrl">Claim / Affiliate URL</Label>
                  <Input id="new-claimUrl" name="claimUrl" type="url" placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-description">Description</Label>
                <Textarea
                  id="new-description"
                  name="description"
                  placeholder="20% off all challenges"
                  className="min-h-[92px] resize-y"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="new-platform">Platform Override</Label>
                  <Input id="new-platform" name="platform" placeholder="Auto" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-payoutModel">Payout Override</Label>
                  <Input id="new-payoutModel" name="payoutModel" placeholder="Auto" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-drawdownType">Drawdown Override</Label>
                  <Input id="new-drawdownType" name="drawdownType" placeholder="Auto" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-startsAt">Starts At</Label>
                  <Input id="new-startsAt" name="startsAt" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-expiresAt">Expires At</Label>
                  <Input id="new-expiresAt" name="expiresAt" type="datetime-local" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="couponIsActive"
                    value="1"
                    defaultChecked
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm">Active</span>
                </div>
                <FormActionButton type="submit" pendingLabel="Creating coupon...">
                  <Plus className="h-4 w-4" />
                  Create coupon
                </FormActionButton>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {couponSuggestions.length > 0 ? (
        <Card variant="flat" hover>
          <CardHeader className="space-y-2 border-b border-[oklch(0.65_0.22_260/0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle size="md">Live deal suggestions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  These firms already show offer data on the public deals page, but the coupons have not been saved into admin yet.
                </p>
              </div>
              <Badge variant="secondary">{couponSuggestions.length} unsynced</Badge>
            </div>
          </CardHeader>
          <CardContent size="sm" className="pt-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {couponSuggestions.map(({ firm, suggestion }) => (
                <CouponSuggestionCard
                  key={firm.id}
                  firm={firm}
                  locale={locale}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {coupons.length === 0 ? (
          <Card variant="flat" className="xl:col-span-2">
            <CardContent size="sm" className="py-10 text-center text-sm text-muted-foreground">
              No coupons yet. Create the first one above.
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <CouponEditCard
              key={coupon.id}
              coupon={coupon}
              locale={locale}
            />
          ))
        )}
      </div>
    </div>
  )
}
