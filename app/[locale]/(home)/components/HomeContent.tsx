'use client'

import React from 'react'
import Link from 'next/link'

// Complete 1:1 rebuild of the homepage to match the Velocity Funds aesthetic
// using only Qunt Edge content and branding.

export default function VelocityStyleHome() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 font-sans">
      {/* NAV - Matching Velocity style */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Qunt Edge
            </Link>

            <div className="hidden items-center gap-7 text-sm md:flex">
              <div className="group relative">
                <button className="flex items-center gap-1 text-white/80 hover:text-white">
                  The Lab <span className="text-[10px]">▼</span>
                </button>
                <div className="absolute left-0 mt-2 hidden w-56 rounded-xl border border-white/10 bg-[#111] py-2 text-sm shadow-xl group-hover:block">
                  <Link href="/analytics" className="block px-4 py-2 hover:bg-white/5">Analytics</Link>
                  <Link href="/propfirms" className="block px-4 py-2 hover:bg-white/5">Prop Firm Intelligence</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-white/5">Trade Journal</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-white/5">Risk Engine</Link>
                </div>
              </div>
              <Link href="/pricing" className="text-white/80 hover:text-white">Pricing</Link>
              <Link href="/propfirms" className="text-white/80 hover:text-white">Prop Firms</Link>
              <Link href="/faq" className="text-white/80 hover:text-white">FAQ</Link>
              <Link href="/about" className="text-white/80 hover:text-white">About</Link>
              <a href="https://discord.gg/quntedge" target="_blank" className="text-white/80 hover:text-white">Discord</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/authentication"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Enter the Lab
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO - Exact Velocity structure */}
      <section className="border-b border-white/10 pt-20 pb-16">
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <div className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs tracking-[2px] text-white/60 mb-6">
            LIVE • AI-POWERED TRADING ANALYTICS
          </div>

          <h1 className="text-[58px] leading-[1.02] font-semibold tracking-[-2.2px] md:text-[72px]">
            Advanced Trading Analytics.<br />Built to give you the real edge.
          </h1>

          <p className="mx-auto mt-6 max-w-[580px] text-[17px] leading-tight text-white/70">
            Connect every broker. Analyze every trade. Beat every prop firm. 
            The first platform with proprietary intelligence that actually accelerates your edge. Live, on every trade.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link 
              href="/authentication" 
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90"
            >
              Get Started Free
            </Link>
            <Link 
              href="#intelligence" 
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-6 text-base hover:bg-white/5"
            >
              See the Intelligence →
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/60">
            <div>Free to start</div>
            <div>Multi-broker sync</div>
            <div>Prop firm intelligence</div>
            <div>Daily AI insights</div>
          </div>
        </div>
      </section>

      {/* EVERY PLATFORM GIVES YOU DATA. WE GIVE YOU INTELLIGENCE. */}
      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="max-w-[720px]">
            <h2 className="text-5xl font-semibold tracking-[-1.2px] leading-[1.05]">
              Every platform gives you data.<br />We give you intelligence.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* 01 OBSERVE */}
            <div>
              <div className="text-xs tracking-[3px] text-white/50">01 OBSERVE</div>
              <div className="mt-3 text-2xl font-semibold">Performance Intelligence</div>
              <p className="mt-3 text-white/70">
                See exactly where you win and lose across all your brokers and accounts. 
                Brutal clarity before you place the next trade.
              </p>
            </div>

            {/* 02 PROTECT */}
            <div>
              <div className="text-xs tracking-[3px] text-white/50">02 PROTECT</div>
              <div className="mt-3 text-2xl font-semibold">Risk &amp; Rule Intelligence</div>
              <p className="mt-3 text-white/70">
                Know your real risk profile and how close you are to blowing prop firm rules in real time. 
                Stop guessing.
              </p>
            </div>

            {/* 03 EVOLVE */}
            <div>
              <div className="text-xs tracking-[3px] text-white/50">03 EVOLVE</div>
              <div className="mt-3 text-2xl font-semibold">Daily Performance Debriefs</div>
              <p className="mt-3 text-white/70">
                Every session ends with a clear AI breakdown of what happened and why. 
                The edge that compounds over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUNT PULSE™ - Matching VI Pulse style */}
      <section id="intelligence" className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-10">
            <div className="text-xs tracking-[3px] text-white/50">QUNT PULSE™</div>
            <h3 className="mt-2 text-5xl font-semibold tracking-[-1.2px]">AI-Powered Performance Scoring</h3>
            <p className="mt-3 max-w-md text-lg text-white/70">
              See yourself the way a professional risk desk sees you. Every trade scored. Every pattern exposed.
            </p>
          </div>

          {/* Mock Pulse Dashboard */}
          <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm text-white/60">Overall Pulse Score</div>
                <div className="text-[72px] font-semibold tabular-nums leading-none tracking-[-3px]">84</div>
                <div className="text-emerald-400">Elite</div>
              </div>
              <div className="text-right text-sm text-white/60">
                Last 30 days • 187 trades
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: 'Psychology', score: '89', tier: 'Elite' },
                { label: 'Plan Adherence', score: '76', tier: 'Strong' },
                { label: 'Risk Management', score: '91', tier: 'Elite' },
                { label: 'Execution', score: '71', tier: 'Good' },
                { label: 'Consistency', score: '82', tier: 'Strong' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                  <div className="text-xs text-white/50">{item.label}</div>
                  <div className="mt-2 text-4xl font-semibold tabular-nums">{item.score}</div>
                  <div className="mt-1 text-xs text-emerald-400">{item.tier}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUNT DEBRIEF™ */}
      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-10">
            <div className="text-xs tracking-[3px] text-white/50">QUNT DEBRIEF™</div>
            <h3 className="mt-2 text-5xl font-semibold tracking-[-1.2px]">AI-Powered Daily Review</h3>
            <p className="mt-3 max-w-md text-lg text-white/70">
              Every trading day ends with a debrief you can’t ignore. Your PnL calendar shows why.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
              <div className="text-sm text-white/60">Today’s Score</div>
              <div className="text-[64px] font-semibold tracking-tight">67</div>
              <div className="text-amber-400">Solid</div>

              <div className="mt-8 text-sm text-white/80">
                Strong risk management on NQ. You respected your max loss limit. 
                Consider tightening entries during the first 15 minutes of the session.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
              <div className="mb-4 text-sm text-white/60">AI Pattern Detected</div>
              <div className="text-lg leading-tight">
                Your win rate improves <span className="font-semibold text-emerald-400">27%</span> when you wait for the first 15-minute candle to close before entering.
              </div>
              <div className="mt-6 text-xs text-white/50">Confirmed across 142 sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUNT SENTINEL™ */}
      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-10">
            <div className="text-xs tracking-[3px] text-white/50">QUNT SENTINEL™</div>
            <h3 className="mt-2 text-5xl font-semibold tracking-[-1.2px]">Real-time Risk Intelligence</h3>
            <p className="mt-3 max-w-md text-lg text-white/70">
              Rules that learn your patterns. Know your compliance before you break prop firm limits.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60">Today’s Compliance</div>
                <div className="text-[64px] font-semibold tabular-nums tracking-[-2px]">100</div>
                <div className="text-emerald-400">/ 100</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Active Rules</div>
                <div className="text-2xl font-medium">7</div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Daily loss limit guard active",
                "Max contracts per session: 6",
                "No trading after 3:30pm rule engaged",
                "Cooldown after 3 consecutive losses"
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 px-5 py-3 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY QUNT EDGE */}
      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <h3 className="text-5xl font-semibold tracking-[-1.2px]">Your edge. Amplified.</h3>

          <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {[
              { title: "Zero Friction", desc: "Connect any broker in under 60 seconds. No CSV hell. No manual work." },
              { title: "Real Intelligence", desc: "AI built for traders who want to improve, not for catching you breaking rules." },
              { title: "Honest Tools", desc: "Clear data. No fake win rates. No moving goalposts. Just the truth." },
              { title: "Prop Firm Edge", desc: "Compare every prop firm with real trader data and performance metrics." },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-xl font-semibold">{item.title}</div>
                <p className="mt-2 text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE QUNT LAB */}
      <section className="border-b border-white/10 py-20">
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <div className="text-xs tracking-[3px] text-white/50">THE QUNT LAB</div>
          <h3 className="mt-3 text-5xl font-semibold tracking-[-1.2px]">Engineered for serious traders.</h3>
          <p className="mt-4 text-white/70">The tools you already trust, now with real intelligence on top.</p>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-white/60">
            <div>TradingView</div>
            <div>NinjaTrader</div>
            <div>Tradovate</div>
            <div>Rithmic</div>
            <div>Quantower</div>
            <div>DeepCharts</div>
            <div className="text-white/40">+ 12 more</div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-[700px] px-6">
          <h2 className="text-5xl font-semibold tracking-[-1.3px]">Ready to trade with a real edge?</h2>
          <p className="mt-4 text-xl text-white/70">Qunt Edge Intelligence is waiting.</p>

          <Link 
            href="/authentication"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-10 text-base font-medium text-black hover:bg-white/90"
          >
            Enter the Lab
          </Link>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Qunt Edge. All rights reserved.
      </footer>
    </div>
  )
}

