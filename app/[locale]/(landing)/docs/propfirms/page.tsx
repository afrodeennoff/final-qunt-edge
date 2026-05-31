'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Building2, Target, Shield, TrendingUp, DollarSign, Trophy, Award,
  ArrowRight, Check, Search, Filter, Star, Users, BarChart3, Clock,
  AlertTriangle, ExternalLink
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsPropFirmsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How many prop firms are in the catalogue?",
      a: "50+ verified firms including FTMO, Topstep, E8 Markets, The Funded Trader, Fidelcrest, SurgeTrader, Audacity Capital, City Traders Imperium, Lux Trading Firm, and many more. We add new firms regularly based on community requests."
    },
    {
      q: "Can I track multiple challenges from the same firm?",
      a: "Yes — each challenge is a separate account in Qunt Edge. You can run multiple FTMO challenges, multiple Topstep evaluations, or any combination. Each gets its own compliance dashboard and progress tracking."
    },
    {
      q: "How does the consistency rule tracking work?",
      a: "Most prop firms require that no single day's profit exceeds a percentage of total profit (typically 30%). The compliance engine calculates your best-day ratio automatically and shows your current score vs the firm's threshold in real-time."
    },
    {
      q: "Can I share my compliance dashboard with my prop firm?",
      a: "Yes — use the Share button on any account's compliance view to generate a read-only link. This link shows your real-time drawdown, profit target progress, and consistency score. Perfect for verification or coaching sessions."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>PROP FIRMS</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Prop Firm Catalogue & Compliance Engine</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Browse 50+ verified prop firms, compare challenge rules side-by-side, and track your evaluation and funded 
          accounts in real-time. The most comprehensive prop firm toolset available in any trading journal — from 
          challenge selection to payout tracking.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/propfirms`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Browse Catalogue <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/deals`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Challenge Deals
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Catalogue Overview', '#catalogue'],
            ['Challenge Types Explained', '#challenges'],
            ['Rules Comparison Tool', '#comparison'],
            ['Linking Challenges to Your Journal', '#linking'],
            ['Compliance Dashboard', '#compliance'],
            ['Community Stats & Payouts', '#community'],
            ['Payout Tracking', '#payouts'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* CATALOGUE */}
      <div id="catalogue">
        <div className={eyebrowStyle}>EXPLORE</div>
        <h2 className="ref-h-section mt-2">Catalogue Overview</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          The Prop Firm Catalogue at <strong>/propfirms</strong> is a searchable, filterable directory of 50+ prop firms. Each firm profile includes: challenge types, fee structure, profit target, max drawdown rules, consistency requirements, time limits, scaling plans, payout frequency, and verified community payout data.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "FTMO", rating: "4.8", challenges: "2-Phase, 1-Phase", accounts: "25k-200k", payout: "80-90%" },
            { name: "Topstep", rating: "4.7", challenges: "Combine, Express", accounts: "50k-150k", payout: "80-100%" },
            { name: "E8 Markets", rating: "4.6", challenges: "2-Phase, 1-Phase", accounts: "10k-100k", payout: "80-90%" },
            { name: "The Funded Trader", rating: "4.5", challenges: "1-Phase, 2-Phase", accounts: "5k-300k", payout: "75-90%" },
            { name: "Fidelcrest", rating: "4.4", challenges: "1-Phase, 2-Phase", accounts: "10k-200k", payout: "70-85%" },
            { name: "SurgeTrader", rating: "4.5", challenges: "1-Phase", accounts: "10k-1M", payout: "75-90%" },
            { name: "Audacity Capital", rating: "4.3", challenges: "Evaluation", accounts: "25k-200k", payout: "50-80%" },
            { name: "City Traders", rating: "4.4", challenges: "2-Phase", accounts: "25k-100k", payout: "80%" },
            { name: "Lux Trading", rating: "4.2", challenges: "Evaluation", accounts: "100k-5M", payout: "50-80%" },
          ].map((f, i) => (
            <div key={i} className={cardMain}>
              <div className="flex items-center justify-between mb-2">
                <div className={headingCard}>{f.name}</div>
                <div className="flex items-center gap-1 text-xs text-amber-400"><Star className="h-3 w-3" />{f.rating}</div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-[var(--qe-ref-text-muted)]">
                <div>Challenge: <span className="text-[var(--qe-ref-text)]">{f.challenges}</span></div>
                <div>Accounts: <span className="text-[var(--qe-ref-text)]">{f.accounts}</span></div>
                <div>Payout: <span className="text-[var(--qe-ref-green)]">{f.payout}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHALLENGE TYPES */}
      <div id="challenges">
        <div className={eyebrowStyle}>STRUCTURE</div>
        <h2 className="ref-h-section mt-2">Challenge Types Explained</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3"><Target className="h-4.5 w-4.5" /></div>
            <div className={headingCard}>1-Phase Challenges</div>
            <p className={bodySmall + ' mt-2'}>A single evaluation phase. Meet the profit target while staying within drawdown limits. No consistency rule or minimum trading days typically required. Pass → funded. Examples: SurgeTrader, TFT 1-Phase.</p>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3"><Trophy className="h-4.5 w-4.5" /></div>
            <div className={headingCard}>2-Phase Challenges</div>
            <p className={bodySmall + ' mt-2'}>Two evaluation stages. Phase 1: meet profit target + drawdown rules. Phase 2: repeat a similar target with tighter rules or consistency requirements. Pass both → funded. Examples: FTMO, Topstep Combine.</p>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3"><Award className="h-4.5 w-4.5" /></div>
            <div className={headingCard}>Funded Accounts</div>
            <p className={bodySmall + ' mt-2'}>Live capital with ongoing rules: max drawdown, daily loss limits, profit splits, payout schedules. Some firms have trailing drawdown that adjusts with P&L. Scaling plans increase capital based on performance.</p>
          </div>
        </div>
      </div>

      {/* COMPARISON */}
      <div id="comparison">
        <div className={eyebrowStyle}>SIDE-BY-SIDE</div>
        <h2 className="ref-h-section mt-2">Rules Comparison Tool</h2>
        <div className="cardMain">
          <p className={bodySmall}>The comparison tool lets you select up to 5 prop firm challenges and compare every rule side-by-side:</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-xs">
            {[
              "Profit Target (Phase 1 & 2)",
              "Max Drawdown (static vs trailing)",
              "Daily Loss Limit",
              "Consistency Rule (%)",
              "Minimum Trading Days",
              "Maximum Time Limit",
              "Fee Structure (refundable?)",
              "Profit Split (first payout and ongoing)",
              "Payout Frequency",
              "Scaling Plan Details",
              "Instrument Restrictions",
              "News Trading Rules",
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LINKING */}
      <div id="linking">
        <div className={eyebrowStyle}>CONNECT</div>
        <h2 className="ref-h-section mt-2">Linking Challenges to Your Journal</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">How to Link</div>
            <p className={bodySmall + ' mt-2'}>From a firm's catalogue page, click "Link to Journal." Select the account type (evaluation or funded), the specific challenge rules, and the account's starting balance. The system creates a new account in your journal pre-configured with all compliance rules for that challenge.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">What Gets Tracked</div>
            <p className={bodySmall + ' mt-2'}>Once linked, every trade imported is checked against the challenge rules in real-time. The compliance dashboard shows: profit target progress %, drawdown remaining (in $ and %), daily P&L vs daily loss limit, consistency score, days traded vs minimum, and time elapsed vs limit.</p>
          </div>
        </div>
      </div>

      {/* COMPLIANCE */}
      <div id="compliance">
        <div className={eyebrowStyle}>REAL-TIME</div>
        <h2 className="ref-h-section mt-2">Compliance Dashboard</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Shield className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Live Rule Monitoring</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">Each linked challenge account gets a dedicated compliance widget (available on the Dashboard and Accounts page). The widget shows all rules with color-coded status:</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-green-400"><div className="h-1.5 w-1.5 rounded-full bg-green-400" /> On Track</span>
                <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-amber-400"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Caution (80%+)</span>
                <span className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-red-400"><div className="h-1.5 w-1.5 rounded-full bg-red-400" /> At Risk</span>
              </div>
              <p className="text-sm text-[var(--qe-ref-text-muted)] mt-2">When a rule approaches violation, you receive an alert (push or email) with specific guidance: "You have $340 remaining before hitting max drawdown" or "Your consistency ratio is 34% — needs to be under 30%."</p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY */}
      <div id="community">
        <div className={eyebrowStyle}>VERIFIED DATA</div>
        <h2 className="ref-h-section mt-2">Community Stats & Payouts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Community-Powered Data</div>
            </div>
            <p className={bodySmall}>Each firm's catalogue page shows aggregated community stats: average days to pass challenge, pass rate percentage, average payout amount, common reasons for failure, and trader-sourced tips. This data is anonymized and aggregated — no individual performance is visible.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Verified Payout Reports</div>
            </div>
            <p className={bodySmall}>Traders can optionally submit verified payout screenshots. Each submission is reviewed and displayed on the firm's page. Click any payout to see the account size, time to first payout, profit split, and trader notes (anonymous). This transparency helps you choose firms that actually pay.</p>
          </div>
        </div>
      </div>

      {/* PAYOUT TRACKING */}
      <div id="payouts">
        <div className={eyebrowStyle}>EARNINGS</div>
        <h2 className="ref-h-section mt-2">Payout Tracking</h2>
        <div className="cardMain">
          <p className={bodySmall}>For funded accounts, track your full payout lifecycle within Qunt Edge:</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
            {[
              { title: "Eligibility", desc: "System calculates when you are eligible for a payout based on firm rules (usually 14-30 days after first trade, minimum profit threshold)" },
              { title: "Request Logging", desc: "Log payout requests with date, amount, and status. Track from 'Submitted' → 'Approved' → 'Paid' with optional proof upload" },
              { title: "History & Analytics", desc: "View all payouts in one place. Calculate total earnings, average payout, time between payouts, and annualized income from trading" },
            ].map((p, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                <div className="font-medium text-[var(--qe-ref-text)] mb-1">{p.title}</div>
                <div className="text-[var(--qe-ref-text-muted)]">{p.desc}</div>
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
        <div className="text-lg font-semibold tracking-tight">Find your next challenge</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">50+ firms. Real rules. Real community data. Real payouts.</p>
        <Link href={`/${locale}/docs/deals`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Deals & Discounts <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/accounts`} className="underline underline-offset-2 hover:no-underline">Account Management</Link> • <Link href={`/${locale}/docs/leaderboard`} className="underline underline-offset-2 hover:no-underline">Leaderboard</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The Prop Firm Catalogue is updated monthly with new firms and community payout data.</div>
    </div>
  )
}
