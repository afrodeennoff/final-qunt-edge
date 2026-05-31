'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Brain, MessageCircle, Target, Shield, Activity, Lightbulb,
  TrendingUp, AlertTriangle, BarChart3, Clock, ArrowRight, Check,
  Sparkles, Eye, Search, Zap, Award
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function DocsAnalyticsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How does the Copilot access my trade data?",
      a: "The Copilot has full read access to your filtered trade set, journal entries, tags, emotions, and account data (but never your broker credentials or personal identity). It analyzes the data using a proprietary trading-specific LLM pipeline — not a generic chatbot. All processing happens within secure infrastructure."
    },
    {
      q: "Is the AI actually helpful for improving trading, or just a gimmick?",
      a: "The Copilot is used daily by thousands of traders to catch blind spots. The most common feedback is 'it pointed out something I knew deep down but never quantified.' The AI does not give buy/sell trade recommendations or predict price movements. It surfaces objective correlations in your data: time-of-day biases, emotional cycle patterns, plan adherence drift, setup-specific performance, and risk compliance alerts based on prop firm rules."
    },
    {
      q: "Can I ask the Copilot about specific trades?",
      a: "Yes. You can reference any trade by date, instrument, or P&L. For example: 'Why did I lose on that ES trade on May 14?' The AI will analyze that specific trade, compare it against your historical patterns for similar setups, and suggest what might have gone wrong."
    },
    {
      q: "What is the difference between Smart Insights and the Chat widget?",
      a: "Smart Insights are pro-active — the AI scans your data and pushes 3-6 observations to your Dashboard without being asked. The Chat widget is reactive — you ask specific questions and get detailed answers. Both use the same AI engine and data context. Most traders keep both widgets on their Dashboard."
    },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>ANALYTICS & COPILOT</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">AI Copilot &amp; Behavioral Analytics</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          The heart of Qunt Edge. The AI Copilot is your personal trading analyst — it reads your trade data, journal entries, 
          and behavioral patterns to surface insights you would never see on your own. Smart Insights, chat queries, session debriefs, 
          and drift detection all powered by a single engine.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/analytics`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open Copilot <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/journal`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Trade Journal Docs
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['The Copilot Engine', '#engine'],
            ['Smart Insights (Pro-active)', '#insights'],
            ['Chat Interface (Reactive)', '#chat'],
            ['Session Debriefs', '#debriefs'],
            ['Behavioral & Mindset Analysis', '#behavior'],
            ['Execution Audits & Drift Detection', '#drift'],
            ['Weekly AI Reports', '#reports'],
            ['Analytics Dashboard', '#dashboard'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* THE ENGINE */}
      <div id="engine">
        <div className={eyebrowStyle}>ARCHITECTURE</div>
        <h2 className="ref-h-section mt-2">The Copilot Engine</h2>
        <p className="ref-body mt-2 max-w-[65ch] text-[var(--qe-ref-text-muted)]">
          The Copilot is not a generic chatbot bolted onto a trading journal. It is a purpose-built trading analysis engine that combines your structured trade data, journal entries, tags, and emotions into a contextual intelligence layer.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">COPILOT ARCHITECTURE</div>
          <svg viewBox="0 0 920 320" className="w-full h-auto max-h-[300px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="880" height="280" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Data sources */}
            <rect x="40" y="40" width="160" height="90" rx="8" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" />
            <text x="120" y="60" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle" fontWeight="600">DATA SOURCES</text>
            <text x="120" y="80" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Trade executions</text>
            <text x="120" y="95" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Journal entries</text>
            <text x="120" y="110" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Tags + Emotions</text>

            {/* Arrow */}
            <line x1="205" y1="85" x2="240" y2="85" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="240,85 232,80 232,90" fill="var(--qe-ref-green)" />

            {/* Context layer */}
            <rect x="250" y="40" width="200" height="90" rx="8" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" />
            <text x="350" y="60" fill="#818cf8" fontSize="10" textAnchor="middle" fontWeight="600">CONTEXT LAYER</text>
            <text x="350" y="80" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Filtered trade set</text>
            <text x="350" y="95" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Historical patterns</text>
            <text x="350" y="110" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Prop firm rules</text>

            {/* Arrow */}
            <line x1="455" y1="85" x2="490" y2="85" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="490,85 482,80 482,90" fill="var(--qe-ref-green)" />

            {/* AI Engine */}
            <rect x="500" y="40" width="180" height="90" rx="8" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" />
            <text x="590" y="60" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="600">AI ENGINE</text>
            <text x="590" y="80" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Trading-specific LLM</text>
            <text x="590" y="95" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Pattern detection</text>
            <text x="590" y="110" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Drift algorithms</text>

            {/* Arrow */}
            <line x1="685" y1="85" x2="720" y2="85" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="720,85 712,80 712,90" fill="var(--qe-ref-green)" />

            {/* Output */}
            <rect x="730" y="40" width="150" height="90" rx="8" fill="rgba(0,255,159,0.12)" stroke="var(--qe-ref-green)" />
            <text x="805" y="60" fill="var(--qe-ref-green)" fontSize="10" textAnchor="middle" fontWeight="600">OUTPUTS</text>
            <text x="805" y="80" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Smart Insights</text>
            <text x="805" y="95" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Chat answers</text>
            <text x="805" y="110" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Debriefs + Alerts</text>

            {/* Bottom flow - example */}
            <rect x="40" y="160" width="840" height="110" rx="10" fill="var(--qe-ref-surface-2)" />
            <text x="60" y="180" fill="var(--qe-ref-text)" fontSize="11" fontWeight="600">Example Copilot Flow</text>
            <text x="60" y="200" fill="var(--qe-ref-text-muted)" fontSize="10">1. You ask: "Why did my win rate drop on Tuesdays?"</text>
            <text x="60" y="218" fill="var(--qe-ref-text-muted)" fontSize="10">2. AI pulls your last 6 months of Tuesday trades + journal entries + emotion data</text>
            <text x="60" y="236" fill="var(--qe-ref-text-muted)" fontSize="10">3. AI compares Tuesday patterns vs other weekdays, cross-references tags and emotions</text>
            <text x="60" y="254" fill="var(--qe-ref-green)" fontSize="10">4. Response: "Your Tuesday win rate drops to 38% from 62% average. 7 of 12 losing Tuesdays followed a Monday loss — possible tilt carryover. You also take 40% more trades on Tuesdays (overtrading pattern)."</text>
          </svg>
        </div>
      </div>

      {/* SMART INSIGHTS */}
      <div id="insights">
        <div className={eyebrowStyle}>PRO-ACTIVE</div>
        <h2 className="ref-h-section mt-2">Smart Insights (Pro-active AI)</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Smart Insights are the Copilot's pro-active observations. Without you asking a thing, the AI scans your filtered trade set and surfaces 3-6 high-signal insights on the Dashboard. Each insight is clickable — click to auto-apply filters or jump to the relevant trades.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Example Insights</div>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> "Your biggest losers all occurred after 3pm — consider cutting off new entries after 2:30pm."</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> "Breakout trades on ES have 73% win rate vs 48% on NQ — your edge is instrument-specific."</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> "Frustrated emotion logged before 6 of your last 8 losses — emotional state is a leading indicator."</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> "You have a 5-trade loss streak. Historically, your loss streaks average 3 before recovery."</li>
            </ul>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Insight Categories</div>
            </div>
            <p className={bodySmall + ' mt-2'}>Smart Insights are organized into categories displayed as colored badges:</p>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { label: "Risk & Execution", desc: "Position sizing issues, stop-loss adherence, commission drag" },
                { label: "Behavioral", desc: "Emotion patterns, tilt signals, revenge trading detection" },
                { label: "Strategy", desc: "Setup-specific performance, time-of-day edges, instrument biases" },
                { label: "Compliance", desc: "Prop firm rule violations, max drawdown warnings, consistency alerts" },
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--qe-ref-green)]"></div>
                  <span className="font-medium text-[var(--qe-ref-text)]">{cat.label}:</span>
                  <span className="text-[var(--qe-ref-text-muted)]">{cat.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div id="chat">
        <div className={eyebrowStyle}>REACTIVE</div>
        <h2 className="ref-h-section mt-2">Chat Interface</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Natural Language Queries</div>
            </div>
            <p className={bodySmall}>Ask anything about your trading data in plain English. The Copilot has full context of your current filters, last 200 trades in scope, and your journal history. Example queries: "What is my best day of the week?", "Show me my worst trades this month", "Compare my performance with and without pre-trade notes."</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Context-Aware Answers</div>
            </div>
            <p className={bodySmall}>Every answer references your actual data with specific numbers. When the AI says "your win rate drops on Tuesdays," it can cite the exact win rate percentage, trade count, and date range. Click any citation to auto-apply filters and see the evidence yourself.</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Suggested Chat Queries</div>
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            {[
              "What is my biggest leak this month?",
              "Do I trade better after winning or losing days?",
              "Which instrument gives me the best risk-reward?",
              "Am I overtrading? Compare trade frequency vs P&L.",
              "Show me every trade where I violated my stop loss.",
              "What is my average R-multiple across all setups?",
              "How does my performance change after 3 consecutive losses?",
              "Compare my morning session vs afternoon session performance.",
            ].map((q, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-2.5 text-[var(--qe-ref-text-muted)] italic">
                "{q}"
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SESSION DEBRIEFS */}
      <div id="debriefs">
        <div className={eyebrowStyle}>AUTO-DEBRIEF</div>
        <h2 className="ref-h-section mt-2">Session Debriefs</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Activity className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Automated Post-Session Analysis</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">After you finish trading for the day, the Copilot can auto-generate a structured session debrief. This is a summary card that covers: session P&L, win rate, best and worst trades, emotional arc, plan adherence score, and 2-3 key observations. The debrief appears on your Dashboard and is saved to your journal timeline.</p>
              <p className="text-sm text-[var(--qe-ref-text-muted]) mt-2">Session debriefs are timezone-aware and account-aware. If you trade multiple sessions (e.g., Asia + London), each session gets its own debrief. You can configure the debrief trigger time in Settings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BEHAVIORAL */}
      <div id="behavior">
        <div className={eyebrowStyle}>MINDSET</div>
        <h2 className="ref-h-section mt-2">Behavioral &amp; Mindset Analysis</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Emotion Correlation</div>
            </div>
            <p className={bodySmall}>The Copilot cross-references every logged emotion against P&L outcomes. It builds a personal emotional profile: "You trade best when you feel Focused (+2.3R avg) and worst when Frustrated (-1.8R avg)." When it detects a negative emotional pattern building (e.g., 3 straight "Frustrated" logs), it can trigger an in-app alert.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Mindset Timeline</div>
            </div>
            <p className={bodySmall}>A visual timeline showing your emotional state overlaid on the P&L curve. See exactly when you shifted from focused to frustrated — and what happened to your trading immediately after. The timeline is clickable: click any emotion point to jump to the corresponding journal entries.</p>
            <Link href={`/${locale}/docs/behavior`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Behavioral Analysis guide →</Link>
          </div>
        </div>
      </div>

      {/* EXECUTION AUDITS */}
      <div id="drift">
        <div className={eyebrowStyle}>QUALITY CONTROL</div>
        <h2 className="ref-h-section mt-2">Execution Audits &amp; Drift Detection</h2>
        <div className="mt-4 space-y-4">
          <div className={cardMain}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Plan Adherence Scoring</div>
                <p className="mt-1 text-sm text-[var(--qe-ref-text-muted])">Every trade is scored on plan adherence. The Copilot compares your pre-trade notes against what actually happened. If you wrote "scalp for 10 ticks" but held for 30 ticks (or exited early), the drift is flagged. The execution audit shows your adherence rate over time — the single best predictor of trading success.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardMain}>
              <div className="font-semibold mb-1">Rule Violation Detection</div>
              <p className={bodySmall}>Define custom trading rules in Settings (e.g., "Never risk more than 1% per trade", "Max 3 trades per day", "No trading after 3pm"). The Copilot scans every execution against your rules and flags violations automatically. Violations appear in the Smart Insights widget and are tracked over time.</p>
            </div>
            <div className={cardMain}>
              <div className="font-semibold mb-1">Strategy Drift Alerts</div>
              <p className={bodySmall}>The AI detects when your current behavior deviates from your historical patterns. Examples: average position time suddenly doubles (style drift), trade frequency spikes 3x (overtrading), or you start trading instruments you have no history with. Drift alerts are configurable by sensitivity level.</p>
            </div>
          </div>
        </div>
      </div>

      {/* WEEKLY REPORTS */}
      <div id="reports">
        <div className={eyebrowStyle}>REVIEW</div>
        <h2 className="ref-h-section mt-2">Weekly AI Reports</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Award className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Your Personal Weekly Trading Debrief</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Every Sunday (or your configured day), the Copilot generates a comprehensive weekly report delivered to your Dashboard and email (optional). The report includes: weekly P&L summary, win rate and profit factor, best/worst day, emotion trend analysis, rule violations count, drift notices, and 3-5 actionable recommendations for next week.</p>
              <p className="text-sm text-[var(--qe-ref-text-muted]) mt-2">Traders consistently rate the weekly report as the single most valuable output of the platform — it transforms a week of raw data into a structured coaching session.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS DASHBOARD */}
      <div id="dashboard">
        <div className={eyebrowStyle}>FULL VIEW</div>
        <h2 className="ref-h-section mt-2">Analytics Dashboard</h2>
        <div className="cardMain">
          <p className={bodySmall}>The dedicated Analytics page at <strong>/dashboard/analytics</strong> is a full-screen version of the Smart Insights + Copilot widgets. It provides more space for detailed analysis, longer chat history, and additional visualizations not available on the main Dashboard:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Expanded Smart Insights panel showing up to 12 observations",
              "Full conversation history with the Copilot chat (searchable)",
              "Weekly debrief archive with comparison to prior weeks",
              "Behavioral score trend (composite discipline, consistency, emotion scores)",
              "Rule violation timeline with drill-down to specific trades",
              "Strategy drift chart showing key metrics over time",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[var(--qe-ref-text-muted)]">
                <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" /> {item}
              </div>
            ))}
          </div>
          <Link href={`/${locale}/docs/behavior`} className="mt-4 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">See the Behavioral Analysis page for deep mindset tracking →</Link>
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
        <div className="text-lg font-semibold tracking-tight">Your personal trading analyst is waiting</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Ask one question. The Copilot will change how you see your trading.</p>
        <Link href={`/${locale}/docs/behavior`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Behavioral Analysis <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/journal`} className="underline underline-offset-2 hover:no-underline">Trade Journal</Link> • <Link href={`/${locale}/docs/playbook`} className="underline underline-offset-2 hover:no-underline">Strategy Playbook</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The Copilot is updated continuously based on trader feedback and trading-specific LLM advances.</div>
    </div>
  )
}
