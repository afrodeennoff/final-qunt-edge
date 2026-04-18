import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import { softDeletePropFirm } from '@/server/prop-firms'
import { getPropFirmAdminPageState } from '@/lib/prop-firms/admin-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, PencilLine } from 'lucide-react'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import { AdminPageHeader, AdminSection, AdminStatCard } from '../components/admin-surface'
import { ConfirmDeleteButton } from '../components/confirm-delete-button'
import {
  getFirmAdminNotice,
  type CouponAdminSearchParamValue,
} from '../components/coupon-admin-utils'

type PropFirmListRow = {
  id: string
  name: string
  slug: string
  category: string | null
  platform: string | null
  isActive: boolean
  _count: {
    reviews: number
    coupons: number
  }
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id')
  const locale = formData.get('locale')
  if (!id || typeof id !== 'string') throw new Error('Missing firm ID')
  const localeStr = typeof locale === 'string' ? locale : 'en'

  try {
    await softDeletePropFirm(id)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete the prop firm.'

    redirect(
      `/${localeStr}/admin/propfirms?firmStatus=error&firmMessage=${encodeURIComponent(message)}`,
    )
  }

  redirect(`/${localeStr}/admin/propfirms?firmStatus=deleted`)
}

function buildFallbackFirmRows(): PropFirmListRow[] {
  return Object.entries(propFirms).map(([key, firm]) => {
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
}

export default async function PropFirmsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, CouponAdminSearchParamValue>>
}) {
  await assertAdminAccess()
  await connection()
  const { locale } = await params
  const notice = getFirmAdminNotice(await searchParams)

  const pageState = getPropFirmAdminPageState({
    hasConfiguredDatabaseConnection,
    firmId: null,
  })

  let firms: PropFirmListRow[] = buildFallbackFirmRows()
  if (hasConfiguredDatabaseConnection) {
    try {
      firms = await prisma.propFirm.findMany({
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
    } catch (error) {
      console.warn('[Admin PropFirms] Falling back to reference rows:', error)
    }
  }

  const activeCount = firms.filter((firm) => firm.isActive).length
  const inactiveCount = firms.length - activeCount
  const totalReviews = firms.reduce((sum, firm) => sum + firm._count.reviews, 0)
  const totalCoupons = firms.reduce((sum, firm) => sum + firm._count.coupons, 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin Prop Firms"
        title="Prop Firms"
        description="Review firm coverage, open a cleaner detail workspace for reviews and coupons, and keep the admin directory easy to scan instead of table-heavy."
        actions={
          pageState.canManageFirm ? (
            <Button asChild>
              <Link href={`/${locale}/admin/propfirms/new`}>Add firm</Link>
            </Button>
          ) : (
            <Badge variant="secondary">Reference only</Badge>
          )
        }
      />

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
            These rows are rendered from fallback/reference data because the live database is not
            available in this environment. Create, edit, and delete actions are disabled until the
            schema is connected again.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total firms" value={firms.length.toString()} />
        <AdminStatCard label="Active" value={activeCount.toString()} />
        <AdminStatCard label="Inactive" value={inactiveCount.toString()} />
        <AdminStatCard label="Reviews / Coupons" value={`${totalReviews} / ${totalCoupons}`} />
      </div>

      <AdminSection
        title="Firm directory"
        description="Every row links into the detail workspace. Destructive actions only appear when the live admin schema is available."
        badge={<Badge variant="secondary">{firms.length} total</Badge>}
      >
        <div className="space-y-3 lg:hidden">
          {firms.length === 0 ? (
            <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] px-4 py-8 text-center text-sm text-muted-foreground">
              No prop firms found yet.
            </div>
          ) : (
            firms.map((firm) => {
              const rowState = getPropFirmAdminPageState({
                hasConfiguredDatabaseConnection,
                firmId: firm.id,
              })

              return (
                <div
                  key={firm.id}
                  className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-background/40 p-4"
                >
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{firm.name}</p>
                        <Badge variant={firm.isActive ? 'default' : 'secondary'}>
                          {firm.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {rowState.isReadOnly ? <Badge variant="outline">Read-only</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground">{firm.slug}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="text-sm text-muted-foreground">
                        Category: <span className="text-foreground">{firm.category ?? '—'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Platform: <span className="text-foreground">{firm.platform ?? '—'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reviews: <span className="text-foreground">{firm._count.reviews}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Coupons: <span className="text-foreground">{firm._count.coupons}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${locale}/admin/propfirms/${firm.id}`}>
                          <PencilLine className="h-4 w-4" />
                          {rowState.canManageFirm ? 'Edit' : 'View'}
                        </Link>
                      </Button>

                      {rowState.canManageFirm ? (
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={firm.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <ConfirmDeleteButton
                            variant="ghost"
                            size="sm"
                            confirmMessage="Delete this firm? It will be soft-deleted and hidden from public pages."
                            pendingLabel="Deleting..."
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                          />
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.65_0.22_260/0.08)]">
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Category</th>
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Platform</th>
                <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">Reviews</th>
                <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">Coupons</th>
                <th className="pb-3 pr-4 text-center font-medium text-muted-foreground">State</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {firms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No prop firms found yet.
                  </td>
                </tr>
              ) : (
                firms.map((firm) => {
                  const rowState = getPropFirmAdminPageState({
                    hasConfiguredDatabaseConnection,
                    firmId: firm.id,
                  })

                  return (
                    <tr
                      key={firm.id}
                      className="border-b border-[oklch(0.65_0.22_260/0.08)] last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="space-y-1">
                          <p className="font-medium">{firm.name}</p>
                          <p className="text-xs text-muted-foreground">{firm.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{firm.category ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{firm.platform ?? '—'}</td>
                      <td className="py-3 pr-4 text-center">{firm._count.reviews}</td>
                      <td className="py-3 pr-4 text-center">{firm._count.coupons}</td>
                      <td className="py-3 pr-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Badge variant={firm.isActive ? 'default' : 'secondary'}>
                            {firm.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {rowState.isReadOnly ? <Badge variant="outline">Read-only</Badge> : null}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${locale}/admin/propfirms/${firm.id}`}>
                              <PencilLine className="h-4 w-4" />
                              {rowState.canManageFirm ? 'Edit' : 'View'}
                            </Link>
                          </Button>

                          {rowState.canManageFirm ? (
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={firm.id} />
                              <input type="hidden" name="locale" value={locale} />
                              <ConfirmDeleteButton
                                variant="ghost"
                                size="sm"
                                confirmMessage="Delete this firm? It will be soft-deleted and hidden from public pages."
                                pendingLabel="Deleting..."
                                className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                              />
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </div>
  )
}
