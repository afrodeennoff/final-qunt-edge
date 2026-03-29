import Link from 'next/link'
import { BadgeV2 } from "@/components/ui/v2"
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Percent, Clock, Zap } from 'lucide-react'

interface DealPreview {
  id: string
  firmName: string
  discountPercent: number
  couponCode: string
  expiryDate: string
  category: string
}

interface DealsPreviewProps {
  locale: string
  deals?: DealPreview[]
}

function formatExpiry(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Expired'
  if (diffDays <= 7) return `${diffDays}d left`
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w left`
  return 'Active'
}

export default function DealsPreview({ locale, deals }: DealsPreviewProps) {
  const displayDeals = deals && deals.length > 0 ? deals.slice(0, 4) : []

  return (
    <section id="deals" className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <BadgeV2 variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
              <Zap className="mr-1.5 h-3 w-3" />
              Hot Deals
            </BadgeV2>
            <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Save on prop firm
              <span className="block text-foreground">challenge fees today</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
              Exclusive coupon codes tracked and verified. Never pay full price for a challenge again.
            </p>
          </div>
          <Link
            href={`/${locale}/deals`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-card/50 [font-family:var(--home-copy)]"
          >
            View All Deals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {displayDeals.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayDeals.map((deal) => (
              <Card
                key={deal.id}
                className="group overflow-hidden rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)] transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{deal.firmName}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">{deal.category}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Percent className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">{deal.discountPercent}%</span>
                    <span className="text-sm text-foreground/80 [font-family:var(--home-copy)]">OFF</span>
                  </div>

                  <div className="mt-4 rounded-lg border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.5)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">Coupon Code</p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wider text-foreground">{deal.couponCode}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground/80 [font-family:var(--home-copy)]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatExpiry(deal.expiryDate)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.7)]">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No live deals are available right now.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
