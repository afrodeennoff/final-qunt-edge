'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Users, Shield, BarChart3, UserPlus, UserMinus, Settings, ArrowRight, Check,
  Award, Target, Eye, EyeOff, MessageCircle, TrendingUp, Activity,
  Crown, Sliders, ExternalLink
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsTeamsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Can traders in a team see each other's private journals?",
      a: "No — journal entries and individual trade notes are always private. The team dashboard only shows anonymized or aggregated performance data that each member has consented to share. Team admins can view aggregated risk metrics but never individual trade notes."
    },
    {
      q: "What is the difference between a team admin and a manager?",
      a: "Admins can: create/delete the team, manage all members, configure team settings, and access all team data. Managers can: invite/remove members, view team analytics, and create shared dashboards. Members can: view shared team data and participate in discussions. Viewers can: read-only access to team dashboards."
    },
    {
      q: "Can I be in multiple teams?",
      a: "Yes — you can join multiple teams. Each team has its own independent dashboard and member list. Your private journal is shared across all teams in the sense that you remain one trader, but each team only sees what you opt to share with that specific team."
    },
    {
      q: "Is there a limit on team size?",
      a: "Team size limits depend on your subscription plan. Free/Starter: 5 members. Pro: 20 members. Enterprise: Unlimited. Contact sales for custom team plans with dedicated support and custom onboarding."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>TEAMS</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Teams & Shared Workspaces</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Qunt Edge Teams transforms individual journals into a collaborative workspace. Built for prop firms, 
          trading funds, and serious trading groups — members keep private journals while sharing select 
          performance data, analytics, and compliance dashboards with the team.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/teams`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            My Teams <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/leaderboard`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Public Leaderboard
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Teams Overview', '#overview'],
            ['Creating a Team', '#create'],
            ['Member Management & Roles', '#members'],
            ['Team Dashboard & Analytics', '#dashboard'],
            ['Risk Monitoring', '#risk'],
            ['Privacy & Data Sharing', '#privacy'],
            ['Communication & Reviews', '#communication'],
            ['Use Cases: Prop Firms & Groups', '#usecases'],
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
        <h2 className="ref-h-section mt-2">Teams Overview</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Teams is a complete workspace layer on top of individual Qunt Edge accounts. Every member maintains 
          their private journal, tags, and Copilot access. Additionally, they contribute to the team's shared 
          analytics, compliance view, and leaderboard.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">TEAMS ARCHITECTURE</div>
          <svg viewBox="0 0 920 280" className="w-full h-auto max-h-[260px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="880" height="240" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Team circle */}
            <circle cx="460" cy="140" r="70" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.3)" strokeWidth="2" strokeDasharray="4 2" />
            <text x="460" y="130" fill="var(--qe-ref-green)" fontSize="12" textAnchor="middle" fontWeight="700">TEAM</text>
            <text x="460" y="150" fill="var(--qe-ref-text-muted)" fontSize="9" textAnchor="middle">Shared Dashboard</text>

            {/* Member 1 */}
            <circle cx="280" cy="100" r="36" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" />
            <text x="280" y="95" fill="#818cf8" fontSize="10" textAnchor="middle" fontWeight="600">Member</text>
            <text x="280" y="110" fill="var(--qe-ref-text-muted)" fontSize="8" textAnchor="middle">Private Journal</text>

            {/* Member 2 */}
            <circle cx="640" cy="100" r="36" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" />
            <text x="640" y="95" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="600">Member</text>
            <text x="640" y="110" fill="var(--qe-ref-text-muted)" fontSize="8" textAnchor="middle">Private Journal</text>

            {/* Member 3 */}
            <circle cx="200" cy="200" r="30" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.2)" />
            <text x="200" y="197" fill="var(--qe-ref-text)" fontSize="9" textAnchor="middle">Member</text>

            {/* Member 4 */}
            <circle cx="720" cy="200" r="30" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.2)" />
            <text x="720" y="197" fill="var(--qe-ref-text)" fontSize="9" textAnchor="middle">Member</text>

            {/* Arrows to team */}
            {[[280,100],[640,100],[200,200],[720,200]].map(([x,y]) => (
              <g key={`${x}-${y}`}>
                <line x1={x + (460 > x ? 25 : -25)} y1={y} x2={460 + (460 > x ? -25 : 25)} y2={y + (140 > y ? 15 : -15)}
                  stroke="rgba(0,255,159,0.2)" strokeWidth="1.5" />
              </g>
            ))}

            {/* Legend */}
            <rect x="50" y="240" width="8" height="8" rx="2" fill="rgba(99,102,241,0.5)" />
            <text x="65" y="248" fill="var(--qe-ref-text-muted)" fontSize="8">Private Journal</text>
            <rect x="180" y="240" width="8" height="8" rx="2" fill="rgba(0,255,159,0.5)" />
            <text x="195" y="248" fill="var(--qe-ref-text-muted)" fontSize="8">Shared Analytics</text>
          </svg>
        </div>
      </div>

      {/* CREATE */}
      <div id="create">
        <div className={eyebrowStyle}>SETUP</div>
        <h2 className="ref-h-section mt-2">Creating a Team</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Create from Scratch</div>
            </div>
            <p className={bodySmall}>Go to Settings → Teams → Create Team. Give your team a name, optional logo, and description. Choose your team type (Prop Firm, Trading Group, Study Group, or Custom). Configure default member permissions and privacy settings. Your team is created instantly and ready to accept members.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Invite Members</div>
            </div>
            <p className={bodySmall}>Invite members by email or share an invite link. Each invitation includes the team name and a message. Invited members accept from their dashboard. Pending invitations can be resent or revoked. New members start with Viewer permissions by default — admins adjust roles on acceptance.</p>
          </div>
        </div>
      </div>

      {/* MEMBERS */}
      <div id="members">
        <div className={eyebrowStyle}>ROLES</div>
        <h2 className="ref-h-section mt-2">Member Management & Roles</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Crown, name: "Admin", desc: "Full team control: create/delete, manage all members, configure settings, access all data", color: "text-[var(--qe-ref-green)]" },
            { icon: Settings, name: "Manager", desc: "Invite/remove members, view team analytics, create shared dashboards", color: "text-blue-400" },
            { icon: Activity, name: "Member", desc: "View shared team data, participate in discussions, contribute analytics", color: "text-amber-400" },
            { icon: Eye, name: "Viewer", desc: "Read-only access to team dashboards. No contribution of personal data", color: "text-gray-400" },
          ].map((r, i) => (
            <div key={i} className={cardMain}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-current/10 mb-3 ${r.color}`}>
                <r.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{r.name}</div>
              <p className={bodySmall + ' mt-2'}>{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Role-Based Access Matrix</div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full">
              <thead>
                <tr className="text-[var(--qe-ref-text-muted)] border-b border-[var(--qe-ref-card-border)]">
                  <th className="text-left py-2">Action</th>
                  <th className="text-center py-2">Admin</th>
                  <th className="text-center py-2">Manager</th>
                  <th className="text-center py-2">Member</th>
                  <th className="text-center py-2">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Manage Team Settings", "✓", "✓", "—", "—"],
                  ["Invite/Remove Members", "✓", "✓", "—", "—"],
                  ["View All Member Stats", "✓", "✓", "—", "—"],
                  ["View Team Dashboard", "✓", "✓", "✓", "✓"],
                  ["Contribute Personal Stats", "✓", "✓", "✓", "—"],
                  ["Create Shared Dashboards", "✓", "✓", "✓", "—"],
                  ["Export Team Data", "✓", "✓", "—", "—"],
                  ["Delete Team", "✓", "—", "—", "—"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--qe-ref-card-border)]">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-2 ${j === 0 ? 'text-left' : 'text-center'} ${cell === '✓' ? 'text-[var(--qe-ref-green)]' : 'text-[var(--qe-ref-text-muted)]'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div id="dashboard">
        <div className={eyebrowStyle}>ANALYTICS</div>
        <h2 className="ref-h-section mt-2">Team Dashboard & Analytics</h2>
        <div className="cardMain">
          <p className={bodySmall}>The team dashboard aggregates consented data from all members into a unified view. It is a curated subset of the same widget canvas technology powering personal dashboards:</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-xs">
            {[
              "Team P&L Leaderboard — rank members by performance within the team",
              "Aggregate equity curve — combined team performance over time",
              "Win rate distribution — histogram showing member win rates",
              "Risk heatmap — members approaching prop firm rule boundaries",
              "Consistency scoreboard — discipline and consistency tracking",
              "Trade volume stats — total team activity per day/week/month",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)] shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RISK */}
      <div id="risk">
        <div className={eyebrowStyle}>OVERSIGHT</div>
        <h2 className="ref-h-section mt-2">Risk Monitoring</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Manager Oversight</div>
            </div>
            <p className={bodySmall}>Team managers and admins have access to a risk dashboard showing all members' key compliance metrics: current drawdown, daily loss usage, consistency score, and approaching violations. Alerts can be configured for the entire team — manager gets notified when any member hits a risk threshold.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Configurable Risk Rules</div>
            </div>
            <p className={bodySmall}>Team admins can set custom risk rules that apply to all members: max daily loss, max position size, max trade frequency, or restricted instruments. Members get real-time warnings when they approach team limits. Violations are logged in the team audit trail.</p>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div id="privacy">
        <div className={eyebrowStyle}>DATA</div>
        <h2 className="ref-h-section mt-2">Privacy & Data Sharing</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><EyeOff className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Granular Sharing Controls</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Every member controls exactly what they share with the team. Default: P&L, win rate, and trade count are visible. Optional: equity curve, instrument preferences, and tags. Never shared: individual trade data, journal entries, emotions, screenshots, or account credentials. Change sharing preferences at any time without affecting your position on team dashboards.</p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNICATION */}
      <div id="communication">
        <div className={eyebrowStyle}>COLLABORATION</div>
        <h2 className="ref-h-section mt-2">Communication & Reviews</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Team Discussions</div>
            </div>
            <p className={bodySmall}>Each team has a discussion feed for async communication. Share insights, ask questions, or post trade reviews. Discussions are organized by thread and searchable. @mention members to draw their attention. Discussion visibility can be team-wide or restricted to managers.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Group Trade Reviews</div>
            </div>
            <p className={bodySmall}>Members can opt to share specific trades for group review (without sharing journal notes). The review thread shows the trade's chart, P&L, and tags — team members can comment and rate. A powerful learning tool for prop firm training programs.</p>
          </div>
        </div>
      </div>

      {/* USE CASES */}
      <div id="usecases">
        <div className={eyebrowStyle}>REAL WORLD</div>
        <h2 className="ref-h-section mt-2">Use Cases</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          {[
            "Prop Firms: Monitor trainee compliance. Track drawdown and rule adherence across all funded traders. Identify who needs coaching before they blow an account.",
            "Trading Groups: Compare performance anonymously. Rank members by P&L, win rate, and consistency. Use the leaderboard as friendly competition and accountability.",
            "Study Groups: Share trade reviews and strategies. Review each other's tagged setups. Discuss what works and what doesn't in a structured, data-backed environment.",
          ].map((u, i) => (
            <div key={i} className={cardNested}>
              <div className="text-[10px] text-[var(--qe-ref-green)] font-semibold tracking-widest mb-1">USE CASE {i+1}</div>
              {u}
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

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Build your trading team</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Private journals. Shared insights. Collective growth.</p>
        <Link href={`/${locale}/docs/playbook`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Strategy Playbook <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/leaderboard`} className="underline underline-offset-2 hover:no-underline">Leaderboard</Link> • <Link href={`/${locale}/docs/settings`} className="underline underline-offset-2 hover:no-underline">Settings</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Teams is used by prop firms, trading groups, and serious study circles to compound trading growth together.</div>
    </div>
  )
}
