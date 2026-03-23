import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createPropFirm, updatePropFirm } from '@/server/prop-firms'
import { assertAdminAccess } from '@/server/authz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
}

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
    firm = await prisma.propFirm.findUnique({ where: { id } })
  }

  async function handleAction(formData: FormData) {
    'use server'
    const firmId = formData.get('id')?.toString()
    const isUpdating = firmId && firmId !== 'new'

    const data = {
      name: formData.get('name')?.toString() ?? '',
      slug: formData.get('slug')?.toString() ?? '',
      category: formData.get('category')?.toString() ?? '',
      description: formData.get('description')?.toString() ?? '',
      shortDesc: formData.get('shortDesc')?.toString() ?? '',
      platform: formData.get('platform')?.toString() ?? '',
      payoutModel: formData.get('payoutModel')?.toString() ?? '',
      drawdownType: formData.get('drawdownType')?.toString() ?? '',
      profitSplit: formData.get('profitSplit')?.toString() ?? '',
      maxAllocation: formData.get('maxAllocation')?.toString() ?? '',
      referralUrl: formData.get('referralUrl')?.toString() ?? '',
      logoUrl: formData.get('logoUrl')?.toString() ?? '',
      isActive: formData.has('isActive'),
    }

    if (isUpdating) {
      await updatePropFirm(firmId!, data)
    } else {
      await createPropFirm(data)
    }

    redirect(`/${locale}/admin/propfirms`)
  }

  const fieldClass = 'grid gap-2'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
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
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/admin/propfirms`}>Cancel</Link>
              </Button>
              <Button type="submit">{isNew ? 'Create' : 'Save Changes'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
