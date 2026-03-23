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
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Side-by-side decision matrix</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this as a first-pass filter, then validate exact terms at checkout before committing capital.
          </p>
        </div>
        <p className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Qunt Edge quick scan
        </p>
      </div>

      <div className="mt-5 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted-foreground">
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
              <tr key={firm.id} className="border-b border-border/70 transition-colors hover:bg-background/50 last:border-b-0">
                <td className="sticky left-0 bg-card px-3 py-4 font-semibold text-foreground">{firm.name}</td>
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
