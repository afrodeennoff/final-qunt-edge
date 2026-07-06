'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Settings, Palette, User, Bell, Clock, Globe, CreditCard, Users,
  ArrowRight, Check, Shield, Monitor, Moon, Sun, Smartphone,
  Key, Lock, Mail, Sliders, Award, Download
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsSettingsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const themes = [
    { name: "Obsidian", colors: "bg-zinc-900 border-zinc-700", desc: "Dark, high-contrast professional theme" },
    { name: "Neon", colors: "bg-slate-900 border-emerald-500", desc: "Vibrant green accents on deep background" },
    { name: "Forest", colors: "bg-stone-900 border-lime-600", desc: "Earthy tones, warm green palette" },
    { name: "Midnight", colors: "bg-indigo-950 border-indigo-500", desc: "Blue-tinted dark with indigo accents" },
    { name: "Nord", colors: "bg-slate-800 border-cyan-400", desc: "Scandinavian-inspired cool tones" },
    { name: "Dracula", colors: "bg-[#282a36] border-[#ff79c6]", desc: "Popular dark purple-pink palette" },
    { name: "Light Clean", colors: "bg-white border-gray-200", desc: "Clean light theme for daytime trading" },
    { name: "Light Warm", colors: "bg-amber-50 border-amber-300", desc: "Warm light theme, easy on the eyes" },
  ]

  const faqs = [
    {
      q: "Can I have different themes for different accounts?",
      a: "Themes are account-wide, not per-account. However, you can switch between light and dark mode independently of your theme choice. Your theme preference syncs across all devices automatically."
    },
    {
      q: "How do I change my timezone?",
      a: "Go to Settings → Profile → Timezone. Find your timezone in the searchable dropdown. All trade times, reports, and statistics will display in this timezone. Historical trades are stored in UTC and converted on display."
    },
    {
      q: "What happens if I cancel my subscription?",
      a: "Your subscription downgrades at the end of the current billing period. You keep all your data — trades, journal entries, settings — on a read-only basis. To resume journaling and analytics, simply reactivate your subscription."
    },
    {
      q: "Can I export all my data when leaving?",
      a: "Yes — use the Data Export tool in Settings → Account to download all trades, journal entries, and settings as CSV/JSON. There are no lock-in practices. Your data is yours."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>SETTINGS & PROFILE</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Settings, Profile & Customization</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Configure every aspect of your Qunt Edge experience — from 8 hand-crafted dashboard themes and timezone 
          preferences to account linking, notification rules, billing, and team management.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/settings`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open Settings <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/getting-started`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Getting Started
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Profile & Account Settings', '#profile'],
            ['Dashboard Themes (8 Palettes)', '#themes'],
            ['Timezone & Region', '#timezone'],
            ['Account Linking', '#linking'],
            ['Notifications & Alerts', '#notifications'],
            ['Billing & Subscription', '#billing'],
            ['Team Management', '#teams'],
            ['Privacy & Data', '#privacy'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* PROFILE */}
      <div id="profile">
        <div className={eyebrowStyle}>IDENTITY</div>
        <h2 className="ref-h-section mt-2">Profile & Account Settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Profile Information</div>
            </div>
            <p className={bodySmall}>Update your display name, email address, avatar, and public trader profile. Your profile URL can be shared with the community or kept private. The public profile shows: win rate, equity curve (opt-in), recent trades (opt-in), and bio. Full control over what is visible.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Account Security</div>
            </div>
            <p className={bodySmall}>Password management (change, reset), two-factor authentication (TOTP via authenticator app), active sessions manager (view and revoke), and login history. Connected third-party apps (OAuth tokens) can be managed and revoked individually.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Email Preferences</div>
            </div>
            <p className={bodySmall}>Control which emails you receive: weekly AI debriefs, compliance alerts, import confirmations, billing receipts, product updates, and marketing. Each category is independently togglable. Unsubscribe from individual email types without affecting critical account notifications.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>API Keys</div>
            </div>
            <p className={bodySmall}>Generate and manage personal API keys for programmatic access to your trade data. Each key is named, scoped (read/write), and revocable. Last-used timestamps help identify stale keys. Never share your API keys.</p>
          </div>
        </div>
      </div>

      {/* THEMES */}
      <div id="themes">
        <div className={eyebrowStyle}>VISUAL IDENTITY</div>
        <h2 className="ref-h-section mt-2">Dashboard Themes — 8 Hand-Crafted Palettes</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Qunt Edge ships with 8 unique dashboard themes. Each theme transforms the entire visual experience — 
          widget backgrounds, chart colors, sidebar, header, and even the Copilot chat bubbles — respecting 
          CSS custom properties for a consistent, performant re-theme.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((theme, i) => (
            <div key={i} className={`${cardMain} cursor-default`}>
              <div className={`h-12 rounded-lg ${theme.colors} mb-3 flex items-center justify-center border`}>
                <Palette className="h-5 w-5 opacity-40" />
              </div>
              <div className={headingCard}>{theme.name}</div>
              <p className={bodySmall + ' mt-1'}>{theme.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 flex items-center gap-3">
          <Monitor className="h-5 w-5 text-[var(--qe-ref-green)] shrink-0" />
          <p className="text-sm text-[var(--qe-ref-text-muted])">Each theme works with both light and dark base modes independently. Apply via Settings → Appearance → Dashboard Theme. Changes take effect immediately across all active sessions.</p>
        </div>
      </div>

      {/* TIMEZONE */}
      <div id="timezone">
        <div className={eyebrowStyle}>GLOBAL</div>
        <h2 className="ref-h-section mt-2">Timezone & Region Configuration</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Timezone</div>
            </div>
            <p className={bodySmall}>Set your primary trading timezone. All trade times, session debriefs, weekly reports, and calendar widgets display in this timezone. Supports all IANA timezone database entries. Searchable dropdown with automatic DST handling.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Trading Session Hours</div>
            </div>
            <p className={bodySmall}>Define your trading session start/end times. This enables session-based filtering (pre-market, regular, after-hours, or custom) and powers the auto-debrief trigger. Sessions can be named and color-coded in calendar views.</p>
          </div>
        </div>
      </div>

      {/* ACCOUNT LINKING */}
      <div id="linking">
        <div className={eyebrowStyle}>CONNECTIONS</div>
        <h2 className="ref-h-section mt-2">Account Linking</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><div className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Manage Connected Accounts</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">The Settings → Accounts section shows every connected account: broker connections, prop firm challenges, and manual accounts. For each connection you can: view status (connected/disconnected/error), sync manually, revoke access, rename, or delete. Broker connections show the last sync timestamp and trade count. Revoking a connection stops future syncs but preserves imported trade history.</p>
              <Link href={`/${locale}/docs/accounts`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Account Management guide →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div id="notifications">
        <div className={eyebrowStyle}>ALERTS</div>
        <h2 className="ref-h-section mt-2">Notification Preferences</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            { icon: Bell, name: "Push Notifications", desc: "Browser push notifications for: trade sync complete, import finished, compliance alerts, AI debrief ready, and team activities." },
            { icon: Mail, name: "Email Notifications", desc: "Weekly AI reports, compliance threshold warnings, billing receipts, and platform announcements. Configured in Email Preferences." },
            { icon: Smartphone, name: "Mobile Alerts", desc: "Coming soon to the Qunt Edge mobile app. Same notification categories as desktop, with additional configurable quiet hours." },
            { icon: Sliders, name: "Alert Thresholds", desc: "Set custom thresholds for compliance alerts: drawdown percentage, daily loss limit usage, consistency ratio warnings, and streak triggers." },
          ].map((n, i) => (
            <div key={i} className={cardMain}>
              <div className="flex items-center gap-2 mb-2">
                <n.icon className="h-4 w-4 text-[var(--qe-ref-green)]" />
                <div className={headingCard}>{n.name}</div>
              </div>
              <p className={bodySmall}>{n.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BILLING */}
      <div id="billing">
        <div className={eyebrowStyle}>PLANS</div>
        <h2 className="ref-h-section mt-2">Billing & Subscription</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Manage Subscription</div>
            </div>
            <p className={bodySmall}>View your current plan, billing cycle (monthly/annual), and payment method. Upgrade, downgrade, or cancel from this page. All changes take effect at the next billing cycle. Annual plans offer a discount. Payment history is available for download.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Plan Features</div>
            </div>
            <p className={bodySmall}>Feature comparison across plans: trade import limits, journal entries, AI Copilot queries per month, team member slots, prop firm account limits, and export capabilities. All plans include a 14-day free trial with full feature access.</p>
          </div>
        </div>
      </div>

      {/* TEAMS */}
      <div id="teams">
        <div className={eyebrowStyle}>COLLABORATION</div>
        <h2 className="ref-h-section mt-2">Team Management</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Users className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Create or Join Trading Teams</div>
              <p className="text-sm text-[var(--qe-ref-text-muted)]">Settings → Teams lets you create a team (for prop firms, trading groups, or study groups) or accept invitations to join existing teams. As a team admin, you can: invite/remove members, set roles (admin, manager, member, viewer), configure shared dashboards, and view team-wide analytics. Each member retains their private journal — only shared data appears in the team view.</p>
              <Link href={`/${locale}/docs/teams`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Teams documentation →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div id="privacy">
        <div className={eyebrowStyle}>DATA</div>
        <h2 className="ref-h-section mt-2">Privacy & Data Controls</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Data Privacy</div>
            </div>
            <p className={bodySmall}>All data is encrypted at rest and in transit. Accounts are strictly scoped — no cross-account data access. Public profile and leaderboard participation are opt-in only. Delete your account and all associated data with a single request (30-day grace period for recovery).</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Data Export</div>
            </div>
            <p className={bodySmall}>Export all your data at any time: trades (CSV or Excel), journal entries (CSV/JSON), settings (JSON), and screenshots (ZIP). Request a full account archive from Settings → Account → Export Data. No lock-in, your data is always portable.</p>
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
        <div className="text-lg font-semibold tracking-tight">Configure your platform</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Every setting is designed to adapt Qunt Edge to your unique trading workflow.</p>
        <Link href={`/${locale}/docs/teams`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Teams <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/accounts`} className="underline underline-offset-2 hover:no-underline">Accounts</Link> • <Link href={`/${locale}/docs/dashboard`} className="underline underline-offset-2 hover:no-underline">Dashboard Themes</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Settings sync across all sessions and devices automatically.</div>
    </div>
  )
}
