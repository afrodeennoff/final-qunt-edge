'use client'

import { useMemo, useState } from 'react'
import { Badge } from "@/components/ui/badge"

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function EvalCostCalculator() {
  const [evaluationFee, setEvaluationFee] = useState('149')
  const [expectedResets, setExpectedResets] = useState('1')
  const [resetCost, setResetCost] = useState('99')
  const [monthlyPlatformFees, setMonthlyPlatformFees] = useState('35')
  const [targetPayout, setTargetPayout] = useState('1200')

  const values = useMemo(() => {
    const fee = Math.max(0, toNumber(evaluationFee, 0))
    const resets = Math.max(0, toNumber(expectedResets, 0))
    const resetUnitCost = Math.max(0, toNumber(resetCost, 0))
    const platform = Math.max(0, toNumber(monthlyPlatformFees, 0))
    const payoutGoal = Math.max(0, toNumber(targetPayout, 0))

    const expectedTotalCost = fee + resets * resetUnitCost + platform
    const netTargetAfterCosts = Math.max(0, payoutGoal - expectedTotalCost)
    const minReturnNeeded = expectedTotalCost === 0 ? 0 : (expectedTotalCost / Math.max(payoutGoal, 1)) * 100

    const riskBand = minReturnNeeded > 40 ? 'high' : minReturnNeeded > 25 ? 'mid' : 'low'

    return {
      expectedTotalCost,
      netTargetAfterCosts,
      minReturnNeeded,
      riskBand,
    }
  }, [evaluationFee, expectedResets, resetCost, monthlyPlatformFees, targetPayout])

  return (
<<<<<<< HEAD
    <section className="qe-soft-panel mt-6 rounded-2xl p-5 sm:p-6">
=======
    <section className="qe-soft-panel mt-6 rounded-3xl p-5 sm:p-6">
>>>>>>> origin/main
      <div className="qe-soft-surface mb-4 rounded-xl p-3">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Planner Inputs</p>
        <p className="mt-1 text-sm text-foreground/95">Adjust values to simulate realistic month-one evaluation economics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground/95">Evaluation fee (USD)</span>
          <input
            value={evaluationFee}
            onChange={(event) => setEvaluationFee(event.target.value)}
            inputMode="decimal"
<<<<<<< HEAD
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground/95 outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
=======
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
>>>>>>> origin/main
            placeholder="149"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground/95">Expected resets this month</span>
          <input
            value={expectedResets}
            onChange={(event) => setExpectedResets(event.target.value)}
            inputMode="numeric"
<<<<<<< HEAD
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground/95 outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
=======
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
>>>>>>> origin/main
            placeholder="1"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground/95">Average reset cost (USD)</span>
          <input
            value={resetCost}
            onChange={(event) => setResetCost(event.target.value)}
            inputMode="decimal"
<<<<<<< HEAD
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground/95 outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
=======
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
>>>>>>> origin/main
            placeholder="99"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-foreground/95">Platform/data fees (USD)</span>
          <input
            value={monthlyPlatformFees}
            onChange={(event) => setMonthlyPlatformFees(event.target.value)}
            inputMode="decimal"
<<<<<<< HEAD
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground/95 outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
=======
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
>>>>>>> origin/main
            placeholder="35"
          />
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-foreground/95">Target gross payout (USD)</span>
          <input
            value={targetPayout}
            onChange={(event) => setTargetPayout(event.target.value)}
            inputMode="decimal"
<<<<<<< HEAD
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground/95 outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
=======
            className="w-full rounded-lg border border-border/35 bg-background px-3 py-2 text-foreground outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary/25"
>>>>>>> origin/main
            placeholder="1200"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="qe-soft-surface rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Expected Cost</p>
          <p className="mt-2 text-2xl font-semibold text-foreground/95">${values.expectedTotalCost.toFixed(0)}</p>
        </article>
        <article className="qe-soft-surface rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Net After Costs</p>
          <p className="mt-2 text-2xl font-semibold text-foreground/95">${values.netTargetAfterCosts.toFixed(0)}</p>
        </article>
        <article className="qe-soft-surface rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Cost-to-Payout Ratio</p>
          <p className="mt-2 text-2xl font-semibold text-foreground/95">{values.minReturnNeeded.toFixed(1)}%</p>
          <p className="mt-2">
            <Badge variant={values.riskBand === 'high' ? 'error' : values.riskBand === 'mid' ? 'default' : 'secondary'}>
              {values.riskBand === 'high' ? 'High pressure band' : values.riskBand === 'mid' ? 'Manageable band' : 'Healthy planning range'}
            </Badge>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {values.riskBand === 'high'
              ? 'Reduce costs or increase expected payout buffer before starting.'
              : values.riskBand === 'mid'
              ? 'Manageable with strict discipline and reset controls.'
              : 'Good baseline for controlled execution.'}
          </p>
        </article>
      </div>
    </section>
  )
}
