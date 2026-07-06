'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  BarChart3, TrendingUp, Award, Shield, Clock, Target, ArrowRight, Check,
  TrendingDown, Activity, Percent, ChevronUp, ChevronDown, Zap,
  Calendar, PieChart, Split, Hash
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function DocsStatisticsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Which statistics are calculated automatically vs requiring journal data?",
      a: "Core statistics (P&L, win rate, profit factor, avg RR, streaks, expectancy) are calculated from trade data alone. Behavioral and strategic stats (tag performance, emotion correlation, discipline scores, leaderboard ranking) require journal entries and tags. The Statistics page clearly labels which stats need journal enrichment."
    },
    {
      q: "Do date range filters affect all statistics?",
      a: "Yes — every statistic on this page respects the global filter context (date range, account, instrument, tags). Change the date range and all widgets re-compute against the filtered trade set. This makes it easy to compare monthly performance, or analyze specific setups."
    },
    {
      q: "How is the Profit Factor calculated?",
      a: "Profit Factor = Gross Profit / Gross Loss (absolute value). A PF of 1.87 means you earn $1.87 for every $1.00 lost. This is calculated on commissions-adjusted P&L. The same formula is used by professional fund managers."
    },
    {
      q: "What is the difference between Avg RR and Total RR?",
      a: "Average RR = (Average Winning P&L) / (Average Losing P&L). Total RR = (Total Winning P&L) / (Total Losing P&L). Avg RR shows the typical risk-reward of a single trade. Total RR incorporates the effect of win rate — a 1.5 Avg RR with 40% win rate yields a different Total RR than with 60%."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>STATISTICS</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Professional Performance Statistics</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          The Statistics page is your analytical command center. Every raw metric a professional trader needs — win rate, profit factor, risk-reward, streaks, long/short breakdown, 
          cumulative P&L, average position time, and more — calculated in real-time across any filter you choose.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/statistics`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            View Statistics <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/analytics`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Analytics &amp; Copilot
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Core KPIs Overview', '#kpis'],
            ['Win Rate, Profit Factor & R:R', '#core'],
            ['Streaks & Consistency', '#streaks'],
            ['Long vs Short Breakdown', '#sides'],
            ['Cumulative P&L & Equity', '#pnl'],
            ['Average Position Time', '#time'],
            ['Trade Performance by Instrument', '#instruments'],
            ['Date Ranges & Filters', '#filters'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* CORE KPIS */}
      <div id="kpis">
        <div className={eyebrowStyle}>AT A GLANCE</div>
        <h2 className="ref-h-section mt-2">Core KPIs</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          These 6 numbers tell you everything about your trading health. They are displayed as KPI cards on both the Statistics page and the Dashboard widget canvas.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: TrendingUp, name: "Cumulative P&L", desc: "Net realized P&L across all closed trades in the filtered date range. Commission and fee adjusted. Color-coded green/red with delta vs prior period.", metric: "+$14,280" },
            { icon: Percent, name: "Win Rate", desc: "Winning trades / Total closed trades × 100. Excludes breakeven trades (configurable in settings). A 55%+ win rate with 1.5+ RR is the institutional benchmark.", metric: "64%" },
            { icon: Shield, name: "Profit Factor", desc: "Gross Profit / Gross Loss. The single most important risk-adjusted metric. Above 1.5 is good, above 2.0 is excellent. Professional funds target 1.75+.", metric: "1.87" },
            { icon: Target, name: "Avg Risk-Reward", desc: "Average winner size / Average loser size. A 1.5 Avg RR means your typical win is 1.5x your typical loss. This is the pure measure of your trade selection edge.", metric: "1.42" },
            { icon: Zap, name: "Expectancy (R)", desc: "Average P&L expressed in R-multiples (average risk unit). An expectancy of 0.38R means every trade nets 0.38× your average risk. The single best measure of system quality.", metric: "0.38R" },
            { icon: Clock, name: "Avg Position Time", desc: "Mean hold time across all trades. Critical for matching your strategy type (scalp <5min, intraday 15min-4hr, swing 1-7 days).", metric: "47m" },
          ].map((w, i) => (
            <div key={i} className={cardMain}>
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                  <w.icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-right text-[18px] font-semibold tabular-nums text-[var(--qe-ref-green)]">{w.metric}</div>
              </div>
              <div className={cn(headingCard, 'mt-3')}>{w.name}</div>
              <p className={bodySmall + ' mt-1'}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CORE STATS */}
      <div id="core">
        <div className={eyebrowStyle}>DEEP METRICS</div>
        <h2 className="ref-h-section mt-2">Win Rate, Profit Factor &amp; Risk-Reward</h2>

        <div className="mt-4 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">CORE STATISTICS BREAKDOWN</div>
          <svg viewBox="0 0 880 260" className="w-full h-auto max-h-[240px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="840" height="220" rx="12" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Win Rate big number */}
            <rect x="40" y="40" width="180" height="180" rx="10" fill="rgba(0,255,159,0.06)" />
            <text x="130" y="80" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle" fontWeight="600">WIN RATE</text>
            <text x="130" y="140" fill="var(--qe-ref-green)" fontSize="42" textAnchor="middle" fontWeight="700">64%</text>
            <text x="130" y="165" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">427 Wins / 668 Total</text>
            <text x="130" y="195" fill="var(--qe-ref-green)" fontSize="9" textAnchor="middle">▲ 3% vs last month</text>

            {/* Profit Factor big number */}
            <rect x="240" y="40" width="180" height="180" rx="10" fill="rgba(99,102,241,0.06)" />
            <text x="330" y="80" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle" fontWeight="600">PROFIT FACTOR</text>
            <text x="330" y="140" fill="#818cf8" fontSize="42" textAnchor="middle" fontWeight="700">1.87</text>
            <text x="330" y="165" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">$24,580 / $13,140</text>
            <text x="330" y="195" fill="#818cf8" fontSize="9" textAnchor="middle">Gross Profit ÷ Gross Loss</text>

            {/* Avg RR big number */}
            <rect x="440" y="40" width="180" height="180" rx="10" fill="rgba(251,191,36,0.06)" />
            <text x="530" y="80" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle" fontWeight="600">AVG RISK-REWARD</text>
            <text x="530" y="140" fill="#fbbf24" fontSize="42" textAnchor="middle" fontWeight="700">1.42</text>
            <text x="530" y="165" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Avg Win $57 / Avg Loss $40</text>
            <text x="530" y="195" fill="#fbbf24" fontSize="9" textAnchor="middle">Your typical edge per trade</text>

            {/* Extra metrics */}
            <rect x="640" y="40" width="200" height="78" rx="8" fill="var(--qe-ref-surface-2)" />
            <text x="660" y="60" fill="var(--qe-ref-text-muted)" fontSize="9">TOTAL RR</text>
            <text x="660" y="85" fill="var(--qe-ref-text)" fontSize="16" fontWeight="700">1.72</text>
            <text x="660" y="105" fill="var(--qe-ref-text-muted)" fontSize="8">Total Win / Total Loss</text>

            <rect x="640" y="132" width="200" height="78" rx="8" fill="var(--qe-ref-surface-2)" />
            <text x="660" y="152" fill="var(--qe-ref-text-muted)" fontSize="9">EXPECTANCY ($)</text>
            <text x="660" y="177" fill="var(--qe-ref-text)" fontSize="16" fontWeight="700">$16.40</text>
            <text x="660" y="197" fill="var(--qe-ref-text-muted)" fontSize="8">Avg P&L per trade</text>
          </svg>
        </div>
      </div>

      {/* STREAKS */}
      <div id="streaks">
        <div className={eyebrowStyle}>CONSISTENCY</div>
        <h2 className="ref-h-section mt-2">Streaks &amp; Consistency Metrics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <ChevronUp className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Win / Loss Streaks</div>
            </div>
            <p className={bodySmall}>Current and longest winning streaks and losing streaks displayed prominently. Track your longest win streak (consecutive profitable trades) and longest loss streak. The Statistics page shows the date range and P&L impact of each streak. A growing loss streak triggers an optional in-app alert.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <ChevronDown className="h-4 w-4 text-red-400" />
              <div className={headingCard}>Max Drawdown &amp; Recovery</div>
            </div>
            <p className={bodySmall}>Maximum peak-to-trough drawdown over the filtered period. Duration of drawdown (days in the red). Average recovery time. These are the metrics prop firms care about most — and the Statistics page tracks them with the same methodology used by professional fund allocators.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Consecutive Days Metrics</div>
            </div>
            <p className={bodySmall}>Start tracking consistency at the day level: consecutive green days, consecutive red days, green day percentage, average green day P&L, average red day P&L. This reveals whether your profitability is driven by a few huge days or steady daily compounding.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Sharpe, Sortino &amp; Calmar Ratios</div>
            </div>
            <p className={bodySmall}>Institutional-grade risk-adjusted performance metrics. Sharpe ratio (excess return per unit of total volatility), Sortino (downside volatility only), and Calmar (return over max drawdown). These are the numbers professional money managers use to evaluate traders.</p>
          </div>
        </div>
      </div>

      {/* LONG VS SHORT */}
      <div id="sides">
        <div className={eyebrowStyle}>DIRECTIONAL ANALYSIS</div>
        <h2 className="ref-h-section mt-2">Long vs Short Breakdown</h2>
        <div className="cardMain">
          <p className={bodySmall}>One of the most revealing splits in trading performance. The Statistics page automatically separates all trades by side and compares:</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className={cardNested}>
              <div className="flex items-center gap-2 text-[var(--qe-ref-green)] font-semibold text-sm mb-1">▲ LONG TRADES</div>
              <div className="space-y-1 text-xs text-[var(--qe-ref-text-muted)]">
                <div className="flex justify-between"><span>Total Trades:</span><span className="text-[var(--qe-ref-text)]">342</span></div>
                <div className="flex justify-between"><span>Win Rate:</span><span className="text-[var(--qe-ref-green)]">68%</span></div>
                <div className="flex justify-between"><span>Net P&L:</span><span className="text-[var(--qe-ref-green)]">+$8,240</span></div>
                <div className="flex justify-between"><span>Avg RR:</span><span className="text-[var(--qe-ref-text)]">1.52</span></div>
                <div className="flex justify-between"><span>Avg Position Time:</span><span className="text-[var(--qe-ref-text)]">38m</span></div>
              </div>
            </div>
            <div className={cardNested}>
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1">▼ SHORT TRADES</div>
              <div className="space-y-1 text-xs text-[var(--qe-ref-text-muted)]">
                <div className="flex justify-between"><span>Total Trades:</span><span className="text-[var(--qe-ref-text)]">326</span></div>
                <div className="flex justify-between"><span>Win Rate:</span><span className="text-red-400">59%</span></div>
                <div className="flex justify-between"><span>Net P&L:</span><span className="text-[var(--qe-ref-green)]">+$5,940</span></div>
                <div className="flex justify-between"><span>Avg RR:</span><span className="text-[var(--qe-ref-text)]">1.28</span></div>
                <div className="flex justify-between"><span>Avg Position Time:</span><span className="text-[var(--qe-ref-text)]">52m</span></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--qe-ref-text-muted)] mt-3">The side breakdown helps you identify directional bias. Are you naturally better on the long side? Do you force shorts when the trend is up? These insights directly inform strategy adjustments.</p>
        </div>
      </div>

      {/* PNL */}
      <div id="pnl">
        <div className={eyebrowStyle}>EQUITY</div>
        <h2 className="ref-h-section mt-2">Cumulative P&L &amp; Equity Curve</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Equity Curve</div>
            <p className={bodySmall + ' mt-2'}>The cumulative P&L chart plotted over time. Every trade adds a point to the curve. Interactive zoom, key trade markers, and drawdown overlay. The equity curve is the single most honest picture of your trading journey — no dashboard is complete without it.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">P&L Distribution</div>
            <p className={bodySmall + ' mt-2'}>Histogram of individual trade P&L outcomes. See at a glance whether your P&L comes from many small wins (scalping profile) or fewer large winners (swing profile). The shape of this distribution reveals more about your trading style than any single number.</p>
          </div>
        </div>
      </div>

      {/* POSITION TIME */}
      <div id="time">
        <div className={eyebrowStyle}>TIME ANALYSIS</div>
        <h2 className="ref-h-section mt-2">Average Position Time</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Clock className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Hold Time Distribution &amp; Strategy Fit</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">
                The Statistics page calculates average, median, and distribution of position hold times. This is broken into natural buckets: under 1 minute (scalp), 1-5 min, 5-15 min, 15-60 min, 1-4 hours (intraday), 4-24 hours, and 1+ day (swing).
              </p>
              <p className="text-sm text-[var(--qe-ref-text-muted]) mt-2">
                Cross-reference hold time with P&L: do your best trades happen in the first 5 minutes? Do you hold losers too long (a classic behavioral red flag)? The time analysis reveals these patterns automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BY INSTRUMENT */}
      <div id="instruments">
        <div className={eyebrowStyle}>PER-INSTRUMENT</div>
        <h2 className="ref-h-section mt-2">Trade Performance by Instrument</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Instrument Grid</div>
            <p className={bodySmall + ' mt-2'}>A table showing every instrument you have traded, sorted by any metric. Columns include: trades, win rate, net P&L, profit factor, avg RR, total RR, avg position time, and max drawdown. Click any row to filter the entire Statistics page to that instrument only.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Best vs Worst Instruments</div>
            <p className={bodySmall + ' mt-2'}>Automatically highlighted best and worst performing instruments. The Copilot adds context: "ES is your best instrument (68% win rate, $3.40 avg profit per trade). NQ is your worst (52% win rate, -$1.20 avg loss). Consider reducing NQ size."</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div id="filters">
        <div className={eyebrowStyle}>CONTROL</div>
        <h2 className="ref-h-section mt-2">Date Ranges &amp; Filters</h2>
        <div className="cardMain">
          <p className={bodySmall}>Every statistic on this page respects the same global filter context as the Dashboard. Change any filter and all statistics re-compute instantly. Key filter dimensions:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { name: "Date Range", desc: "Today, This Week, This Month, Last 30 Days, Last 90 Days, YTD, All Time, or Custom range" },
              { name: "Account", desc: "Filter to one account or compare across all connected accounts" },
              { name: "Instrument", desc: "Single instrument or multi-select comparison" },
              { name: "Tag", desc: "Filter by setup type, mistake category, or any custom tag" },
              { name: "Side", desc: "Long only, Short only, or both" },
              { name: "Weekday", desc: "Analyze performance by specific days of the week" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs">
                <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" />
                <div><span className="font-medium text-[var(--qe-ref-text)]">{f.name}:</span> {f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq">
        <div className={eyebrowStyle}>QUESTIONS</div>
        <h2 className="ref-h-section mt-2">Common Questions</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((faq, index) => (
            <details key={index} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? null : index)} className="group rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium">
                {faq.q}
                <span className="text-[var(--qe-ref-text-muted)] group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[var(--qe-ref-text-muted)] border-t border-[var(--qe-ref-card-border)] pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Let the numbers guide your edge</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Every metric is one click away from the trade that produced it.</p>
        <Link href={`/${locale}/docs/analytics`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Analytics &amp; Copilot <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/dashboard`} className="underline underline-offset-2 hover:no-underline">Dashboard Widgets</Link> • <Link href={`/${locale}/docs/playbook`} className="underline underline-offset-2 hover:no-underline">Strategy Playbook</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">All statistics use commissions-adjusted P&L and respect the current filter context.</div>
    </div>
  )
}
