'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Activity, Building2, Shield, TrendingUp, DollarSign, Target, ArrowRight,
  Check, Plus, Link as LinkIcon, Wallet, BarChart3, AlertTriangle,
  Award, PieChart, ExternalLink
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsAccountsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How do I connect my brokerage account?",
      a: "Go to Settings → Accounts → Connect Broker. Each broker has a specific flow: Tradovate uses OAuth (click to authorize), Rithmic uses API credentials, and manual brokers require only a name and starting balance. Your API keys are encrypted and never stored in plaintext."
    },
    {
      q: "Can I have both personal and prop firm accounts?",
      a: "Yes — accounts are fully independent. There is no limit on personal brokerage accounts. Prop firm challenge accounts have plan-based limits (see Settings → Subscription for your plan's details). Each account has its own trade history, P&L tracking, and compliance rules. The Dashboard filter lets you view individual accounts or aggregate across all of them."
    },
    {
      q: "How does prop firm challenge tracking work?",
      a: "When you link a prop firm challenge account, you select the firm, challenge type, and rules (profit target, max drawdown, consistency requirement, time limit). Qunt Edge tracks your progress in real time: current P&L vs target, drawdown remaining, days elapsed, and consistency score."
    },
    {
      q: "What happens when I get funded through a prop firm?",
      a: "You can convert your evaluation account to a funded account type in the settings. Funded accounts have different tracking: payout schedules, trailing drawdown rules, and monthly profit splits. The compliance dashboard adjusts automatically based on account type."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>ACCOUNTS</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Account Management</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Manage every account you trade from — personal brokerage, prop firm evaluations, funded accounts — all in one place.
          Each account gets independent trade tracking, compliance monitoring, and performance metrics. Multi-account support
          means you never need to switch between platforms.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/accounts`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Manage Accounts <ArrowRight className="h-4 w-4" />
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
            ['Account Types Overview', '#types'],
            ['Adding & Connecting Accounts', '#connect'],
            ['Multi-Account Support', '#multi'],
            ['Broker Connections', '#brokers'],
            ['Prop Firm Challenge Tracking', '#propfirm'],
            ['Account Metrics & Dashboards', '#metrics'],
            ['Payout & Compliance Tracking', '#compliance'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* TYPES */}
      <div id="types">
        <div className={eyebrowStyle}>ACCOUNT TYPES</div>
        <h2 className="ref-h-section mt-2">Account Types Overview</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Qunt Edge supports three account types, each with specialized tracking and compliance features.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Personal Brokerage</div>
            <p className={bodySmall + ' mt-2'}>Your personal trading accounts — broker-connected or manually tracked. Full P&L tracking, trade import, journaling, and analytics. No compliance rules. Unlimited accounts.</p>
            <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
              {["Tradovate", "Rithmic", "Manual", "CSV Sync"].map(t => (
                <span key={t} className="rounded bg-[var(--qe-ref-surface-2)] px-2 py-0.5 text-[var(--qe-ref-text-muted)]">{t}</span>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <Target className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Prop Firm Evaluation</div>
            <p className={bodySmall + ' mt-2'}>Challenge accounts with profit targets, max drawdown limits, consistency rules, and time constraints. Real-time progress tracking against every rule. Connect directly from the Prop Firm Catalogue.</p>
            <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
              {["FTMO", "Topstep", "E8 Markets", "The Funded Trader", "+50 more"].map(t => (
                <span key={t} className="rounded bg-[var(--qe-ref-surface-2)] px-2 py-0.5 text-[var(--qe-ref-text-muted)]">{t}</span>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div className={headingCard}>Funded Accounts</div>
            <p className={bodySmall + ' mt-2'}>Live funded capital from prop firms. Track payout schedules, trailing drawdown limits, monthly profit splits, and compliance. Automatic alerts when nearing violation thresholds.</p>
            <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
              {["Payout Tracking", "Profit Split Calc", "Trailing DD", "Compliance Reports"].map(t => (
                <span key={t} className="rounded bg-[var(--qe-ref-surface-2)] px-2 py-0.5 text-[var(--qe-ref-text-muted)]">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONNECT */}
      <div id="connect">
        <div className={eyebrowStyle}>SETUP</div>
        <h2 className="ref-h-section mt-2">Adding & Connecting Accounts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Broker Auto-Connect</div>
            </div>
            <p className={bodySmall}>Navigate to Settings → Accounts and click "Connect Broker." Select your broker and authorize. Tradovate uses OAuth (no passwords shared). Rithmic requires API credentials encrypted at rest. Trades sync automatically in real-time.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Manual Account Creation</div>
            </div>
            <p className={bodySmall}>For brokers without direct API or prop firm challenges, create a manual account. Enter the account name, starting balance, and metadata. Manual accounts support CSV imports and manual trade entry.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Prop Firm Challenge Linking</div>
            </div>
            <p className={bodySmall}>Browse the Prop Firm Catalogue, select your firm and challenge type, and click "Link to Account." The system pre-populates challenge rules. Your trades are tracked against profit targets, drawdown limits, and consistency rules in real-time.</p>
            <Link href={`/${locale}/docs/propfirms`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Browse Prop Firm Catalogue →</Link>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Account Validation</div>
            </div>
            <p className={bodySmall}>Each account is validated on creation. Connected broker accounts are verified via API handshake. Manual accounts require a starting balance entry. Duplicate detection prevents creating the same account twice.</p>
          </div>
        </div>
      </div>

      {/* MULTI ACCOUNT */}
      <div id="multi">
        <div className={eyebrowStyle}>SCALE</div>
        <h2 className="ref-h-section mt-2">Multi-Account Support</h2>
        <div className={cardMain}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Activity className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Unlimited Accounts, Unified View</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">Add as many accounts as you need. Each account is completely independent — separate trade history, separate journal, separate compliance. But the Dashboard filter lets you view them individually, grouped, or all together.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-[var(--qe-ref-text-muted)]">
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" /> Run multiple prop firm challenges simultaneously</div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" /> Separate personal trading from prop firm trading</div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" /> Track different strategies in separate accounts</div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" /> Compare performance across accounts side-by-side</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BROKERS */}
      <div id="brokers">
        <div className={eyebrowStyle}>INTEGRATIONS</div>
        <h2 className="ref-h-section mt-2">Broker Connections</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Direct API Sync</div>
            <p className={bodySmall + ' mt-2'}>Supported brokers with real-time, automatic trade synchronization:</p>
            <div className="mt-3 space-y-1 text-xs text-[var(--qe-ref-text-muted)]">
              <div className="flex justify-between"><span>Tradovate</span><span className="text-[var(--qe-ref-green)]">● OAuth</span></div>
              <div className="flex justify-between"><span>Rithmic</span><span className="text-[var(--qe-ref-green)]">● API Key</span></div>
              <div className="flex justify-between"><span>DXfeed</span><span className="text-[var(--qe-ref-green)]">● API Key</span></div>
            </div>
          </div>
          <div className={cardMain}>
            <div className="headingCard">File-Based Import</div>
            <p className={bodySmall + ' mt-2'}>For brokers without API, import trade files:</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
              {["NinjaTrader", "MT5", "MultiCharts", "TradingView", "Thinkorswim", "IBKR (PDF)", "Quantower", "TradeZella", "Topstep", "FTMO", "ETP", "Thor", "CSV", "Excel"].map(b => (
                <span key={b} className="rounded bg-[var(--qe-ref-surface-2)] px-2.5 py-1 text-[var(--qe-ref-text-muted)]">{b}</span>
              ))}
            </div>
            <Link href={`/${locale}/docs/import`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full import documentation →</Link>
          </div>
        </div>
      </div>

      {/* PROP FIRM */}
      <div id="propfirm">
        <div className={eyebrowStyle}>COMPLIANCE</div>
        <h2 className="ref-h-section mt-2">Prop Firm Challenge Tracking</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Real-Time Rule Monitoring</div>
            <p className={bodySmall + ' mt-2'}>Every prop firm challenge has unique rules. The compliance engine tracks all of them simultaneously:</p>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { rule: "Profit Target", desc: "Progress toward target amount — percentage complete and remaining $ needed" },
                { rule: "Max Drawdown", desc: "Current drawdown vs limit with real-time remaining buffer" },
                { rule: "Daily Loss Limit", desc: "Today's P&L vs daily loss limit — resets each trading day" },
                { rule: "Consistency Score", desc: "Best/worst day ratio — must stay under firm threshold (typically 30%)" },
                { rule: "Minimum Trading Days", desc: "Days traded vs minimum required by the challenge rules" },
                { rule: "Time Limit", desc: "Calendar days elapsed vs challenge duration limit" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--qe-ref-green)] shrink-0" />
                  <span className="font-medium text-[var(--qe-ref-text)]">{r.rule}:</span>
                  <span className="text-[var(--qe-ref-text-muted)]">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Visual Compliance Dashboard</div>
            <p className={bodySmall + ' mt-2'}>Each linked prop firm account displays a compliance widget with color-coded status indicators:</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400 font-medium">On Track</span>
                <span className="text-[var(--qe-ref-text-muted)]">— All rules within compliance, no alerts</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-2">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-medium">Caution</span>
                <span className="text-[var(--qe-ref-text-muted)]">— Approaching a limit (80%+ of allowance used)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-400 font-medium">At Risk</span>
                <span className="text-[var(--qe-ref-text-muted)]">— Near or at a violation threshold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div id="metrics">
        <div className={eyebrowStyle}>MEASUREMENT</div>
        <h2 className="ref-h-section mt-2">Account Metrics & Dashboards</h2>
        <div className="cardMain">
          <p className={bodySmall}>Each account has a dedicated metrics dashboard accessible from the Accounts page or as a Dashboard widget. Key metrics include:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            {[
              { label: "Starting Balance", desc: "Initial account capital at creation" },
              { label: "Current Equity", desc: "Starting balance + realized P&L" },
              { label: "Total P&L", desc: "Net realized gains/losses all-time" },
              { label: "Win Rate", desc: "Account-specific win/loss ratio" },
              { label: "Profit Factor", desc: "Account-specific risk-adjusted return" },
              { label: "Total Trades", desc: "All trades executed in this account" },
              { label: "Avg Position Time", desc: "Mean hold time for account trades" },
              { label: "Max Drawdown", desc: "Peak-to-trough loss for this account" },
              { label: "Last Activity", desc: "Date of most recent trade in account" },
            ].map((m, i) => (
              <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-2.5">
                <div className="font-medium text-[var(--qe-ref-text)]">{m.label}</div>
                <div className="text-[var(--qe-ref-text-muted)] mt-0.5">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLIANCE */}
      <div id="compliance">
        <div className={eyebrowStyle}>PAYOUTS</div>
        <h2 className="ref-h-section mt-2">Payout & Compliance Tracking</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Payout Schedules</div>
            </div>
            <p className={bodySmall}>For funded accounts, track payout history and upcoming eligibility. The system shows: last payout date and amount, next eligible payout date, minimum profit requirement for payout, and profit split percentage. Payout requests can be logged and tracked through the platform.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <div className={headingCard}>Compliance Alerts</div>
            </div>
            <p className={bodySmall}>Get push and email notifications when an account approaches violation thresholds. Alerts are configurable per account and per rule type. When an alert triggers, the Copilot can suggest specific actions: "Reduce position size on NQ to stay within daily loss limit" or "You need 2 more trading days to meet the minimum."</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Account Lifecycle</div>
          <svg viewBox="0 0 800 60" className="w-full max-w-[700px]">
            <rect x="20" y="15" width="120" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="80" y="35" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Create Account</text>
            <line x1="145" y1="30" x2="175" y2="30" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="175,30 167,25 167,35" fill="var(--qe-ref-green)" />
            <rect x="180" y="15" width="140" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="250" y="35" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Connect Broker or CSV</text>
            <line x1="325" y1="30" x2="355" y2="30" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="355,30 347,25 347,35" fill="var(--qe-ref-green)" />
            <rect x="360" y="15" width="120" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="420" y="35" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Trades Sync Auto</text>
            <line x1="485" y1="30" x2="515" y2="30" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="515,30 507,25 507,35" fill="var(--qe-ref-green)" />
            <rect x="520" y="15" width="140" height="30" rx="6" fill="rgba(0,255,159,0.15)" stroke="var(--qe-ref-green)" />
            <text x="590" y="35" fill="var(--qe-ref-green)" fontSize="10" textAnchor="middle" fontWeight="600">Compliance Dashboard</text>
            <line x1="665" y1="30" x2="695" y2="30" stroke="var(--qe-ref-green)" strokeWidth="2" />
            <polygon points="695,30 687,25 687,35" fill="var(--qe-ref-green)" />
            <rect x="700" y="15" width="80" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
            <text x="740" y="35" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Payout</text>
          </svg>
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
        <div className="text-lg font-semibold tracking-tight">Connect your first account</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted)]">One account or twenty — the platform scales with your trading.</p>
        <Link href={`/${locale}/docs/propfirms`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Prop Firm Catalogue <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/import`} className="underline underline-offset-2 hover:no-underline">Data Import</Link> • <Link href={`/${locale}/docs/settings`} className="underline underline-offset-2 hover:no-underline">Settings</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Account management supports unlimited accounts with independent trade history and compliance tracking.</div>
    </div>
  )
}
