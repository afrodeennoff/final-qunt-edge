import { getActiveDeals } from '@/server/deals'
import { TrendingUp, Tag, Clock } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { InteractiveWrapper } from '@/components/interactive-wrapper'

function daysLeft(expiry: string): number {
  const diff = new Date(expiry).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

function formatDays(days: number): string {
  if (days === 0) return 'Ending today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export async function DealsPreview() {
  await connection()
  const deals = await getActiveDeals().catch(() => [])
  const topDeals = deals
    .filter((d) => daysLeft(d.expiryDate) > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 4)

  if (topDeals.length === 0) return null

  return (
    <section className="py-24 border-b-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Tag className="h-3 w-3" />
            Live Deals
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Active deals & discounts.
          </h2>
          <p className="mt-4 text-[14px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            Limited-time offers from top prop firms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topDeals.map((deal) => (
            <InteractiveWrapper key={deal.id} hover="cursor">
            <div
              className="group relative overflow-hidden rounded-2xl bg-card border-0 p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15"
            >
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-success/20 to-success/5 ring-1 ring-inset ring-success/10 text-success text-sm font-bold">
                  {deal.firmName.charAt(0)}
                </div>
                <h3 className="mt-4 font-semibold text-[15px] text-foreground/90">
                  {deal.firmName}
                </h3>
                <p className="mt-1 text-[28px] font-light tracking-tight text-success">
                  {deal.discountPercent}% OFF
                </p>
                <div className="mt-2 inline-block rounded-md bg-muted/50 px-2.5 py-1 font-mono text-[11px] tracking-wider text-muted-foreground/80">
                  {deal.couponCode}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  <span>{formatDays(daysLeft(deal.expiryDate))}</span>
                </div>
              </div>
            </div>
            </InteractiveWrapper>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary/80 transition-colors hover:text-primary"
          >
            View all deals
            <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
