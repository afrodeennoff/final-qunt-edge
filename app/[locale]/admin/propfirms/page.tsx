import Link from 'next/link'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import { softDeletePropFirm } from '@/server/prop-firms'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await softDeletePropFirm(id)
}

export default async function PropFirmsListPage({ params }: { params: Promise<{ locale: string }> }) {
  await assertAdminAccess()
  const { locale } = await params

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
                <tr className="border-b border-white/[0.6]">
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
                    <tr key={f.id} className="border-b border-white/[0.6] last:border-0">
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
                            <Button  variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
