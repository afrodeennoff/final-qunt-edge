'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  BookOpen, UserPlus, FileUp, LayoutDashboard, FileText, Sparkles,
  ArrowRight, Check, Clock, Target, Zap, Award, BarChart3,
  Brain, Mail, Lock
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function GettingStartedPage() {
  const locale = useCurrentLocale()
  const [openStep, setOpenStep] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = [
    {
      icon: UserPlus, title: "Create Your Account", time: "1 min",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>Visit the <Link href={`/${locale}/authentication`} className="text-[var(--qe-ref-green)] underline">sign-in page</Link> and enter your email address. If you don't have an account yet, one will be created automatically — no credit card required.</p>
          <p>Check your email for a one-time verification code. Enter it on the confirmation screen to complete registration. Alternatively, sign in with Google or Apple for one-click setup.</p>
          <p>Once verified, you land on a blank Dashboard ready for your first import. The 14-day free trial gives you full access to every feature.</p>
          <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs">
            <strong className="text-[var(--qe-ref-text)]">Tip:</strong> Use your trading email address (the one your broker knows) to keep everything organized.
          </div>
        </div>
      )
    },
    {
      icon: FileUp, title: "Import Your First Trades", time: "2 min",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>Navigate to the <strong>Import</strong> page from the sidebar. You have three options:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Auto-Sync:</strong> Connect Tradovate or Rithmic via API for real-time trade streaming.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>File Upload:</strong> Drag and drop your broker's trade export file (CSV, PDF, XML).</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Manual Entry:</strong> Add trades one by one through the trade entry form.</div>
          </div>
          <p>For your first import, we recommend using a CSV export from your broker. The system auto-detects columns and shows a preview before saving. Duplicates are automatically detected and skipped.</p>
          <Link href={`/${locale}/docs/import`} className="inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full import documentation →</Link>
        </div>
      )
    },
    {
      icon: LayoutDashboard, title: "Explore Your Dashboard", time: "3 min",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>Once trades are imported, visit the <strong>Dashboard</strong>. You'll see the default widget layout: cumulative P&L, win rate, equity curve, P&L calendar, and statistics.</p>
          <p>Try these actions to orient yourself:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> Click the <strong>filter bar</strong> at the top — select "Last 30 days" and watch every widget re-compute.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> Click the <strong>Customize</strong> icon (grid button) to enter layout editing mode.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> Drag a widget to a new position. Resize it using the size selector at the bottom.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> Click <strong>+ Add Widget</strong> to browse the full widget catalogue.</div>
          </div>
          <Link href={`/${locale}/docs/dashboard`} className="inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Dashboard documentation →</Link>
        </div>
      )
    },
    {
      icon: FileText, title: "Journal Your First Trade", time: "2 min",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>Open the <strong>Trade Log</strong> from the sidebar and click any trade row. The journal editor opens as a side panel.</p>
          <p>Write your first journal entry:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Pre-Trade Notes:</strong> What was your plan? Why did you enter this trade?</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Post-Trade Review:</strong> What happened? Rate your discipline 1-10.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Emotion:</strong> Select how you felt during the trade.</div>
            <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> <strong>Tags:</strong> Add a setup tag like "breakout" or "reversal."</div>
          </div>
          <p>That's it. One journaled trade is all it takes to start feeding the Copilot.</p>
          <Link href={`/${locale}/docs/journal`} className="inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Journal documentation →</Link>
        </div>
      )
    },
    {
      icon: Sparkles, title: "Meet Your AI Copilot", time: "1 min",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>Open the <strong>Copilot</strong> chat widget on the Dashboard (or navigate to the Analytics page). Ask your first question:</p>
          <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs italic text-[var(--qe-ref-text-muted)]">
            "What does my trading data say about me?"
          </div>
          <p>The Copilot scans your trade history and journal entries to produce personalized observations. Try follow-up questions about specific instruments, time periods, or patterns you're curious about.</p>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {["Show me my best day of the week", "Which setup has the best win rate?", "How is my risk management?", "What should I improve?"].map(q => (
              <span key={q} className="rounded bg-[var(--qe-ref-surface-2)] px-2 py-1 text-[var(--qe-ref-text-muted)]">"{q}"</span>
            ))}
          </div>
          <Link href={`/${locale}/docs/analytics`} className="inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Full Analytics & Copilot documentation →</Link>
        </div>
      )
    },
    {
      icon: Brain, title: "Build Your Review Loop", time: "Ongoing",
      detail: (
        <div className="space-y-2 text-sm text-[var(--qe-ref-text-muted)]">
          <p>The real power of Qunt Edge comes from the daily review habit. Here is the recommended loop:</p>
          <div className="grid gap-2 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
              <div className="font-semibold text-[var(--qe-ref-green)] mb-1">CAPTURE</div>
              Write pre-trade notes before entry. Import trades automatically. Add screenshots and tags.
            </div>
            <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
              <div className="font-semibold text-[var(--qe-ref-green)] mb-1">REVIEW</div>
              Open the Dashboard. Check your P&L calendar. Read Copilot insights. Journal post-trade notes.
            </div>
            <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
              <div className="font-semibold text-[var(--qe-ref-green)] mb-1">ACT</div>
              Read the weekly AI debrief. Adjust your rules. Set intentions for next week. Compound your edge.
            </div>
          </div>
          <p>Most traders spend 5-10 minutes per day on this loop. The Copilot handles the analysis; you focus on the decisions.</p>
        </div>
      )
    },
  ]

  const faqs = [
    {
      q: "Do I need to have trading experience to use Qunt Edge?",
      a: "The platform is designed for active traders who already have trade history to review. If you are new to trading, start with paper trading and use the manual entry feature to log your simulated trades. The journaling habit is worth building from day one."
    },
    {
      q: "Can I try before committing to a paid plan?",
      a: "Yes — every new account gets a 14-day free trial with full access to all features. No credit card required to start. At the end of the trial, you choose a plan or your account converts to a limited free tier."
    },
    {
      q: "Is my data safe during the trial?",
      a: "Yes — all security measures apply from day one: encryption at rest and in transit, account scoping, and strict access controls. If you decide not to continue, export your data or delete your account permanently."
    },
    {
      q: "How do I get help if I'm stuck?",
      a: "Use the in-app support chat (bottom-right), email support@quntedge.com, or join the Discord community. We are traders ourselves and answer fast — usually within a few hours during trading hours."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>GETTING STARTED</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Quick Start Guide</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          From zero to your first AI-powered trade review in under 10 minutes. Follow these steps and you will 
          have imported trades, a customized dashboard, and personalized Copilot insights before your coffee break is over.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--qe-ref-text-muted)]">
          <Clock className="h-3.5 w-3.5" /> Estimated time: 10 minutes &nbsp;•&nbsp; <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> No credit card required
        </div>
      </div>

      {/* WHAT YOU NEED */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>PREREQUISITES</div>
        <h2 className="ref-h-section mt-2">What You'll Need</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
          {[
            { icon: Mail, title: "Email Address", desc: "Any email — sign up in 30 seconds with one-time code verification" },
            { icon: BarChart3, title: "Trade Data", desc: "A trade export from your broker (CSV/PDF) or a broker with API support" },
            { icon: Target, title: "10 Minutes", desc: "That's all it takes to go from sign-up to your first AI insight" },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <p.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-[var(--qe-ref-text)]">{p.title}</div>
                <div className="text-[var(--qe-ref-text-muted)]">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP-BY-STEP */}
      <div>
        <div className={eyebrowStyle}>THE PATH</div>
        <h2 className="ref-h-section mt-2">Step-by-Step Setup</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Follow these steps in order. Each step takes 1-3 minutes and builds on the previous one.
        </p>

        <div className="mt-6 space-y-3">
          {steps.map((step, idx) => (
            <details key={idx} open={openStep === idx} onToggle={() => setOpenStep(openStep === idx ? null : idx)} className="group rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                    <step.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight">{step.title}</div>
                    <div className="text-[11px] text-[var(--qe-ref-text-muted)]">{step.time}</div>
                  </div>
                </div>
                <span className="text-[var(--qe-ref-text-muted)] group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-5 pb-5 border-t border-[var(--qe-ref-card-border)] pt-4">
                {step.detail}
              </div>
            </details>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="mt-6 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">SETUP FLOW</div>
          <svg viewBox="0 0 780 70" className="w-full max-w-[720px] mx-auto">
            {[
              { x: 10, label: "Sign Up", c: "rgba(0,255,159,0.1)" },
              { x: 160, label: "Import Trades", c: "rgba(0,255,159,0.1)" },
              { x: 310, label: "Explore Dashboard", c: "rgba(0,255,159,0.1)" },
              { x: 460, label: "Journal a Trade", c: "rgba(0,255,159,0.15)" },
              { x: 610, label: "Ask Copilot", c: "rgba(0,255,159,0.15)" },
            ].map((s, i) => (
              <g key={i}>
                <rect x={s.x} y="20" width="130" height="34" rx="6" fill={s.c} stroke="rgba(0,255,159,0.25)" />
                <text x={s.x + 65} y="42" fill="var(--qe-ref-text)" fontSize="11" textAnchor="middle">{s.label}</text>
                {i < 4 && (
                  <>
                    <line x1={s.x + 135} y1="37" x2={s.x + 155} y2="37" stroke="var(--qe-ref-green)" strokeWidth="2" />
                    <polygon points={`${s.x + 155},37 ${s.x + 147},32 ${s.x + 147},42`} fill="var(--qe-ref-green)" />
                  </>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* NEXT STEPS */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>NEXT STEPS</div>
        <h2 className="ref-h-section mt-2">Where to Go From Here</h2>
        <p className="ref-body mt-2 text-[var(--qe-ref-text-muted)]">You have completed the basic setup. Here is what to explore next:</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {[
            { href: "dashboard", label: "Widget Canvas", desc: "Customize your layout with 25+ widgets" },
            { href: "trade-log", label: "Trade Log", desc: "Filter, tag, and edit your complete trade history" },
            { href: "journal", label: "Journal Deep Dive", desc: "Build a structured journaling habit" },
            { href: "analytics", label: "Copilot & Analytics", desc: "Unlock AI-powered trading insights" },
            { href: "propfirms", label: "Prop Firms", desc: "Track challenges and funded accounts" },
            { href: "teams", label: "Teams", desc: "Collaborate with your trading group" },
            { href: "playbook", label: "Playbook", desc: "Build and track your trading strategies" },
            { href: "behavior", label: "Behavioral Analysis", desc: "Track mindset and emotional patterns" },
          ].map((link, i) => (
            <Link key={i} href={`/${locale}/docs/${link.href}`} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2.5 hover:bg-[var(--qe-ref-green)]/5 transition-colors">
              <ArrowRight className="h-3 w-3 text-[var(--qe-ref-green)] shrink-0" />
              <div><div className="font-medium text-[var(--qe-ref-text)]">{link.label}</div><div className="text-[var(--qe-ref-text-muted)]">{link.desc}</div></div>
            </Link>
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
        <div className="text-lg font-semibold tracking-tight">Ready to build your edge?</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Your first AI debrief is 10 minutes away.</p>
        <Link href={`/${locale}/authentication`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Create Free Account <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Next: <Link href={`/${locale}/docs/dashboard`} className="underline underline-offset-2 hover:no-underline">Widget Canvas & Dashboard</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Complete this guide once and you will have a working, personalized trading review system.</div>
    </div>
  )
}
