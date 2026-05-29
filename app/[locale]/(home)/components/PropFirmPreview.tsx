import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import { TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export async function PropFirmPreview() {
  const data = await getPropfirmCatalogueData('currentMonth').catch(() => null)
  const firms = data?.stats ?? []
  const topFirms = firms
    .filter((f) => f.accountsCount > 0)
    .sort((a, b) => b.accountsCount - a.accountsCount)
    .slice(0, 4)

  if (topFirms.length === 0) return null

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
            Real performance data from the firms that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topFirms.map((firm) => (
            <div
              key={firm.propfirmName}
              className="group relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/10 p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15"
            >
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
              <div className="relative z-10">
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
            </div>
          ))}
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
