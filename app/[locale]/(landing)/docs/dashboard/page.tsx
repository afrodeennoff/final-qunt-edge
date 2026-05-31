'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  BarChart3,
  Brain,
  Shield,
  Table,
  MessageCircle,
  Target,
  ArrowRight,
  Check,
  Plus,
  GripVertical,
  Maximize2,
  Palette,
  Filter,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Journalit.co / HomeContent visual language (adapted for docs)
const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

interface FaqItem {
  q: string
  a: React.ReactNode
}

const faqs: FaqItem[] = [
  {
    q: "Do my layout changes sync across devices?",
    a: "Layouts are saved per-user and persist across desktop and mobile views (separate mobile/desktop grids). Changes auto-save to your account in real-time and load instantly on any device you sign in from."
  },
  {
    q: "Why don't all widgets update when I change filters?",
    a: "All widgets listen to the global filter context. Some heavy widgets (like the full Trade Table) debounce updates for performance. If a widget appears stale, toggle Customize mode off/on or refresh the page — data is always derived from the current filtered trade set."
  },
  {
    q: "Can I share a specific dashboard layout with my team?",
    a: "Yes — use the Share button in the header while in Customize mode. It generates a snapshot link that preserves your current widget arrangement, sizes, and active filters. Recipients see a read-only version (they can still customize their own copy)."
  },
  {
    q: "How does the AI Copilot widget know what I'm looking at?",
    a: "The Chat widget (and Smart Insights) have full context of your current global filters + the last 200 trades in scope. Ask natural language questions like \"Why did my winrate drop on Tuesdays?\" and it will reference exactly the data visible in your Equity Chart and Calendar."
  },
  {
    q: "What happens to widgets I remove — can I get them back?",
    a: "Removed widgets are gone from your layout but always available in the + Add Widget sheet (categorized by Charts, Statistics, Tables, AI & Other). Restoring defaults via the header button resets to the curated starter layout without losing your imported trades."
  },
]

