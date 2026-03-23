<<<<<<< HEAD
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
=======
const firms = [
  {
    name: 'Apex Trader Funding',
    onboardingCost: '$167',
    resetPolicy: 'Optional paid reset',
    drawdownStyle: 'Trailing threshold',
    payoutTempo: 'Bi-weekly eligible windows',
    bestFor: 'High-frequency consistency plans',
  },
  {
    name: 'Take Profit Trader',
    onboardingCost: '$149',
    resetPolicy: 'Discounted retry tiers',
    drawdownStyle: 'Static intraday buffer',
    payoutTempo: 'Weekly cadence after approval',
    bestFor: 'Traders prioritizing predictable caps',
  },
  {
    name: 'Lucid Trading',
    onboardingCost: '$189',
    resetPolicy: 'Bundle-friendly resets',
    drawdownStyle: 'EOD drawdown lock',
    payoutTempo: 'Structured monthly cycles',
    bestFor: 'Multi-account rollout strategies',
  },
]

export function FirmComparisonGrid() {
>>>>>>> main
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
<<<<<<< HEAD
              <th className="px-3 py-3 font-semibold">Drawdown Model</th>
              <th className="px-3 py-3 font-semibold">Payout Tempo</th>
              <th className="px-3 py-3 font-semibold">Tracked Accounts</th>
              <th className="px-3 py-3 font-semibold">Paid Payouts</th>
=======
              <th className="px-3 py-3 font-semibold">Reset Policy</th>
              <th className="px-3 py-3 font-semibold">Drawdown Model</th>
              <th className="px-3 py-3 font-semibold">Payout Tempo</th>
              <th className="px-3 py-3 font-semibold">Best For</th>
>>>>>>> main
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => (
<<<<<<< HEAD
              <tr key={firm.id} className="border-b border-border/70 transition-colors hover:bg-background/50 last:border-b-0">
                <td className="sticky left-0 bg-card px-3 py-4 font-semibold text-foreground">{firm.name}</td>
                <td className="px-3 py-4 text-muted-foreground">
                  {formatChallengeFee(getLowestChallengeFee(firm))}
                </td>
                <td className="px-3 py-4 text-muted-foreground">{firm.drawdownType}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.payoutModel}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.catalogueStats.accountsCount.toLocaleString()}</td>
                <td className="px-3 py-4 text-foreground">${firm.catalogueStats.paidPayoutAmount.toLocaleString()}</td>
=======
              <tr key={firm.name} className="border-b border-border/70 transition-colors hover:bg-background/50 last:border-b-0">
                <td className="sticky left-0 bg-card px-3 py-4 font-semibold text-foreground">{firm.name}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.onboardingCost}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.resetPolicy}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.drawdownStyle}</td>
                <td className="px-3 py-4 text-muted-foreground">{firm.payoutTempo}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground">
                    {firm.bestFor}
                  </span>
                </td>
>>>>>>> main
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 lg:hidden">
        {firms.map((firm) => (
<<<<<<< HEAD
          <article key={firm.id} className="rounded-xl border border-border bg-background/50 p-4">
=======
          <article key={firm.name} className="rounded-xl border border-border bg-background/50 p-4">
>>>>>>> main
            <h3 className="text-lg font-semibold text-foreground">{firm.name}</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Typical Entry</dt>
<<<<<<< HEAD
                <dd className="text-lg font-semibold text-foreground">{formatChallengeFee(getLowestChallengeFee(firm))}</dd>
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
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Tracked Accounts</dt>
                <dd className="text-foreground">{firm.catalogueStats.accountsCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Paid Payouts</dt>
                <dd className="text-foreground">${firm.catalogueStats.paidPayoutAmount.toLocaleString()}</dd>
=======
                <dd className="text-lg font-semibold text-foreground">{firm.onboardingCost}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Reset Policy</dt>
                <dd className="text-foreground">{firm.resetPolicy}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Drawdown Model</dt>
                <dd className="text-foreground">{firm.drawdownStyle}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Payout Tempo</dt>
                <dd className="text-foreground">{firm.payoutTempo}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Best For</dt>
                <dd className="text-foreground">
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">{firm.bestFor}</span>
                </dd>
>>>>>>> main
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
