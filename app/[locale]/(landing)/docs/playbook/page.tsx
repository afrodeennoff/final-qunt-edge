'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Target, BookOpen, CheckCircle, TrendingUp, Award, ArrowRight, Check,
  Tag, BarChart3, Shield, Clock, Edit3, Plus, Zap, Layers, AlertTriangle
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsPlaybookPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How is a playbook different from regular tags?",
      a: "A playbook is a structured strategy system, not just a label. Each playbook has: entry rules, exit rules, risk parameters, market conditions, and a performance history. Tags are applied per-trade; playbooks organize trades into a coherent strategy framework with rule-based tracking."
    },
    {
      q: "Can a trade belong to multiple playbooks?",
      a: "A trade can only belong to one playbook. This ensures clean performance attribution. However, you can still apply multiple freeform tags to a trade within a playbook. If a setup fits multiple strategies, choose the primary one — or create a 'Hybrid' playbook."
    },
    {
      q: "How do I track playbook performance over time?",
      a: "Every playbook has a dedicated performance page showing: win rate, profit factor, equity curve, trade list, average RR, max drawdown, Sharpe ratio, and trade frequency over time. Filter by date range and compare playbooks side-by-side."
    },
    {
      q: "Can I import playbooks from another platform?",
      a: "Not directly, but the CSV import supports a 'Strategy' column that can be mapped to your playbooks. During import, trades with matching strategy names are automatically assigned to the corresponding playbook."
    },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>PLAYBOOK</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Strategy Playbook</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          The Playbook is where you define, track, and optimize your trading strategies. Move beyond tagging — 
          build structured strategy profiles with entry/exit rules, risk parameters, and performance analytics. 
          Know exactly which setups deliver your edge and which ones cost you money.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            My Playbooks <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/behavior`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Behavioral Analysis
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['What is a Playbook?', '#what'],
            ['Creating a Playbook', '#create'],
            ['Structuring Strategy Rules', '#rules'],
            ['Tagging Trades by Playbook', '#tagging'],
            ['Performance by Playbook', '#performance'],
            ['Playbook Comparison', '#comparison'],
            ['Refining Your Playbook', '#refine'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* WHAT IS A PLAYBOOK */}
      <div id="what">
        <div className={eyebrowStyle}>DEFINITION</div>
        <h2 className="ref-h-section mt-2">What is a Playbook?</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><BookOpen className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">A Structured Strategy Profile</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">A playbook is a named, structured strategy that you define once and tag trades against. It is the organized collection of all the trades you take following a specific set of rules. Think of it as your personal trading system library.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
                {[
                  { title: "Consistent Rules", desc: "Each playbook has clearly defined entry criteria, exit rules, stop loss placement, and risk parameters — all documented in your own words." },
                  { title: "Clean Attribution", desc: "Every trade belongs to exactly one playbook. No ambiguous tagging. Your performance by strategy is always accurate and actionable." },
                  { title: "Compoundable Edge", desc: "Track which playbooks work, which ones need adjustment, and which ones should be dropped. Build a portfolio of proven strategies." },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                    <div className="font-medium text-[var(--qe-ref-text)]">{s.title}</div>
                    <div className="text-[var(--qe-ref-text-muted)] mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATING */}
      <div id="create">
        <div className={eyebrowStyle}>SETUP</div>
        <h2 className="ref-h-section mt-2">Creating a Playbook</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Create from Scratch</div>
            </div>
            <p className={bodySmall}>Navigate to the Playbook page (sidebar) and click "Create Playbook." Give it a name (e.g., "ES Breakout Momentum"), add a description, and optionally set a color for visual identification. Your playbook appears in the playbook list and is ready for trade tagging.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Create from Tag History</div>
            </div>
            <p className={bodySmall}>If you have existing tags that represent a strategy (e.g., all trades tagged "breakout"), you can create a playbook from that tag. The system automatically assigns all historical trades with that tag to the new playbook — instant strategy history.</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Example Playbook: "ES Breakout Momentum"</div>
          <div className="grid gap-2 md:grid-cols-4 text-xs">
            {[
              { label: "Entry", value: "Price breaks above 20-period high with volume > 1.5x average" },
              { label: "Exit", value: "Trailing stop at 10-period low or 2:1 R:R take profit" },
              { label: "Risk", value: "Stop at recent swing low. Max risk 1% of account" },
              { label: "Filters", value: "Only ES futures. No news events. Trend must be > 20 EMA" },
            ].map((f, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-2.5">
                <div className="font-medium text-[var(--qe-ref-green)]">{f.label}</div>
                <div className="text-[var(--qe-ref-text-muted)] mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RULES */}
      <div id="rules">
        <div className={eyebrowStyle}>STRUCTURE</div>
        <h2 className="ref-h-section mt-2">Structuring Strategy Rules</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: Target, name: "Entry Rules", desc: "Define what conditions must be met before entering. Price action patterns, indicator confirmations, volume requirements, time filters, and market regime conditions. Each rule is documented in natural language." },
            { icon: Shield, name: "Exit Rules", desc: "Specify your profit targets, stop loss placement, trailing stop rules, and time-based exits. Document both the 'what' and the 'why' behind each exit rule." },
            { icon: AlertTriangle, name: "Risk Parameters", desc: "Define position sizing (fixed risk % or R-multiple), max daily trades for this strategy, max loss per trade/session, and any correlation filters with other playbooks." },
          ].map((r, i) => (
            <div key={i} className={cardMain}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                <r.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{r.name}</div>
              <p className={bodySmall + ' mt-2'}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TAGGING */}
      <div id="tagging">
        <div className={eyebrowStyle}>WORKFLOW</div>
        <h2 className="ref-h-section mt-2">Tagging Trades by Playbook</h2>
        <div className="cardMain">
          <p className={bodySmall}>Once your playbooks are created, tagging trades is fast and integrated into your existing workflow:</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs">
            {[
              { step: "During Import", desc: "Map a 'Strategy' column in your CSV to match playbook names. Trades are automatically assigned during import." },
              { step: "From Trade Log", desc: "Batch-select trades and assign a playbook from the bulk actions menu. Also available in the inline edit for individual trades." },
              { step: "From Journal", desc: "When journaling a trade, the playbook selector appears alongside tags. Pick the strategy that this trade belongs to." },
            ].map((s, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                <div className="font-medium text-[var(--qe-ref-green)] mb-1">Method {i+1}: {s.step}</div>
                <div className="text-[var(--qe-ref-text-muted)]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERFORMANCE */}
      <div id="performance">
        <div className={eyebrowStyle}>ANALYTICS</div>
        <h2 className="ref-h-section mt-2">Performance by Playbook</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Every playbook has a dedicated performance dashboard accessible from the Playbook page. This is where the real value lives — knowing exactly which strategies work and which ones don't.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Per-Playbook Metrics</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {[
                "Win Rate & Profit Factor",
                "Total P&L and Avg P&L/Trade",
                "Average R-Multiple",
                "Max Consecutive Wins/Losses",
                "Sharpe & Sortino Ratios",
                "Trade Frequency (daily/weekly)",
                "Average Position Time",
                "Best/Worst Single Trade",
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                  <Check className="h-3 w-3 text-[var(--qe-ref-green)] shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Playbook Dashboard</div>
            <p className={bodySmall + ' mt-2'}>Each playbook has its own mini-dashboard showing: equity curve (trades filtered to this strategy only), P&L distribution, time-of-day heatmap, weekday performance, and instrument breakdown. The Copilot adds strategy-specific insights: "Your ES Breakout playbook has a 70% win rate in the morning but drops to 45% after 2pm."</p>
          </div>
        </div>
      </div>

      {/* COMPARISON */}
      <div id="comparison">
        <div className={eyebrowStyle}>STRATEGY SELECTION</div>
        <h2 className="ref-h-section mt-2">Playbook Comparison</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><BarChart3 className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Side-by-Side Strategy Performance</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Select any 2-5 playbooks and view a side-by-side comparison table. See win rate, total P&L, profit factor, trade count, and average RR for each. The comparison highlights the best performer in each metric in green. The Copilot adds analysis: "Your Reversal playbook is more profitable per trade, but your Breakout playbook has double the trade frequency and a higher total P&L."</p>
            </div>
          </div>
        </div>
      </div>

      {/* REFINE */}
      <div id="refine">
        <div className={eyebrowStyle}>ITERATION</div>
        <h2 className="ref-h-section mt-2">Refining Your Playbook</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Editing Playbook Rules</div>
            </div>
            <p className={bodySmall}>As you learn what works, update your playbook rules. Each change is versioned — you can see the evolution of your strategy over time. When you edit rules, old trades remain assigned to the playbook with their original context, but new trades are evaluated against the updated rules.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Retiring Weak Playbooks</div>
            </div>
            <p className={bodySmall}>If a playbook consistently underperforms (configurable threshold: e.g., negative expectancy over 20+ trades), the Copilot flags it for review. You can archive the playbook to remove it from active use while preserving its historical data. Archived playbooks can be reactivated at any time.</p>
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

      {/* PRACTICE & DRILLS */}
      <div id="drills">
        <div className={eyebrowStyle}>COMING SOON</div>
        <h2 className="ref-h-section mt-2">Practice &amp; Drills</h2>
        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <p className="text-sm text-[var(--qe-ref-text-muted)]">
            Qunt Edge currently supports structured review through the <Link href={`/${locale}/docs/playbook`} className="text-[var(--qe-ref-green)] hover:underline">Playbook (Strategies)</Link> and <Link href={`/${locale}/docs/behavior`} className="text-[var(--qe-ref-green)] hover:underline">Behavior Analysis</Link> pages. You can create deliberate practice rules and then use <Link href={`/${locale}/docs/analytics`} className="text-[var(--qe-ref-green)] hover:underline">Copilot + Statistics</Link> to run your own drill-style reviews against historical data. A dedicated simulation/drills sandbox is on the roadmap.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Build your strategy library</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Define. Track. Compare. Compound. Your edge is in the playbook.</p>
        <Link href={`/${locale}/docs/behavior`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Behavioral Analysis <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/statistics`} className="underline underline-offset-2 hover:no-underline">Statistics</Link> • <Link href={`/${locale}/docs/journal`} className="underline underline-offset-2 hover:no-underline">Trade Journal</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The Playbook system turns strategy documentation from a chore into your most valuable trading asset.</div>
    </div>
  )
}