export default function DocsDashboardPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openWorkflow, setOpenWorkflow] = useState<number | null>(null)

  const workflows = [
    {
      title: "Morning Routine (2 min)",
      steps: "Open Dashboard → glance at overnight Cumulative P&L + Calendar heatmap → click any red day to auto-filter the entire canvas to that session → open Copilot widget and ask \"What went wrong on the 14th?\""
    },
    {
      title: "Post-Session Debrief (5 min)",
      steps: "After importing today's trades, switch to Customize → add the Mindset + Smart Insights widgets temporarily → review emotion timeline + AI flags → click any insight to jump straight into the Trade Journal with that trade pre-filtered → write your post-trade notes."
    },
    {
      title: "Prop Firm Compliance Check (90 sec)",
      steps: "Add the Accounts Overview (propFirm) widget if not present → it shows live drawdown vs. daily loss limit, consistency score, and profit target progress for every account. One click opens the full prop firm catalogue with rules."
    },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>COMMAND CENTER</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">The Qunt Edge Dashboard</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Your fully customizable mission control. 25+ live widgets, global filters, AI Copilot, and instant drill-down into every trade and journal entry. 
          One canvas. Every angle. Zero context switching.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open My Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/getting-started`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Quick Start Guide
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE QUICK NAV */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Widget Canvas Overview', '#overview'],
            ['Every Major Widget Type', '#widgets'],
            ['Customization Deep Dive', '#customize'],
            ['Personal Theme Integration', '#themes'],
            ['Copilot, Journal & Analytics Connections', '#connections'],
            ['First 10 Minutes Walkthrough', '#walkthrough'],
            ['Common Workflows & Pro Tips', '#workflows'],
            ['FAQ & Troubleshooting', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* DASHBOARD OVERVIEW + SVG DIAGRAM */}
      <div id="overview">
        <div className={eyebrowStyle}>THE BIG PICTURE</div>
        <h2 className="ref-h-section mt-2">Widget Canvas Overview</h2>
        <p className="ref-body mt-2 max-w-[65ch] text-[var(--qe-ref-text-muted)]">
          The dashboard is a single responsive react-grid-layout canvas. Every metric, chart, table and AI insight lives in a movable, resizable widget that reacts instantly to your global filters.
        </p>

        {/* Large conceptual diagram */}
        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">CONCEPTUAL DASHBOARD ARCHITECTURE</div>
          <svg viewBox="0 0 920 420" className="w-full h-auto max-h-[380px]" preserveAspectRatio="xMidYMid meet">
            {/* Background shell */}
            <rect x="20" y="20" width="880" height="380" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
            
            {/* Top Header bar */}
            <rect x="30" y="32" width="860" height="38" rx="8" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.15)" strokeWidth="1" />
            <text x="50" y="55" fill="var(--qe-ref-text)" fontSize="11" fontWeight="600">QUNT EDGE</text>
            <rect x="160" y="42" width="220" height="18" rx="4" fill="var(--qe-ref-surface-2)" />
            <text x="170" y="55" fill="var(--qe-ref-text-muted)" fontSize="9">Filter: Last 30d • ES • 2 Accounts</text>
            
            {/* Customize button */}
            <rect x="720" y="40" width="80" height="22" rx="6" fill="rgba(0,255,159,0.15)" />
            <text x="760" y="55" fill="var(--qe-ref-green)" fontSize="9" textAnchor="middle" fontWeight="600">CUSTOMIZE</text>
            
            {/* Theme + User */}
            <circle cx="840" cy="51" r="9" fill="var(--qe-ref-surface-2)" />
            <circle cx="870" cy="51" r="9" fill="var(--qe-ref-surface-2)" />

            {/* Sidebar mock */}
            <rect x="30" y="78" width="58" height="310" rx="8" fill="rgba(0,255,159,0.03)" stroke="rgba(0,255,159,0.1)" />
            <text x="59" y="100" fill="var(--qe-ref-text-muted)" fontSize="8" textAnchor="middle">NAV</text>
            {[0,1,2,3,4].map(i => (
              <rect key={i} x="40" y={115 + i*28} width="38" height="14" rx="3" fill="var(--qe-ref-surface-2)" />
            ))}

            {/* Main Widget Canvas area */}
            <rect x="96" y="78" width="680" height="310" rx="10" fill="var(--qe-ref-surface)" stroke="rgba(0,255,159,0.12)" strokeWidth="1" />
            <text x="440" y="100" fill="var(--qe-ref-text-muted)" fontSize="10" textAnchor="middle">WIDGET CANVAS (react-grid-layout)</text>

            {/* Sample widgets inside canvas */}
            {/* KPI row */}
            <rect x="110" y="115" width="140" height="52" rx="6" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" />
            <text x="180" y="138" fill="var(--qe-ref-text)" fontSize="8" textAnchor="middle">Cumulative P&amp;L</text>
            <text x="180" y="152" fill="var(--qe-ref-green)" fontSize="14" textAnchor="middle" fontWeight="700">+$14,280</text>
            
            <rect x="260" y="115" width="140" height="52" rx="6" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" />
            <text x="330" y="138" fill="var(--qe-ref-text)" fontSize="8" textAnchor="middle">Profit Factor</text>
            <text x="330" y="152" fill="var(--qe-ref-green)" fontSize="14" textAnchor="middle" fontWeight="700">1.87</text>

            <rect x="410" y="115" width="140" height="52" rx="6" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" />
            <text x="480" y="138" fill="var(--qe-ref-text)" fontSize="8" textAnchor="middle">Win Rate</text>
            <text x="480" y="152" fill="var(--qe-ref-green)" fontSize="14" textAnchor="middle" fontWeight="700">64%</text>

            <rect x="560" y="115" width="200" height="52" rx="6" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" />
            <text x="660" y="138" fill="var(--qe-ref-text)" fontSize="8" textAnchor="middle">Risk Metrics • Sharpe 1.42</text>

            {/* Equity Chart */}
            <rect x="110" y="175" width="320" height="118" rx="6" fill="var(--qe-ref-card)" stroke="rgba(0,255,159,0.15)" />
            <text x="270" y="192" fill="var(--qe-ref-text)" fontSize="9" textAnchor="middle">Equity Curve</text>
            <polyline points="130,250 160,235 200,248 240,210 280,225 310,195 340,205 370,175 410,188" fill="none" stroke="var(--qe-ref-green)" strokeWidth="2.5" />
            <polyline points="130,255 160,248 200,260 240,230 280,242 310,218 340,225 370,200 410,210" fill="none" stroke="rgba(0,255,159,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Calendar Heatmap */}
            <rect x="440" y="175" width="320" height="118" rx="6" fill="var(--qe-ref-card)" stroke="rgba(0,255,159,0.15)" />
            <text x="600" y="192" fill="var(--qe-ref-text)" fontSize="9" textAnchor="middle">P&amp;L Calendar + Mood</text>
            {Array.from({length: 28}).map((_,i) => (
              <rect key={i} x={460 + (i%7)*38} y={205 + Math.floor(i/7)*22} width="32" height="16" rx="2" 
                fill={i % 5 === 0 ? 'rgba(255,80,80,0.4)' : i % 3 === 0 ? 'rgba(0,255,159,0.35)' : 'rgba(0,255,159,0.12)'} />
            ))}

            {/* Bottom status bar */}
            <rect x="110" y="305" width="650" height="22" rx="4" fill="rgba(0,255,159,0.04)" />
            <text x="130" y="320" fill="var(--qe-ref-text-muted)" fontSize="8">1,284 trades • 47 instruments • Filters active on 3 widgets • Auto-saved 12s ago</text>
            
            {/* Drag handles hint */}
            <g opacity="0.6">
              <rect x="410" y="260" width="18" height="18" rx="3" fill="none" stroke="var(--qe-ref-green)" strokeDasharray="2 1" />
              <line x1="414" y1="266" x2="424" y2="266" stroke="var(--qe-ref-green)" strokeWidth="1.5" />
              <line x1="414" y1="270" x2="424" y2="270" stroke="var(--qe-ref-green)" strokeWidth="1.5" />
              <line x1="414" y1="274" x2="424" y2="274" stroke="var(--qe-ref-green)" strokeWidth="1.5" />
            </g>
          </svg>
          <p className="text-center text-[11px] text-[var(--qe-ref-text-muted)] mt-2">Everything below the filter bar lives inside the reactive Widget Canvas. Resize, drag, add, remove — your layout is saved to your account instantly.</p>
        </div>
      </div>

      {/* WIDGET BREAKDOWN */}
      <div id="widgets">
        <div className={eyebrowStyle}>THE WIDGET REGISTRY</div>
        <h2 className="ref-h-section mt-2">Every Major Widget Type</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          25+ production widgets across 4 categories. All widgets are dynamically imported, respect the exact same global filter context, and render in &lt;60ms even on mobile.
        </p>

        {/* KPI / Tiny Stats */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-[var(--qe-ref-green)]" />
            <div className="font-semibold tracking-tight">KPI Cards (Tiny • Always Visible)</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, name: "Cumulative P&L", desc: "Net P&L since first trade or filtered range. Color-coded delta vs previous period.", metric: "+$14,280" },
              { icon: Award, name: "Profit Factor", desc: "Gross profit / gross loss. The single most important risk-adjusted number.", metric: "1.87" },
              { icon: Shield, name: "Risk-Reward Ratio", desc: "Average winner size vs average loser size across the filtered set.", metric: "1.42" },
              { icon: Clock, name: "Avg Position Time", desc: "Mean hold time in minutes/hours. Great for scalpers vs swingers.", metric: "47m" },
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

        {/* Core Charts */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-[var(--qe-ref-green)]" />
            <div className="font-semibold tracking-tight">Core Visual Charts</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Equity Curve", desc: "Cumulative P&L line chart with optional benchmark, drawdown overlay, and trade markers. Zoomable, exportable, timezone-aware.", sizes: "small / medium / large" },
              { name: "P&L by Side (Long vs Short)", desc: "Bar comparison + winrate split. Instantly reveals if you are better long or short biased.", sizes: "small / medium" },
              { name: "Weekday P&L Heat", desc: "Average P&L and trade count per weekday. Perfect for discovering your best/worst days of the week.", sizes: "small / medium / large" },
              { name: "Time of Day Distribution", desc: "Intraday performance buckets. See exactly when your edge appears (London open? NY session?).", sizes: "small / medium" },
              { name: "Calendar + Mood Heatmap", desc: "Monthly P&L grid with daily winrate, trade count, and your logged emotion (😊😐😤). Click any day to filter everything.", sizes: "large / extra-large" },
              { name: "Tick / Contract / Commission Charts", desc: "Specialized: tick distribution, P&L per contract, commission drag, time-in-position histograms.", sizes: "medium / large" },
            ].map((w, i) => (
              <div key={i} className={cardMain}>
                <div className={headingCard}>{w.name}</div>
                <p className={bodySmall + ' mt-2'}>{w.desc}</p>
                <div className="mt-3 inline-flex items-center rounded bg-[var(--qe-ref-surface-2)] px-2 py-0.5 text-[10px] text-[var(--qe-ref-text-muted)]">{w.sizes}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI + Intelligence */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-[var(--qe-ref-green)]" />
            <div className="font-semibold tracking-tight">AI &amp; Intelligence Widgets</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Brain, name: "Smart Insights", desc: "AI scans your filtered trades in real time and surfaces 3–6 high-signal observations (e.g. \"Your biggest losers all happened after 3pm\"). Click any to auto-apply deeper filters or open the exact trades in Journal." },
              { icon: Shield, name: "Risk Metrics", desc: "Kelly Criterion (half & full), Sharpe, Sortino, Calmar, Max Drawdown, Expectancy. All calculated on the current filtered set using institutional-grade formulas." },
              { icon: Award, name: "Trading Score & Expectancy", desc: "Composite 0–100 score + expectancy in $ and R-multiples. Updates live as you filter." },
              { icon: MessageCircle, name: "Copilot (Chat Widget)", desc: "Full conversational analyst. Context-aware of every filter and widget on screen. Ask anything: \"Show me my worst setups this month\" or \"Why do I revenge trade after red days?\" — answers with citations back to your data." },
              { icon: Target, name: "Mindset Widget", desc: "Emotion timeline, pre-trade confidence vs outcome correlation, hourly mood patterns, news-event overlay. The behavioral layer that pure P&L dashboards miss." },
            ].map((w, i) => (
              <div key={i} className={cardMain}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                  <w.icon className="h-4.5 w-4.5" />
                </div>
                <div className={headingCard}>{w.name}</div>
                <p className={bodySmall + ' mt-2'}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tables & Overviews */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Table className="h-4 w-4 text-[var(--qe-ref-green)]" />
            <div className="font-semibold tracking-tight">Tables &amp; Account Overviews</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Trade Table Review", desc: "Full-featured, filter-aware trade log with inline editing, multi-select tagging, screenshot thumbnails, and one-click jump to full Journal entry. Supports pagination, sorting, CSV export. The only table you will ever need.", sizes: "large / extra-large (full width)" },
              { name: "Accounts Overview (Prop Firm)", desc: "Live compliance dashboard for every connected prop account: current equity, daily loss limit remaining, max drawdown, consistency rule %, profit target progress, trailing rules. Click any account to deep-dive or open the full catalogue.", sizes: "medium / large / extra-large" },
              { name: "Prop Firm Catalogue", desc: "Browse 50+ verified prop firms, compare rules, see your personal simulated performance against their targets, and launch challenge applications.", sizes: "medium / large" },
              { name: "Tag & Consistency Widgets", desc: "Live tag cloud + performance by tag. Consistency table (winrate streaks, max consecutive losers, etc).", sizes: "small / medium" },
            ].map((w, i) => (
              <div key={i} className={cardMain}>
                <div className={headingCard}>{w.name}</div>
                <p className={bodySmall + ' mt-2'}>{w.desc}</p>
                <div className="mt-3 text-[10px] text-[var(--qe-ref-text-muted)]">{w.sizes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMIZATION */}
      <div id="customize">
        <div className={eyebrowStyle}>FULL CONTROL</div>
        <h2 className="ref-h-section mt-2">How to Customize Your Dashboard</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className={headingCard}>Enter Edit Mode</div>
            <p className={bodySmall + ' mt-2'}>Click the grid icon in the top-right header (or press the keyboard shortcut if configured). The entire canvas gets a subtle overlay and every widget shows drag handles + size controls.</p>
            <div className="mt-4 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs">
              <div className="flex items-center gap-2 text-[var(--qe-ref-green)]"><GripVertical className="h-3.5 w-3.5" /> Drag the grip anywhere to move</div>
              <div className="flex items-center gap-2 mt-1 text-[var(--qe-ref-green)]"><Maximize2 className="h-3.5 w-3.5" /> Click size chip → choose tiny → extra-large (subject to widget rules)</div>
            </div>
          </div>
          <div className={cardMain}>
            <div className={headingCard}>Add, Remove, Resize, Reorder</div>
            <ul className="mt-2 space-y-1 text-sm text-[var(--qe-ref-text-muted)]">
              <li className="flex gap-2"><Plus className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> + Add Widget button opens categorized sheet with live previews of every widget</li>
              <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> Some widgets only allow certain sizes (e.g. KPIs are tiny-only, Trade Table requires large+)</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--qe-ref-green)]" /> Mobile automatically collapses some sizes for touch friendliness</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Auto-Save &amp; Persistence</div>
          <p className="text-sm text-[var(--qe-ref-text-muted)]">Every change (position, size, add, remove) is debounced and saved to your Supabase row + local cache in &lt;300ms. You will see a tiny cloud icon with "Saved" or "Saving…". Layouts are stored separately for desktop vs mobile. Restore defaults anytime from the header menu without losing data.</p>
        </div>

        {/* Mini flow diagram */}
        <div className="mt-6 text-center">
          <svg viewBox="0 0 720 90" className="mx-auto w-full max-w-[620px]">
            <rect x="20" y="25" width="140" height="42" rx="8" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="90" y="50" fill="var(--qe-ref-text)" fontSize="11" textAnchor="middle">Click Customize</text>
            <line x1="165" y1="46" x2="200" y2="46" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="200,46 192,41 192,51" fill="var(--qe-ref-green)" />

            <rect x="210" y="25" width="140" height="42" rx="8" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="280" y="50" fill="var(--qe-ref-text)" fontSize="11" textAnchor="middle">Drag / Resize / +Add</text>
            <line x1="355" y1="46" x2="390" y2="46" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="390,46 382,41 382,51" fill="var(--qe-ref-green)" />

            <rect x="400" y="25" width="140" height="42" rx="8" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="470" y="50" fill="var(--qe-ref-text)" fontSize="11" textAnchor="middle">Auto-saved to cloud</text>
            <line x1="545" y1="46" x2="580" y2="46" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="580,46 572,41 572,51" fill="var(--qe-ref-green)" />

            <rect x="590" y="25" width="110" height="42" rx="8" fill="rgba(0,255,159,0.15)" stroke="var(--qe-ref-green)" />
            <text x="645" y="50" fill="var(--qe-ref-green)" fontSize="11" textAnchor="middle" fontWeight="600">Live everywhere</text>
          </svg>
        </div>
      </div>

      {/* THEME INTEGRATION */}
      <div id="themes">
        <div className={eyebrowStyle}>VISUAL IDENTITY</div>
        <h2 className="ref-h-section mt-2">Personal Theme Integration</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-[var(--qe-ref-green)]" />
              <div>
                <div className={headingCard}>Dashboard Themes</div>
                <p className={bodySmall + ' mt-1'}>Choose from 8 curated palettes (Obsidian, Neon, Forest, etc.) in Settings → Appearance. The entire widget canvas, charts, and surfaces instantly re-theme via CSS variables. Your choice is stored server-side and applied on every load before first paint.</p>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <p className={bodySmall}>Widgets automatically adapt: Recharts, calendar heatmaps, progress bars, and even the AI chat bubbles respect the active dashboard theme. You can also toggle classic light/dark independently — themes are a layer on top.</p>
            <Link href={`/${locale}/docs/settings`} className="mt-3 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Learn more in Settings docs →</Link>
          </div>
        </div>
      </div>

      {/* CONNECTIONS */}
      <div id="connections">
        <div className={eyebrowStyle}>THE ECOSYSTEM</div>
        <h2 className="ref-h-section mt-2">How Widgets Connect to Copilot / Journal / Analytics</h2>
        
        <div className="mt-4 space-y-4">
          <div className={cardMain}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Filter className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Global Filters Are the Glue</div>
                <p className="mt-1 text-sm text-[var(--qe-ref-text-muted)]">Date range, account(s), instrument(s), P&amp;L range, tags, weekday, session — every widget subscribes to the same filter state. Change the filter once, the entire canvas (including the Trade Table and Copilot context) updates together.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardMain}>
              <div className="font-semibold mb-1">Copilot ↔ Widgets</div>
              <p className={bodySmall}>The Chat widget and Smart Insights both receive the exact current filtered trade set + any open widget state. When you ask a question, the AI can cite specific trades, days, or patterns visible on your canvas right now.</p>
            </div>
            <div className={cardMain}>
              <div className="font-semibold mb-1">Widget → Journal Drill-down</div>
              <p className={bodySmall}>Click a calendar day, a bar in any chart, or an insight card → the global filter updates and you are offered a one-click "Open in Journal" that lands you on the exact trades with your pre/post notes editor already focused.</p>
            </div>
          </div>

          <div className={cardMain}>
            <div className="font-semibold mb-1">Analytics Page Synergy</div>
            <p className={bodySmall}>The dedicated /dashboard/analytics page and the Copilot page are simply larger, full-screen versions of the same data engine. Any filter or layout you perfect on the main Dashboard can be bookmarked and reused there. The underlying data provider is identical.</p>
            <Link href={`/${locale}/docs/analytics`} className="text-xs text-[var(--qe-ref-green)] hover:underline mt-2 inline-block">Read the full Analytics &amp; Copilot documentation →</Link>
          </div>
        </div>
      </div>

      {/* FIRST 10 MINUTES WALKTHROUGH */}
      <div id="walkthrough">
        <div className={eyebrowStyle}>ONBOARDING</div>
        <h2 className="ref-h-section mt-2">First 10 Minutes in the Dashboard</h2>
        <p className="text-sm text-[var(--qe-ref-text-muted)] mt-1">A guided path from blank slate to personalized command center.</p>

        <div className="mt-5 space-y-3">
          {[
            { min: "0-1", title: "Land & Orient", text: "You arrive at the default layout (4 KPI cards + Equity + Calendar + Statistics + a few analysis charts). Take 30 seconds to just look — no clicking yet." },
            { min: "1-3", title: "Apply Your First Filter", text: "Open the filter command bar (top). Select \"Last 90 days\" + your main account. Watch every widget on the canvas instantly re-compute. This is the magic." },
            { min: "3-5", title: "Enter Customize Mode", text: "Click the grid icon. Drag the Equity Curve to the left column. Resize the Calendar to extra-large so you can see 3 months at once. Remove the two widgets you don't care about yet." },
            { min: "5-7", title: "Add AI Power", text: "Click + Add Widget → AI & Other tab → add Smart Insights and the Copilot chat widget. Place them side-by-side at the bottom. Ask the chat your first real question about the filtered data." },
            { min: "7-9", title: "Theme & Polish", text: "Go to Settings → Appearance (or use the user menu). Pick a dashboard theme you love. Watch the entire canvas (including all chart colors) transform instantly." },
            { min: "9-10", title: "Save & Share", text: "Toggle Customize off. Your layout is already saved. Hit the Share button, copy the link, send it to a trading buddy or your prop firm coach. They see exactly what you see." },
          ].map((step, idx) => (
            <div key={idx} className={cardMain}>
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-xs w-12 shrink-0 text-[var(--qe-ref-green)]">{step.min} min</div>
                <div className="font-semibold tracking-tight">{step.title}</div>
              </div>
              <p className={bodySmall + ' mt-1 pl-15'}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKFLOWS & TIPS */}
      <div id="workflows">
        <div className={eyebrowStyle}>REAL WORLD</div>
        <h2 className="ref-h-section mt-2">Common Workflows &amp; Pro Tips</h2>

        <div className="mt-4 space-y-3">
          {workflows.map((w, i) => (
            <details key={i} open={openWorkflow === i} onToggle={() => setOpenWorkflow(openWorkflow === i ? null : i)} className="group rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium">
                {w.title}
                <span className="text-[var(--qe-ref-text-muted)] group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[var(--qe-ref-text-muted)] border-t border-[var(--qe-ref-card-border)] pt-3">
                {w.steps}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
          {[
            "Use the Tag Widget as a permanent \"focus mode\" — keep only your top 3 setups visible and watch how your P&L changes when you filter to just those.",
            "Calendar + Smart Insights together is the fastest way to find and fix behavioral leaks (revenge trading, overtrading after wins, etc).",
            "On mobile the canvas collapses gracefully. The same layout engine powers both experiences — design once, works everywhere.",
            "Export any filtered view directly from the Trade Table widget — perfect for prop firm submissions or tax reporting.",
            "The chat widget remembers conversation history per session. Start a thread about \"my worst week\" and keep asking follow-ups without re-explaining the context.",
            "Restore Default Layout is non-destructive. It only resets your widget arrangement, never touches trades or journal entries.",
          ].map((tip, i) => (
            <div key={i} className={cardNested}>
              <div className="text-[10px] text-[var(--qe-ref-green)] font-semibold tracking-widest mb-1">PRO TIP</div>
              {tip}
            </div>
          ))}
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

      {/* FINAL CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Ready to build your edge?</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted)]">Your perfect dashboard is three clicks away.</p>
        <Link href={`/${locale}/dashboard`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Open Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Next: <Link href={`/${locale}/docs/journal`} className="underline underline-offset-2 hover:no-underline">Trade Journal &amp; Review</Link> • <Link href={`/${locale}/docs/analytics`} className="underline underline-offset-2 hover:no-underline">Copilot &amp; Analytics</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">This page documents the live Widget Canvas &amp; registry as of May 2026. All features are production and used daily by thousands of traders.</div>
    </div>
  )
}
