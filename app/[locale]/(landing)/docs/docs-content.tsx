'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  BookOpen, LayoutDashboard, FileText, BarChart3, FileUp,
  Users, Trophy, DollarSign, Building2, Target, Brain,
  Shield, Zap, ArrowRight, Check, Plus, Clock, Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingSection = 'ref-h-section'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function DocsContent() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'What is Qunt Edge?',
      a: 'Qunt Edge is the professional trading journal platform for discretionary traders who demand an edge. It combines precise trade capture, structured journaling, powerful analytics widgets, and an AI Copilot that turns every session into actionable debriefs and behavioral insights. Built for futures, forex, crypto, and equity traders who review religiously.',
    },
    {
      q: 'How is this different from a basic spreadsheet or broker journal?',
      a: 'Spreadsheets track numbers. Qunt Edge tracks decisions. Every fill is linked to pre-trade intent, post-trade emotion, custom tags, and AI-detected patterns. The Widget Canvas, Copilot debrief engine, prop firm compliance tracker, and public leaderboard create a complete review loop that actually changes behavior — not just records history.',
    },
    {
      q: 'Which brokers and platforms does import support?',
      a: 'Direct API sync with Tradovate, Rithmic, and DXfeed. File imports for NinjaTrader, MultiCharts, IBKR (PDF + trade reports), Thinkorswim, TradingView, MT5, CSV/Excel, and any custom format. Auto-tagging and duplicate detection keep your journal clean from day one.',
    },
    {
      q: 'Does the AI Copilot actually help improve trading?',
      a: 'Yes. The Copilot analyzes your full trade history, notes, tags, and risk metrics to surface execution drift, emotional patterns, time-of-day biases, and rule violations. Traders report the weekly AI briefs are the single most valuable output — they surface what you literally could not see on your own.',
    },
    {
      q: 'Can I use this for prop firm challenges and funded accounts?',
      a: 'Absolutely. Dedicated prop firm dashboards track drawdown in real time, consistency rules, profit targets, and payout eligibility. You can link multiple prop accounts, run compliance reports, and even share verified performance with firms via the public leaderboard and trader profiles.',
    },
    {
      q: 'Is my trading data private and secure?',
      a: 'Bank-grade encryption, SOC 2-aligned controls, and strict account-scoped access. Your journal, notes, screenshots, and performance history are never shared. Public leaderboard and shared team reports are opt-in only. You control exactly what the world sees.',
    },
    {
      q: 'Do teams and prop firms use Qunt Edge?',
      a: 'Yes. The Teams workspace lets funded firms, prop shops, and trading groups create shared dashboards, review templates, and leaderboards. Managers get oversight while individual traders keep their private journals. Used by multiple prop firms for compliance, training, and recruitment.',
    },
    {
      q: 'How quickly can I get my first review done?',
      a: 'Under 5 minutes. Create your account, connect a broker or drop a CSV, and the dashboard immediately shows P&L, equity curve, win rate, and the first Copilot insights. Journaling and tagging take another 30–60 seconds per trade once you are in the flow.',
    },
  ]

  return (
    <div className="qe-home-ref space-y-12 text-[var(--qe-ref-text)]">
      <div>
        <div className={eyebrowStyle}>OFFICIAL DOCUMENTATION</div>
        <h1 className="ref-h-display mt-3 tracking-[-0.02em]">
          The Complete Manual for Qunt Edge
        </h1>
        <p className="ref-body mt-4 max-w-[68ch]">
          This is the authoritative guide to the professional trading journal platform used by serious discretionary traders, prop firms, and funded accounts worldwide. Every feature, workflow, and AI capability is documented with the same precision we expect from your reviews.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
          <Link
            href={`/${locale}/docs/getting-started`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-6 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            Start the 5-Minute Setup <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}/docs/dashboard`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-5 py-2.5 text-[13px] font-medium hover:border-[var(--qe-ref-green)]/40"
          >
            Explore the Widget Canvas
          </Link>
          <span className="text-[var(--qe-ref-text-muted)]">Updated for the latest AI debrief engine</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[var(--qe-ref-text-muted)]">
          {['17+ import formats', 'Real-time Copilot', 'Prop firm compliance', 'Team workspaces', 'Public leaderboard'].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> {t}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className={eyebrowStyle}>WHAT YOU CAN DO</div>
        <h2 className={cn(headingSection, 'mt-2')}>Everything You Need to Build a Lasting Edge</h2>
        <p className="ref-body mt-3 max-w-[68ch]">
          Qunt Edge is not just a logbook. It is a complete professional review system — from the moment you take a trade to the moment you sit down with your AI coach and decide what changes tomorrow.
        </p>
        <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Widget Canvas &amp; Live Dashboards</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Your command center. Drag, resize, and arrange 15+ widgets — equity curve, P&amp;L heatmaps, decile analysis, mindset timeline, news impact, and more. Every layout saves automatically per account.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/dashboard`}>Read the full dashboard guide →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>AI Copilot &amp; Behavioral Debriefs</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>The heart of the system. Natural-language questions about your trading, automatic weekly briefs, drift detection, and precise coaching notes generated from your actual journal data — not generic advice.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/analytics`}>Explore Copilot &amp; Analytics →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Structured Trade Journal</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Pre-trade intent, post-trade review, 17+ custom tags, emotion sliders, confidence, market context, and screenshot attachments. The data that powers every Copilot insight and compliance report.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/journal`}>Master the Journal workflow →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Trade Log &amp; Powerful Filters</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>The complete, filterable record of every execution. Sort, search, bulk tag, and jump straight into review. The same filters you set here power every widget and Copilot query on the dashboard.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/trade-log`}>Deep dive into the Trade Log →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <FileUp className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Broker Sync &amp; Universal Import</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>One-click auto-sync from Tradovate, Rithmic, and DXfeed. Battle-tested importers for NinjaTrader, IBKR, Thinkorswim, MT5, TradingView, and any CSV. Duplicate detection and smart tagging included.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/import`}>See all supported platforms →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Prop Firm Compliance Engine</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Real-time drawdown tracking, consistency scoring, profit target progress, and payout-ready reports for 50+ verified prop firms. Link challenge accounts and funded accounts in one view.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/propfirms`}>Browse the Prop Firms Catalogue →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Teams &amp; Shared Workspaces</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Private journals for every trader, shared dashboards for the desk, and manager oversight tools. Used by prop firms for training, compliance, and recruitment. Role-based permissions included.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/teams`}>Learn about Teams →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Public Leaderboard &amp; Trader Profiles</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Opt-in verified performance rankings. Share your edge with the community, attract prop firm offers, or simply keep yourself honest with public accountability. Full control over what is visible.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/leaderboard`}>View the Leaderboard →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={headingCard}>Deals Marketplace &amp; Firm Discounts</h3>
                <p className={cn(bodySmall, 'mt-1.5')}>Real-time challenge discounts, compare tools, and exclusive Qunt Edge partner pricing on 30+ prop firms. The only place serious traders shop for their next funded account with verified data.</p>
                <div className="mt-3 text-[11px] text-[var(--qe-ref-green)]">
                  <Link href={`/${locale}/docs/deals`}>Shop current deals →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className={eyebrowStyle}>GETTING STARTED</div>
        <h2 className={cn(headingSection, 'mt-2')}>From Zero to First AI Debrief in Under 5 Minutes</h2>
        <p className="ref-body mt-3 max-w-[68ch]">
          The fastest path to a professional review habit. Follow these four steps and you will have imported trades, a customized dashboard, and your first Copilot insights before your coffee gets cold.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href={`/${locale}/docs/getting-started`} className={cn(cardMain, 'group block no-underline hover:border-[var(--qe-ref-green)]/40 transition-colors')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className={cn(headingCard, 'mt-4 group-hover:text-[var(--qe-ref-green)]')}>1. Quick Start Guide</h3>
            <p className={cn(bodySmall, 'mt-2')}>Account creation, first broker connection, and your initial dashboard in one focused walkthrough.</p>
            <div className="mt-3 text-[11px] font-medium text-[var(--qe-ref-green)] flex items-center gap-1">Read the guide <ArrowRight className="h-3 w-3" /></div>
          </Link>
          <Link href={`/${locale}/docs/import`} className={cn(cardMain, 'group block no-underline hover:border-[var(--qe-ref-green)]/40 transition-colors')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
              <FileUp className="h-4 w-4" />
            </div>
            <h3 className={cn(headingCard, 'mt-4 group-hover:text-[var(--qe-ref-green)]')}>2. Import Your History</h3>
            <p className={cn(bodySmall, 'mt-2')}>Connect Tradovate/Rithmic in 30 seconds or upload NinjaTrader, IBKR, or CSV exports. Smart duplicate handling included.</p>
            <div className="mt-3 text-[11px] font-medium text-[var(--qe-ref-green)] flex items-center gap-1">See supported formats <ArrowRight className="h-3 w-3" /></div>
          </Link>
          <Link href={`/${locale}/docs/dashboard`} className={cn(cardMain, 'group block no-underline hover:border-[var(--qe-ref-green)]/40 transition-colors')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
              <Target className="h-4 w-4" />
            </div>
            <h3 className={cn(headingCard, 'mt-4 group-hover:text-[var(--qe-ref-green)]')}>3. Customize Your Canvas</h3>
            <p className={cn(bodySmall, 'mt-2')}>Enter edit mode, drag the widgets that matter to you, and save layouts per account. Your review workspace, your way.</p>
            <div className="mt-3 text-[11px] font-medium text-[var(--qe-ref-green)] flex items-center gap-1">Master the Widget Canvas <ArrowRight className="h-3 w-3" /></div>
          </Link>
          <Link href={`/${locale}/docs/journal`} className={cn(cardMain, 'group block no-underline hover:border-[var(--qe-ref-green)]/40 transition-colors')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className={cn(headingCard, 'mt-4 group-hover:text-[var(--qe-ref-green)]')}>4. Build the Review Habit</h3>
            <p className={cn(bodySmall, 'mt-2')}>Add one pre-trade note and one post-trade reflection per session. The AI does the heavy lifting after that.</p>
            <div className="mt-3 text-[11px] font-medium text-[var(--qe-ref-green)] flex items-center gap-1">Journal best practices <ArrowRight className="h-3 w-3" /></div>
          </Link>
        </div>
      </div>

      <div className={cardMain}>
        <div className={eyebrowStyle}>THE REVIEW LOOP</div>
        <h2 className={cn(headingSection, 'mt-2')}>How Serious Traders Use Qunt Edge Every Day</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-[13px] font-semibold text-[var(--qe-ref-green)]">CAPTURE</div>
            <p className="mt-2 text-[13px] leading-relaxed">Every fill lands in the journal with full execution detail. Pre-trade notes capture intent before the market moves. Screenshots and custom tags add context no broker export will ever contain.</p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--qe-ref-green)]">REVIEW</div>
            <p className="mt-2 text-[13px] leading-relaxed">The Widget Canvas surfaces what actually happened. The Copilot explains why it happened and what it means for your rules. You tag, score, and flag in seconds — not hours.</p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--qe-ref-green)]">ACT</div>
            <p className="mt-2 text-[13px] leading-relaxed">AI-generated debriefs become your personal coaching notes. Tomorrow&apos;s plan is written before you close the platform. Drift is caught early. Edge compounds.</p>
          </div>
        </div>
        <div className="mt-6 border-t border-[var(--qe-ref-card-border)] pt-4 text-[12px] text-[var(--qe-ref-text-muted)]">
          This is the same loop used by funded traders at multiple prop firms and by discretionary traders who have turned journaling from a chore into their single highest-ROI habit.
        </div>
      </div>

      <div>
        <div className={eyebrowStyle}>FREQUENTLY ASKED QUESTIONS</div>
        <h2 className={cn(headingSection, 'mt-2')}>Everything You Need to Know Before You Begin</h2>
        <div className="mt-6 mx-auto max-w-[820px] space-y-3">
          {faqs.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="flex w-full items-start justify-between gap-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-5 py-4 text-left transition-colors hover:border-[var(--qe-ref-green)]/30"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium">{faq.q}</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] text-[var(--qe-ref-green)]">
                    {openFaq === idx ? <span className="inline-block h-3 w-[2px] rounded-sm bg-[var(--qe-ref-green)]" /> : <Plus className="h-3 w-3" />}
                  </div>
                </div>
                {openFaq === idx && (
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--qe-ref-text-muted)]">{faq.a}</p>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center text-[12px] text-[var(--qe-ref-text-muted)]">
          Still have questions? <Link href={`/${locale}/support`} className="text-[var(--qe-ref-green)] underline underline-offset-2">Talk to our team</Link> or read the full <Link href={`/${locale}/faq`} className="text-[var(--qe-ref-green)] underline underline-offset-2">public FAQ</Link>.
        </div>
      </div>

      <div className={cardMain}>
        <div className={eyebrowStyle}>NEED HELP?</div>
        <h2 className={cn(headingSection, 'mt-2')}>We Are Traders Too. We Answer Fast.</h2>
        <p className="ref-body mt-3 max-w-[68ch]">
          Real support from real traders who use the platform every day. No ticket queues. No generic replies. When you need help with a workflow, an import edge case, or a prop firm rule interpretation, you get a human who actually understands the problem.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={`/${locale}/support`} className="flex items-center gap-3 rounded-lg border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 hover:border-[var(--qe-ref-green)]/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]"><Shield className="h-4 w-4" /></div>
            <div>
              <div className="font-medium text-[14px]">Support Portal</div>
              <div className="text-[12px] text-[var(--qe-ref-text-muted)]">Live chat, email, and priority trader support</div>
            </div>
          </Link>
          <Link href={`/${locale}/community`} className="flex items-center gap-3 rounded-lg border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 hover:border-[var(--qe-ref-green)]/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]"><Users className="h-4 w-4" /></div>
            <div>
              <div className="font-medium text-[14px]">Trader Community</div>
              <div className="text-[12px] text-[var(--qe-ref-text-muted)]">Discuss workflows, share setups, get peer reviews</div>
            </div>
          </Link>
          <Link href={`/${locale}/updates`} className="flex items-center gap-3 rounded-lg border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 hover:border-[var(--qe-ref-green)]/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]"><Clock className="h-4 w-4" /></div>
            <div>
              <div className="font-medium text-[14px]">Changelog &amp; Updates</div>
              <div className="text-[12px] text-[var(--qe-ref-text-muted)]">New widgets, Copilot improvements, import formats</div>
            </div>
          </Link>
          <a href="https://discord.gg/quntedge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 hover:border-[var(--qe-ref-green)]/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]"><Award className="h-4 w-4" /></div>
            <div>
              <div className="font-medium text-[14px]">Discord Community</div>
              <div className="text-[12px] text-[var(--qe-ref-text-muted)]">Real-time trader chat and office hours</div>
            </div>
          </a>
        </div>
        <div className="mt-6 text-[12px] text-[var(--qe-ref-text-muted)]">
          Prefer self-service? Every page in these docs includes direct links to the exact dashboard screen or setting being described. You are never more than two clicks from the live feature.
        </div>
      </div>

      <div className="text-center py-8 border-t border-[var(--qe-ref-card-border)]">
        <div className={eyebrowStyle}>READY TO BUILD YOUR EDGE?</div>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Start your professional review habit today.</h3>
        <p className="mt-2 text-[var(--qe-ref-text-muted)] max-w-md mx-auto">No credit card required for the first 14 days. Import your history. See your first AI debrief. Decide if it is the last trading journal you will ever need.</p>
        <div className="mt-5">
          <Link href={`/${locale}/authentication`} className="inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-3 text-[14px] font-semibold text-black transition-opacity hover:opacity-90">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-3 text-[11px] text-[var(--qe-ref-text-muted)]">Already a trader? <Link href={`/${locale}/authentication`} className="underline">Sign in</Link></div>
      </div>
    </div>
  )
}
