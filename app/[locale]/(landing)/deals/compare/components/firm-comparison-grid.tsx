import type { UnifiedFirm } from '@/server/deals'

interface FirmComparisonGridProps {
  firms: UnifiedFirm[]
}

function getLowestChallengeFee(firm: UnifiedFirm): number | null {
  const fees = firm.coupons
    .map((coupon) => coupon.challengeFee)
    .filter((fee): fee is number => typeof fee === 'number' && Number.isFinite(fee))

  if (fees.length === 0) {
    return null
  }

  return Math.min(...fees)
}

function formatChallengeFee(fee: number | null): string {
  if (fee === null) return 'N/A'
  if (fee === 0) return 'Free'
  return `$${fee}`
}

export function FirmComparisonGrid({ firms }: FirmComparisonGridProps) {
  return (
    <section className="qe-soft-panel mt-6 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Side-by-side decision matrix</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this as a first-pass filter, then validate exact terms at checkout before committing capital.
          </p>
        </div>
        <p className="qe-soft-surface rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Qunt Edge quick scan
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:hidden">
        {firms.map((firm) => (
          <article key={firm.id} className="qe-soft-surface rounded-xl p-4">
            <h3 className="text-base font-semibold text-foreground">{firm.name}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Typical Entry</dt>
                <dd className="mt-1 font-medium text-foreground">{formatChallengeFee(getLowestChallengeFee(firm))}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Drawdown</dt>
                <dd className="mt-1 font-medium text-foreground">{firm.drawdownType}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Payout Tempo</dt>
                <dd className="mt-1 font-medium text-foreground">{firm.payoutModel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Tracked Accounts</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {firm.catalogueStats?.accountsCount?.toLocaleString() ?? '0'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Paid Payouts</dt>
                <dd className="mt-1 font-medium text-foreground">
                  ${(firm.catalogueStats?.paidPayoutAmount ?? 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
             <tr className="border-b border-border/20 bg-gradient-to-br from-card/30 to-card/5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-3 py-3 font-semibold">Firm</th>
              <th className="px-3 py-3 font-semibold">Typical Entry</th>
              <th className="px-3 py-3 font-semibold">Drawdown Model</th>
              <th className="px-3 py-3 font-semibold">Payout Tempo</th>
              <th className="px-3 py-3 font-semibold">Tracked Accounts</th>
              <th className="px-3 py-3 font-semibold">Paid Payouts</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => (
               <tr key={firm.id} className="border-b border-border/20 transition-colors hover:bg-primary/[0.02] last:border-b-0">
                <td className="sticky left-0 bg-muted/40 px-3 py-4 font-semibold text-foreground">{firm.name}</td>
                <td className="px-3 py-4 text-muted-foreground">
                  {formatChallengeFee(getLowestChallengeFee(firm))}
                </td>
                <td className="px-3 py-4 text-muted-foreground">{firm.drawdownType}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.payoutModel}</td>
                <td className="px-3 py-4 text-muted-foreground">
                  {firm.catalogueStats?.accountsCount?.toLocaleString() ?? '0'}
                </td>
                <td className="px-3 py-4 text-muted-foreground">
                  ${(firm.catalogueStats?.paidPayoutAmount ?? 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
