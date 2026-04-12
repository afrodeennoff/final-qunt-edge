import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import {
  createPropFirmCoupon,
  deletePropFirmCoupon,
  updatePropFirmCoupon,
} from '@/server/prop-firms'
import { Building2, Clock3, Percent, Plus, Tags, Trash2 } from 'lucide-react'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'

function requireText(value: FormDataEntryValue | null, fallback = ''): string {
  return value?.toString().trim() || fallback
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = value?.toString().trim()
  if (!text) return undefined
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

async function loadCoupons() {
  if (!hasConfiguredDatabaseConnection) {
    return []
  }

  return prisma.propFirmCoupon.findMany({
    include: {
      propFirm: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  })
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

function isExpiringSoon(expiresAt: Date | null) {
  if (!expiresAt) return false
  const now = Date.now()
  const expiry = new Date(expiresAt).getTime()
  return expiry >= now && expiry <= now + 14 * 24 * 60 * 60 * 1000
}

function CouponBadges({
  active,
  expiringSoon,
}: {
  active: boolean
  expiringSoon: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'Active' : 'Inactive'}
      </Badge>
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
  onUpdateCoupon,
  onDeleteCoupon,
}: {
  coupon: Awaited<ReturnType<typeof loadCoupons>>[number]
  locale: string
  onUpdateCoupon: (formData: FormData) => Promise<void>
  onDeleteCoupon: (formData: FormData) => Promise<void>
}) {
  const active = coupon.isActive
  const expiringSoon = isExpiringSoon(coupon.expiresAt)

  return (
    <Card variant="flat" hover className="overflow-hidden">
      <CardHeader size="sm" className="space-y-3 border-b border-border/24">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle size="md" className="tracking-tight">
                {coupon.code}
              </CardTitle>
              <CouponBadges active={active} expiringSoon={expiringSoon} />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{coupon.propFirm.name}</span>
              {' '}• {coupon.propFirm.slug}
            </p>
          </div>

          <Button  variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/admin/propfirms/${coupon.propFirm.id}`}>
              <Building2 className="h-4 w-4" />
              Firm
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent size="sm" className="space-y-4 pt-4">
        <form action={onUpdateCoupon} className="space-y-4">
          <input type="hidden" name="couponId" value={coupon.id} />
          <input type="hidden" name="propFirmId" value={coupon.propFirmId} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-2">
              <Label htmlFor={`code-${coupon.id}`}>Code</Label>
              <Input id={`code-${coupon.id}`} name="code" defaultValue={coupon.code} required />
            </div>
            <div className="space-y-2">
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

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Only coupon code and discount percentage are editable here.
            </p>
            <Button type="submit" variant="outline" size="sm">
              Save coupon
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-border/24 pt-4">
          <div className="text-xs text-muted-foreground">
            Updated {new Date(coupon.updatedAt).toLocaleString()}
          </div>
          <form action={onDeleteCoupon}>
            <input type="hidden" name="couponId" value={coupon.id} />
            <input type="hidden" name="propFirmId" value={coupon.propFirmId} />
            <Button 
              type="submit"
              size="sm"
              variant="ghost"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminCouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await connection()
  await assertAdminAccess()
  const { locale } = await params

  const [firms, coupons] = await Promise.all([loadFirms(), loadCoupons()])

  async function handleCreateCoupon(formData: FormData) {
    'use server'
    const propFirmId = requireText(formData.get('propFirmId'))
    await createPropFirmCoupon(propFirmId, {
      code: requireText(formData.get('code')),
      discountPercent: parseOptionalNumber(formData.get('discountPercent')),
    })
    redirect(`/${locale}/admin/coupons`)
  }

  async function handleUpdateCoupon(formData: FormData) {
    'use server'
    const couponId = requireText(formData.get('couponId'))
    await updatePropFirmCoupon(couponId, {
      code: requireText(formData.get('code')),
      discountPercent: parseOptionalNumber(formData.get('discountPercent')),
    })
    redirect(`/${locale}/admin/coupons`)
  }

  async function handleDeleteCoupon(formData: FormData) {
    'use server'
    const couponId = requireText(formData.get('couponId'))
    await deletePropFirmCoupon(couponId)
    redirect(`/${locale}/admin/coupons`)
  }

  const activeCount = coupons.filter((coupon) => coupon.isActive).length
  const inactiveCount = coupons.length - activeCount
  const soonExpiringCount = coupons.filter((coupon) => isExpiringSoon(coupon.expiresAt)).length
  const firmCoverageCount = new Set(coupons.map((coupon) => coupon.propFirmId)).size

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/24 pb-6 md:flex-row md:items-end md:justify-between">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Tags className="h-4 w-4" />} label="Total coupons" value={coupons.length.toString()} />
        <StatCard icon={<Percent className="h-4 w-4" />} label="Active" value={activeCount.toString()} />
        <StatCard icon={<Clock3 className="h-4 w-4" />} label="Expiring soon" value={soonExpiringCount.toString()} />
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Firms covered" value={firmCoverageCount.toString()} hint={`${inactiveCount} inactive coupon${inactiveCount === 1 ? '' : 's'}`} />
      </div>

      <Card variant="flat" hover>
        <CardHeader className="space-y-2 border-b border-border/24">
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
          {firms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one prop firm before creating coupons.
            </p>
          ) : (
            <form action={handleCreateCoupon} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2 md:col-span-2 xl:col-span-1">
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

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">Only coupon code and discount percentage are editable here.</p>
                <Button  type="submit">
                  <Plus className="h-4 w-4" />
                  Create coupon
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

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
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          ))
        )}
      </div>
    </div>
  )
}
