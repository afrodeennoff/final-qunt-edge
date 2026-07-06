'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Trophy, TrendingUp, Users, Award, Shield, ArrowRight, Check,
  Medal, Target, Eye, EyeOff, Star, Crown, BarChart3,
  Search, Filter, Percent
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsLeaderboardPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How is the leaderboard ranked?",
      a: "By default, the leaderboard is ranked by monthly P&L percentage return (starting balance adjusted). You can switch to: total P&L, win rate, profit factor, total trades, or Sharpe ratio. Each ranking can be filtered by time period (weekly, monthly, quarterly, yearly, all-time)."
    },
    {
      q: "Can I appear anonymously?",
      a: "Yes — in Settings → Profile → Leaderboard, choose 'Anonymous' mode. Your trades and stats will appear on the leaderboard but your display name is replaced with 'Anonymous Trader #XXXX.' The same option applies to individual trades if you share your profile."
    },
    {
      q: "What data is public when I join the leaderboard?",
      a: "Only what you choose to share. Minimum requirements: display name (or anonymous), win rate, and total P&L. Optional: equity curve (anonymized), trade count, average RR, profit factor, and instrument preferences. Your individual trade data, journal entries, and account numbers are never shared."
    },
    {
      q: "Can prop firms use the leaderboard for recruitment?",
      a: "Yes — many prop firms browse the leaderboard to find talented traders. If your profile is set to public, your stats page includes a 'Contact for Recruitment' button that firms can use. You control whether this button appears."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>LEADERBOARD</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Public Trader Leaderboard</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          The Qunt Edge leaderboard ranks verified traders by performance — monthly P&L, win rate, profit factor, 
          and more. Opt in to showcase your edge, attract prop firm offers, or simply hold yourself accountable 
          with public performance tracking. Full privacy controls.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/leaderboard`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            View Leaderboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/propfirms`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Prop Firm Catalogue
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Leaderboard Overview', '#overview'],
            ['Ranking Categories', '#rankings'],
            ['How to Join', '#join'],
            ['Privacy Controls', '#privacy'],
            ['Trader Profiles', '#profiles'],
            ['Prop Firm Recruitment', '#recruitment'],
            ['Leaderboard Integrity', '#integrity'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      <div id="overview">
        <div className={eyebrowStyle}>THE BIG PICTURE</div>
        <h2 className="ref-h-section mt-2">Leaderboard Overview</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          The leaderboard lives at <strong>/leaderboard</strong> and displays the top traders across multiple performance dimensions. 
          Today's top performers, this month's P&L leaders, and all-time consistency champions — all verified with real trade data.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">LEADERBOARD INTERFACE</div>
          <svg viewBox="0 0 920 320" className="w-full h-auto max-h-[300px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="880" height="280" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Top 3 podium */}
            <rect x="370" y="160" width="60" height="40" rx="4" fill="rgba(255,215,0,0.15)" stroke="#FFD700" />
            <text x="400" y="188" fill="#FFD700" fontSize="10" textAnchor="middle" fontWeight="700">#1</text>
            <rect x="300" y="175" width="50" height="25" rx="4" fill="rgba(192,192,192,0.15)" stroke="#C0C0C0" />
            <text x="325" y="192" fill="#C0C0C0" fontSize="9" textAnchor="middle">#2</text>
            <rect x="445" y="175" width="50" height="25" rx="4" fill="rgba(205,127,50,0.15)" stroke="#CD7F32" />
            <text x="470" y="192" fill="#CD7F32" fontSize="9" textAnchor="middle">#3</text>

            {/* Header */}
            <rect x="30" y="220" width="860" height="28" rx="4" fill="var(--qe-ref-surface-2)" />
            {["Rank", "Trader", "Win Rate", "Profit Factor", "Total P&L", "Trades"].map((h, i) => (
              <text key={i} x={50 + i*120} y="239" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">{h}</text>
            ))}

            {/* Top trader rows */}
            {[0,1,2,3,4].map(r => (
              <g key={r}>
                <rect x="30" y={252 + r*24} width="860" height="22" rx="3" fill={r % 2 === 0 ? 'transparent' : 'rgba(0,255,159,0.02)'} />
                <text x="60" y="267" fill={r < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][r] : 'var(--qe-ref-text-muted)'} fontSize="9" fontWeight={r < 3 ? '700' : '400'}>{r+1}</text>
                <text x="110" y="267" fill="var(--qe-ref-text)" fontSize="9">Trader_{100 + r}</text>
                <text x="230" y="267" fill="var(--qe-ref-green)" fontSize="9">{72 - r*5}%</text>
                <text x="350" y="267" fill="var(--qe-ref-text)" fontSize="9">{(2.1 - r*0.2).toFixed(2)}</text>
                <text x="470" y="267" fill="var(--qe-ref-green)" fontSize="9">+${12000 - r*2000}</text>
                <text x="590" y="267" fill="var(--qe-ref-text-muted)" fontSize="9">{500 - r*50}</text>
              </g>
            ))}
          </svg>
          <p className="text-center text-[11px] text-[var(--qe-ref-text-muted)] mt-2">Top 3 highlighted with gold/silver/bronze. Click any trader row to view their full profile.</p>
        </div>
      </div>

      {/* RANKINGS */}
      <div id="rankings">
        <div className={eyebrowStyle}>CATEGORIES</div>
        <h2 className="ref-h-section mt-2">Ranking Categories</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: TrendingUp, name: "Monthly P&L", desc: "Ranked by net P&L percentage return for the current month. Updated in real-time." },
            { icon: Percent, name: "Win Rate", desc: "Highest win rates among traders with 50+ trades. Minimum trade count applies." },
            { icon: Trophy, name: "Profit Factor", desc: "Best risk-adjusted returns. Gross profit / gross loss ratio ranking." },
            { icon: BarChart3, name: "Total Trades", desc: "Most active traders ranked by total trade count and consistency." },
          ].map((c, i) => (
            <div key={i} className={cardMain}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                <c.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{c.name}</div>
              <p className={bodySmall + ' mt-2'}>{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Time Period Filters</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {["Today", "This Week", "This Month", "Last 3 Months", "This Year", "All Time"].map((p, i) => (
              <span key={i} className="rounded bg-[var(--qe-ref-surface-2)] px-3 py-1.5 text-[var(--qe-ref-text-muted)] cursor-default">{p}</span>
            ))}
          </div>
          <p className="text-xs text-[var(--qe-ref-text-muted)] mt-2">Switch between time periods to see who is consistent vs who had a hot streak. Traders must have minimum trades per period to qualify.</p>
        </div>
      </div>

      {/* HOW TO JOIN */}
      <div id="join">
        <div className={eyebrowStyle}>OPT-IN</div>
        <h2 className="ref-h-section mt-2">How to Join the Leaderboard</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Users className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Opt In, Stay in Control</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Participation is entirely opt-in. You are not on the leaderboard by default. To join:</p>
              <ol className="mt-3 space-y-1 text-sm text-[var(--qe-ref-text-muted)] list-decimal pl-5">
                <li>Go to <strong>Settings → Profile → Leaderboard</strong></li>
                <li>Toggle <strong>"Appear on Public Leaderboard"</strong> to On</li>
                <li>Choose your <strong>Display Name</strong> (or anonymous mode)</li>
                <li>Select which <strong>stats to display</strong> (minimum 2 required)</li>
                <li>Save changes. You appear on the leaderboard within 5 minutes.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div id="privacy">
        <div className={eyebrowStyle}>CONTROL</div>
        <h2 className="ref-h-section mt-2">Privacy Controls</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Public Mode</div>
            </div>
            <p className={bodySmall}>Your display name, stats, and (optionally) equity curve and instrument preferences are visible on the leaderboard. Clicking your name opens your public trader profile. Your individual trades, journal entries, and account data remain private.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Anonymous Mode</div>
            </div>
            <p className={bodySmall}>Your stats appear on the leaderboard but your identity is hidden behind an anonymous ID (e.g., "Anonymous Trader #2847"). No link to your account or profile. Toggle between public and anonymous at any time without losing your stats.</p>
          </div>
        </div>
        <div className="mt-4 cardMain">
          <div className="text-sm text-[var(--qe-ref-text-muted)] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--qe-ref-green)] shrink-0" />
            You can opt out of the leaderboard entirely at any time. Your historical data is cleared from the leaderboard within 24 hours of opting out.
          </div>
        </div>
      </div>

      {/* PROFILES */}
      <div id="profiles">
        <div className={eyebrowStyle}>TRADER PROFILES</div>
        <h2 className="ref-h-section mt-2">Public Trader Profiles</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Profile Page Contents</div>
            <p className={bodySmall + ' mt-2'}>Each trader's public profile includes: display name, bio, win rate, profit factor, equity curve (anonymized), total trades, average RR, instrument preferences, and trading style tags. Profiles can include social links (Twitter, Discord) and an optional "Contact for Recruitment" button.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Verified Badge</div>
            <p className={bodySmall + ' mt-2'}>The green verified checkmark on a trader's profile means their data is connected through a direct broker API and cannot be falsified. Traders with verified badges are prioritized in recruitment searches by prop firms.</p>
          </div>
        </div>
      </div>

      {/* RECRUITMENT */}
      <div id="recruitment">
        <div className={eyebrowStyle}>OPPORTUNITY</div>
        <h2 className="ref-h-section mt-2">Prop Firm Recruitment</h2>
        <div className="cardMain">
          <p className={bodySmall}>Prop firms and trading funds actively browse the Qunt Edge leaderboard to discover talent. Here is how the recruitment pipeline works:</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs">
            {[
              { icon: Search, title: "Discovery", desc: "Firms filter the leaderboard by metrics that matter to them — win rate, profit factor, consistency score, and preferred instruments." },
              { icon: Award, title: "Contact", desc: "If your profile has the recruitment button enabled, firms can send you a connection request through the platform. Your email stays private until you respond." },
              { icon: Trophy, title: "Opportunity", desc: "Connect with firms offering funded accounts, talent scholarships, or coaching programs — all based on your verified performance." },
            ].map((s, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-4 w-4 text-[var(--qe-ref-green)]" />
                  <span className="font-medium text-[var(--qe-ref-text)]">{s.title}</span>
                </div>
                <div className="text-[var(--qe-ref-text-muted)]">{s.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--qe-ref-text-muted)] mt-3">Recruitment is opt-in at every step. You control who can contact you and what data they see before the connection is made.</p>
        </div>
      </div>

      {/* INTEGRITY */}
      <div id="integrity">
        <div className={eyebrowStyle}>FAIRNESS</div>
        <h2 className="ref-h-section mt-2">Leaderboard Integrity</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Anti-Gaming Measures</div>
            </div>
            <p className={bodySmall}>The leaderboard has minimum trade requirements (configurable per ranking category) and detects anomalous patterns: sudden P&L spikes, inconsistent position sizing, and account data that doesn't match broker API records. Rankings are weighted by trade count to prevent small-sample-size leaderboards.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Medal className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Verified vs Unverified</div>
            </div>
            <p className={bodySmall}>API-connected traders display a verified badge. Manual import traders display without the badge but can still appear on the leaderboard. Users can filter to show only verified traders. Prop firm recruitment primarily focuses on verified profiles.</p>
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
        <div className="text-lg font-semibold tracking-tight">See where you rank</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Opt in to the leaderboard and measure your edge against the best.</p>
        <Link href={`/${locale}/docs/teams`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Teams <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/propfirms`} className="underline underline-offset-2 hover:no-underline">Prop Firms</Link> • <Link href={`/${locale}/docs/settings`} className="underline underline-offset-2 hover:no-underline">Profile Settings</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The leaderboard is updated in real-time with verified trade data from API-connected accounts.</div>
    </div>
  )
}
