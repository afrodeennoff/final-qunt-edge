import Link from 'next/link'
import { BadgeV2 } from "@/components/ui/v2"
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Building2, Users, DollarSign, TrendingUp } from 'lucide-react'

interface FeaturedFirm {
  id: string
  slug: string
  name: string
  category: string
  platform: string
  accountsCount: number
  totalAccountValue: number
  paidPayoutAmount: number
}

interface FeaturedFirmsProps {
  locale: string
  firms?: FeaturedFirm[]
}

const fallbackFirms: FeaturedFirm[] = [
  { id: '1', slug: 'topstep', name: 'TopStep', category: 'Futures', platform: 'Tradovate', accountsCount: 1250, totalAccountValue: 45000000, paidPayoutAmount: 8500000 },
  { id: '2', slug: 'apex-trader', name: 'Apex Trader Funding', category: 'Futures', platform: 'Rithmic', accountsCount: 980, totalAccountValue: 32000000, paidPayoutAmount: 6200000 },
  { id: '3', slug: 'earn2trade', name: 'Earn2Trade', category: 'Futures', platform: 'Tradovate', accountsCount: 720, totalAccountValue: 28000000, paidPayoutAmount: 5100000 },
  { id: '4', slug: 'bulenox', name: 'Bulenox', category: 'Futures', platform: 'Rithmic', accountsCount: 540, totalAccountValue: 18000000, paidPayoutAmount: 3800000 },
]

function formatCompact(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default function FeaturedFirms({ locale, firms }: FeaturedFirmsProps) {
  const displayFirms = firms && firms.length > 0 ? firms.slice(0, 4) : fallbackFirms

  return (
    <section id="firms" className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <BadgeV2 variant="outline" className="border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
              <Building2 className="mr-1.5 h-3 w-3" />
              Featured Firms
            </Badge>
            <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Top prop firms
              <span className="block text-foreground">tracked by our community</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
              Real statistics from verified trader accounts. See which firms deliver on their promises.
            </p>
          </div>
          <Link
            href={`/${locale}/propfirms`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-card/50 [font-family:var(--home-copy)]"
          >
            All Firms
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayFirms.map((firm) => (
            <Link key={firm.id} href={`/${locale}/firm/${firm.slug}`} className="block">
              <Card className="group h-full overflow-hidden rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)] transition-all duration-300 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.08)]">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{firm.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <BadgeV2 variant="secondary" className="border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.5)] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] [font-family:var(--home-copy)]">
                          {firm.category}
                        </Badge>
                        <BadgeV2 variant="secondary" className="border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.5)] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] [font-family:var(--home-copy)]">
                          {firm.platform}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-primary transition-transform group-hover:scale-110">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-[10px] uppercase tracking-[0.12em] [font-family:var(--home-copy)]">Accounts</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold [font-family:var(--home-display)]">{formatCount(firm.accountsCount)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="text-[10px] uppercase tracking-[0.12em] [font-family:var(--home-copy)]">Value</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold [font-family:var(--home-display)]">{formatCompact(firm.totalAccountValue)}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-[10px] uppercase tracking-[0.12em] [font-family:var(--home-copy)]">Paid Payouts</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-emerald-400 [font-family:var(--home-display)]">{formatCompact(firm.paidPayoutAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
