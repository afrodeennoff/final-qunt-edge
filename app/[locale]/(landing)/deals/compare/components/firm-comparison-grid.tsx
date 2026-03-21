import type { UnifiedFirm } from '@/server/deals'

interface FirmComparisonGridProps {
  firms: UnifiedFirm[]
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
              <th className="px-3 py-3 font-semibold">Reset Policy</th>
              <th className="px-3 py-3 font-semibold">Drawdown Model</th>
              <th className="px-3 py-3 font-semibold">Payout Tempo</th>
              <th className="px-3 py-3 font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => (
              <tr key={firm.id} className="border-b border-border/70 transition-colors hover:bg-background/50 last:border-b-0">
                <td className="sticky left-0 bg-card px-3 py-4 font-semibold text-foreground">{firm.name}</td>
                <td className="px-3 py-4 text-muted-foreground">
                  {/* Show the best (highest discount) coupon's challenge fee, or "Free" if 0 */}
                  {firm.coupons.length > 0 ? (
                    firm.coupons[0].challengeFee === 0 ? 'Free' : `$${firm.coupons[0].challengeFee}`
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-3 py-4 text-muted-foreground">
                  {/* Reset policy - not directly in data, infer from drawdown type or show N/A */}
                  {firm.drawdownType === 'Trailing' ? 'Daily' : firm.drawdownType === 'Static' ? 'Fixed' : 'End-of-day'}
                </td>
                <td className="px-3 py-4 text-muted-foreground">
                  {/* Drawdown model maps directly */}
                  {firm.drawdownType}
                </td>
                <td className="px-3 py-4 text-muted-foreground">
                  {/* Payout tempo maps directly */}
                  {firm.payoutModel}
                </td>
                <td className="px-3 py-4">
                  <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground">
                    {/* Best for - combine profit split and max allocation */}
                    {firm.profitSplit} split • {firm.maxAllocation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 lg:hidden">
        {firms.map((firm) => (
          <article key={firm.id} className="rounded-xl border border-border bg-background/50 p-4">
            <h3 className="text-lg font-semibold text-foreground">{firm.name}</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Typical Entry</dt>
                <dd className="text-lg font-semibold text-foreground">
                  {firm.coupons.length > 0 ? (
                    firm.coupons[0].challengeFee === 0 ? 'Free' : `$${firm.coupons[0].challengeFee}`
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Reset Policy</dt>
                <dd className="text-foreground">
                  {firm.drawdownType === 'Trailing' ? 'Daily' : firm.drawdownType === 'Static' ? 'Fixed' : 'End-of-day'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Drawdown Model</dt>
                <dd className="text-foreground">{firm.drawdownType}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Payout Tempo</dt>
                <dd className="text-foreground">{firm.payoutModel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Best For</dt>
                <dd className="text-foreground">
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">
                    {firm.profitSplit} split • {firm.maxAllocation}
                  </span>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}