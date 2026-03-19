import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { assertAdminAccess } from '@/server/authz'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function PropFirmsListPage({ params }: { params: Promise<{ locale: string }> }) {
  await assertAdminAccess()
  const { locale } = await params

  const firms = await prisma.propFirm.findMany({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Prop Firms</h1>
        <Button asChild>
          <Link href={`/${locale}/admin/propfirms/new`}>Add Firm</Link>
        </Button>
      </div>

      <Card>
        <CardContent size="sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
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
                    <tr key={f.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium">{f.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{f.category ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{f.platform ?? '—'}</td>
                      <td className="py-3 pr-4 text-center">{f._count.reviews}</td>
                      <td className="py-3 pr-4 text-center">{f._count.coupons}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className={f.isActive ? 'text-emerald-500' : 'text-muted-foreground'}>
                          {f.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/propfirms/${f.id}`}>Edit</Link>
                        </Button>
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
