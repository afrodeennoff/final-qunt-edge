import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { getActiveDeals } from '@/server/deals'
import { TrendingUp, Users, DollarSign, Tag, Clock } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function daysLeft(expiry: string): number {
  const diff = new Date(expiry).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

function formatDays(days: number): string {
  if (days === 0) return 'Ending today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export async function PropFirmPreview() {
  await connection()
  const [data, deals] = await Promise.all([
    getPropfirmCatalogueData('currentMonth').catch(() => null),
    getActiveDeals().catch(() => []),
  ])

  const firms = data?.stats ?? []
  const topFirms = firms
    .filter((f) => f.accountsCount > 0)
    .sort((a, b) => b.accountsCount - a.accountsCount)
    .slice(0, 4)

  if (topFirms.length === 0) return null

  const dealMap = new Map<string, (typeof deals)[0]>()
  for (const deal of deals) {
    const existing = dealMap.get(deal.firmName)
    if (!existing || deal.discountPercent > existing.discountPercent) {
      dealMap.set(deal.firmName, deal)
    }
  }

  return (
    <section className="py-24 border-b border-border/20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Users className="h-3 w-3" />
            Prop Firms
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Trusted by top prop firms.
          </h2>
          <p className="mt-4 text-[14px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            Real performance data and active discounts from the firms that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topFirms.map((firm) => {
            const deal = dealMap.get(firm.propfirmName)
            return (
              <div
                key={firm.propfirmName}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/10 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15"
              >
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
                <div className="relative z-10 flex-1 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/10 text-primary text-sm font-bold">
                    {firm.propfirmName.charAt(0)}
                  </div>
                  <h3 className="mt-4 font-semibold text-[15px] text-foreground/90">
                    {firm.propfirmName}
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground/70">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{firm.accountsCount.toLocaleString()} accounts</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground/70">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      <span>{fmt(firm.payouts.paidAmount)} paid out</span>
                    </div>
                  </div>
                </div>
                {deal && (
                  <div className="border-t border-border/20 bg-gradient-to-t from-background/80 to-background/60 p-4 pt-3 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3 shrink-0 text-success" />
                          <span className="text-[13px] font-bold text-success">
                            {deal.discountPercent}% OFF
                          </span>
                        </div>
                        <div className="mt-1 inline-block rounded bg-muted/60 px-2 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground/80">
                          {deal.couponCode}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{formatDays(daysLeft(deal.expiryDate))}</span>
                        </div>
                      </div>
                      <Link
                        href={deal.claimUrl || `/propfirms`}
                        className="shrink-0 rounded-lg border border-border/30 bg-background/60 px-3 py-1.5 text-[10px] font-semibold text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                      >
                        Claim
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/propfirms"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary/80 transition-colors hover:text-primary"
          >
            Browse all prop firms
            <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
