import { getTraderById, getTraderVarSummary } from "../actions/user";

function formatCurrency(value: number): string {
 return new Intl.NumberFormat("en-US", {
 style:"currency",
 currency:"USD",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(value)
}

function formatPercent(value: number): string {
 return `${(value * 100).toFixed(2)}%`
}

export async function TraderInfo({ slug }: { slug: string }) {
 const [traderInfoResponse, varSummaryResponse] = await Promise.all([
 getTraderById(slug),
 getTraderVarSummary(slug),
 ])

 const summary = varSummaryResponse.success ? varSummaryResponse.summary : undefined
 const insufficient = varSummaryResponse.error ==="insufficientData"
 const failed = !varSummaryResponse.success && varSummaryResponse.error

  return (
  <div className="space-y-6">
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.22_260)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Trader Profile</span>
      </div>
      <h2 className="text-lg font-semibold tracking-[-0.01em]">Trader Information</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Email: {traderInfoResponse?.email ? (
          <span className="font-medium text-foreground">{traderInfoResponse.email}</span>
        ) : <span className="text-muted-foreground">No email</span>}
      </p>
    </div>

    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.22_260)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Risk Metrics</span>
      </div>
      <h3 className="text-base font-semibold tracking-[-0.01em]">1-Day Value at Risk</h3>

 {summary ? (
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-4 transition-[border-color,background-color] duration-200 ease-[0.22,1,0.36,1] hover:border-[oklch(0.65_0.22_260/0.18)] hover:bg-[oklch(0.65_0.22_260/0.04)]">
 <p className="text-xs font-medium text-muted-foreground">Hist VaR 95%</p>
 <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.hist95.amount)}</p>
 <p className="text-xs text-muted-foreground">{formatPercent(summary.hist95.percent)}</p>
 </div>
  <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-4 transition-[border-color,background-color] duration-200 ease-[0.22,1,0.36,1] hover:border-[oklch(0.65_0.22_260/0.18)] hover:bg-[oklch(0.65_0.22_260/0.04)]">
 <p className="text-xs font-medium text-muted-foreground">Hist VaR 99%</p>
 <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.hist99.amount)}</p>
 <p className="text-xs text-muted-foreground">{formatPercent(summary.hist99.percent)}</p>
 </div>
  <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-4 transition-[border-color,background-color] duration-200 ease-[0.22,1,0.36,1] hover:border-[oklch(0.65_0.22_260/0.18)] hover:bg-[oklch(0.65_0.22_260/0.04)]">
 <p className="text-xs font-medium text-muted-foreground">Param VaR 95%</p>
 <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.param95.amount)}</p>
 <p className="text-xs text-muted-foreground">{formatPercent(summary.param95.percent)}</p>
 </div>
  <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-4 transition-[border-color,background-color] duration-200 ease-[0.22,1,0.36,1] hover:border-[oklch(0.65_0.22_260/0.18)] hover:bg-[oklch(0.65_0.22_260/0.04)]">
 <p className="text-xs font-medium text-muted-foreground">Param VaR 99%</p>
 <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.param99.amount)}</p>
 <p className="text-xs text-muted-foreground">{formatPercent(summary.param99.percent)}</p>
 </div>
 </div>
 ) : null}

  {insufficient ? (
    <div className="mt-4 rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-4 text-sm text-muted-foreground">
      Not enough trade history to compute VaR (needs 30+ daily observations).
    </div>
  ) : null}

  {failed ? (
    <p className="mt-4 text-sm text-[oklch(0.55_0.22_25)]">
      Could not compute VaR right now. Please try again shortly.
    </p>
  ) : null}
  </div>
  </div>
  );
}
