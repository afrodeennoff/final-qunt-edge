import Link from 'next/link'
import { redirect } from 'next/navigation'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import { softDeletePropFirm } from '@/server/prop-firms'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import { FormActionButton } from '../components/form-action-button'

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id')
  const locale = formData.get('locale')
  if (!id || typeof id !== 'string') throw new Error('Missing firm ID')
  const localeStr = typeof locale === 'string' ? locale : 'en'

  try {
    await softDeletePropFirm(id)
  } catch {
    redirect(`/${localeStr}/admin/propfirms?firmStatus=error&firmMessage=Failed+to+delete+firm`)
  }

  redirect(`/${localeStr}/admin/propfirms?firmStatus=deleted`)
}

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  type CouponAdminSearchParamValue,
  type CouponAdminNotice,
} from '../components/coupon-admin-utils'

function getFirmAdminNotice(searchParams: Record<string, CouponAdminSearchParamValue>): CouponAdminNotice | null {
  const status = Array.isArray(searchParams.firmStatus) ? searchParams.firmStatus[0] : searchParams.firmStatus
  if (!status) return null
  const message = Array.isArray(searchParams.firmMessage) ? searchParams.firmMessage[0] : searchParams.firmMessage

  switch (status) {
    case 'saved':
      return { variant: 'success', title: 'Saved', description: message ?? 'Changes saved successfully.' }
    case 'deleted':
      return { variant: 'success', title: 'Firm deleted', description: message ?? 'The firm has been removed.' }
    case 'error':
      return { variant: 'destructive', title: 'Action failed', description: message ?? 'The firm change did not save.' }
    default:
      return null
  }
}

export default async function PropFirmsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, CouponAdminSearchParamValue>>
}) {
  await assertAdminAccess()
  const { locale } = await params
  const notice = getFirmAdminNotice(await searchParams)

  const firms = hasConfiguredDatabaseConnection
    ? await prisma.propFirm.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          platform: true,
          isActive: true,
          _count: { select: { reviews: true, coupons: true } },
        },
        orderBy: { name: 'asc' },
      })
    : Object.entries(propFirms).map(([key, firm]) => {
        const profile = getVerifiedPropFirmProfileByName(firm.name)
        return {
          id: `fallback-${key}`,
          name: firm.name,
          slug: profile?.slug ?? key,
          category: profile?.category ?? null,
          platform: profile?.platform ?? null,
          isActive: true,
          _count: { reviews: 0, coupons: 0 },
        }
      })

  const activeCount = firms.filter((firm) => firm.isActive).length
  const inactiveCount = firms.length - activeCount
  const totalReviews = firms.reduce((sum, firm) => sum + firm._count.reviews, 0)
  const totalCoupons = firms.reduce((sum, firm) => sum + firm._count.coupons, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Prop Firms</h1>
        <Button  asChild>
          <Link href={`/${locale}/admin/propfirms/new`}>Add Firm</Link>
        </Button>
      </div>

      {notice ? (
        <Alert variant={notice.variant}>
          {notice.variant === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.description}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="Total firms" value={firms.length.toString()} />
        <AdminStat label="Active" value={activeCount.toString()} />
        <AdminStat label="Inactive" value={inactiveCount.toString()} />
        <AdminStat label="Reviews / Coupons" value={`${totalReviews} / ${totalCoupons}`} />
      </div>

      <Card>
        <CardContent size="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.65_0.22_260/0.08)]">
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Platform</th>
                  <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">Reviews</th>
                  <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">Coupons</th>
                  <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">Active</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {firms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No prop firms found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  firms.map((f) => (
                    <tr key={f.id} className="border-b border-[oklch(0.65_0.22_260/0.08)] last:border-0">
                      <td className="py-3 pr-4 font-medium">{f.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{f.category ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{f.platform ?? '—'}</td>
                      <td className="py-3 pr-4 text-center">{f._count.reviews}</td>
                      <td className="py-3 pr-4 text-center">{f._count.coupons}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className={f.isActive ? 'text-emerald-500' : 'text-amber-500'}>
                          {f.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button  variant="ghost" size="sm" asChild>
                            <Link href={`/${locale}/admin/propfirms/${f.id}`}>Edit</Link>
                          </Button>
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={f.id} />
                            <input type="hidden" name="locale" value={locale} />
                            <FormActionButton
                              variant="ghost"
                              size="sm"
                              type="submit"
                              pendingLabel="Deleting..."
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </FormActionButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent size="sm">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}
