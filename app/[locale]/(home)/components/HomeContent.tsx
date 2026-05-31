'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Star,
  Zap,
  Brain,
  Shield,
  BarChart3,
  Target,
  Clock,
  Award,
  Lock,
  Globe,
  Users,
  Cpu,
  MessageCircle,
  Plus,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCurrentLocale } from '@/locales/client'
import HeroProductPreview from './HeroProductPreview'
import AIHubVisual from './AIHubVisual'

const HOME_WIDTH = 'mx-auto w-full max-w-[1100px] px-6'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingSection = 'ref-h-section'
const bodyDefault = 'ref-body'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function HomeContent() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  return (
    <div className="qe-home-ref flex flex-col overflow-x-hidden bg-[var(--qe-ref-surface)] text-[var(--qe-ref-text)]">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO (Reference: badge + headline + CTAs + dashboard mockup)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left column — text + CTAs */}
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-[var(--qe-ref-text-muted)]">
                AI-POWERED TRADING JOURNAL PLATFORM
              </div>

              <h1 className="ref-h-display mt-6">
                The Trading Journal for Traders<br />Who Demand an Edge
              </h1>

              <p className="ref-body mt-5 max-w-[42ch]">
                Professional trading journal with AI debriefs, execution audits, and prop firm compliance tools. Review every decision. Build lasting edge.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/${locale}/authentication`} className="ref-cta-primary">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#features" className="ref-cta-secondary">
                  Learn More
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[var(--qe-ref-text-muted)]">
                {['Pre & post trade notes', 'AI pattern detection', '17+ custom tags', 'Prop firm compliance', 'Screenshot analysis'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — live product preview */}
            <div className="relative -mx-2 lg:mx-0">
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: POWERFUL FEATURES (Reference: 2x2 grid with stat cards)
         ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
           <div className="text-center mb-10">
             <div className={eyebrowStyle}>POWERFUL TRADING JOURNAL + AI FEATURES</div>
             <h2 className="ref-h-section mt-3">Professional Trading Journal with AI Intelligence</h2>
             <p className="ref-body mt-3 max-w-lg mx-auto">
               Log every trade, audit execution quality, and turn data into lasting edge with AI debriefs, analytics, and prop firm tools.
             </p>
           </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {/* Card 1: Multi-Asset Power */}
             <div className={cardMain}>
               <div className="flex items-start justify-between">
                 <div>
                   <h3 className={headingCard}>Multi-Asset Journal: One Workspace for All Trades.</h3>
                   <p className={cn(bodySmall, 'mt-2')}>
                     Capture futures, forex, crypto, and equities in a single professional trading journal with complete execution history and review tools.
                   </p>
                 </div>
               </div>
               <div className="mt-4 grid grid-cols-2 gap-3">
                 <div className={cardNested}>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                       <Cpu className="h-4 w-4" />
                     </div>
                     <div>
                       <div className="text-[10px] text-[var(--qe-ref-text-muted)]">NQ Futures</div>
                       <div className="text-sm font-semibold tabular-nums">Win Rate 68%</div>
                     </div>
                   </div>
                   <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                     47 NQ trades reviewed this month. Detailed notes on entry timing, rule adherence, and AI-detected patterns.
                   </p>
                 </div>
                 <div className={cardNested}>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                       <Globe className="h-4 w-4" />
                     </div>
                     <div>
                       <div className="text-[10px] text-[var(--qe-ref-text-muted)]">ES Futures</div>
                       <div className="text-sm font-semibold tabular-nums">Profit Factor 1.9</div>
                     </div>
                   </div>
                   <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                     32 ES sessions logged with full behavioral analysis, risk drift flags, and post-trade debrief notes.
                   </p>
                 </div>
               </div>
             </div>

            {/* Card 2: 24/7 Customer Support */}
             <div className={cardMain}>
               <h3 className={headingCard}>AI-Powered Debriefs 24/7</h3>
               <p className={cn(bodySmall, 'mt-2')}>
                 Get instant AI session debriefs, behavior analysis, and actionable insights anytime from your trading journal.
               </p>
               <div className="mt-4 flex items-center justify-center py-6">
                 <div className="relative h-32 w-40">
                   {/* Support visualization - connected nodes */}
                   <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 128" fill="none">
                     <circle cx="80" cy="64" r="36" stroke="rgba(0,255,159,0.15)" strokeWidth="1" />
                     <circle cx="80" cy="28" r="14" stroke="rgba(0,255,159,0.25)" strokeWidth="1" fill="rgba(0,255,159,0.08)" />
                     <circle cx="124" cy="50" r="14" stroke="rgba(0,255,159,0.25)" strokeWidth="1" fill="rgba(0,255,159,0.08)" />
                     <circle cx="124" cy="90" r="14" stroke="rgba(0,255,159,0.25)" strokeWidth="1" fill="rgba(0,255,159,0.08)" />
                     <circle cx="36" cy="90" r="14" stroke="rgba(0,255,159,0.25)" strokeWidth="1" fill="rgba(0,255,159,0.08)" />
                     <circle cx="36" cy="50" r="14" stroke="rgba(0,255,159,0.25)" strokeWidth="1" fill="rgba(0,255,159,0.08)" />
                     <line x1="80" y1="42" x2="80" y2="28" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <line x1="104" y1="54" x2="110" y2="50" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <line x1="104" y1="86" x2="110" y2="90" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <line x1="56" y1="86" x2="50" y2="90" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <line x1="56" y1="54" x2="50" y2="50" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <circle cx="80" cy="28" r="3" fill="#00ff9f" />
                     <circle cx="124" cy="50" r="3" fill="#00ff9f" />
                     <circle cx="124" cy="90" r="3" fill="#00ff9f" />
                     <circle cx="36" cy="90" r="3" fill="#00ff9f" />
                     <circle cx="36" cy="50" r="3" fill="#00ff9f" />
                   </svg>
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qe-ref-green)]/30 bg-[var(--qe-ref-surface-2)]">
                     <MessageCircle className="h-4 w-4 text-[var(--qe-ref-green)]" />
                   </div>
                 </div>
               </div>
             </div>

            {/* Card 3: Solana stats */}
             <div className={cardMain}>
               <div className="flex items-start justify-between">
                 <div>
                   <h3 className={headingCard}>Advanced Analytics Widgets</h3>
                   <p className={cn(bodySmall, 'mt-2')}>
                     Heatmaps, decile analysis, and custom metrics turn every trade into clear, actionable review insights.
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] text-[var(--e-ref-text-muted)]">Win Rate</div>
                   <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">74%</div>
                 </div>
               </div>
             </div>

            {/* Card 4: Polkadot + 2FA */}
             <div className={cardMain}>
               <div className="flex items-start justify-between">
                 <div>
                   <h3 className={headingCard}>Prop Firm Compliance Tools</h3>
                   <p className={cn(bodySmall, 'mt-2')}>
                     Drawdown tracking, rule adherence monitoring, and payout-ready reports for funded prop firm accounts.
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] text-[var(--e-ref-text-muted)]">Compliance</div>
                   <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">98%</div>
                 </div>
               </div>
             </div>
          </div>

          {/* Two-Factor Authentication card (full width below) */}
           <div className={cardMain} style={{ marginTop: '16px' }}>
             <h3 className={headingCard}>Enterprise-Grade Security</h3>
             <p className={cn(bodySmall, 'mt-2', 'max-w-[600px]')}>
               Bank-level encryption and SOC2 compliance protect your trading journal data, review history, and performance records.
             </p>
             <div className="mt-4 flex items-center gap-6">
               <div className="flex flex-col items-center gap-2">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)]">
                   <Shield className="h-6 w-6 text-[var(--qe-ref-green)]" />
                 </div>
                 <span className="text-[11px] text-[var(--qe-ref-text-muted)]">Time-based<br/>one-time password</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)]">
                   <Lock className="h-6 w-6 text-[var(--qe-ref-text-muted)]" />
                 </div>
                 <span className="text-[11px] text-[var(--qe-ref-text-muted)]">End-to-end<br/>encrypted storage</span>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: ADVANCED TRADING (Reference: left accordion + right circular diagram)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Accordion feature list */}
             <div>
               <div className={eyebrowStyle}>ADVANCED INTELLIGENCE</div>
               <h2 className="ref-h-section mt-3">Advanced Trading Journal Intelligence</h2>
               <p className="ref-body mt-4 max-w-[42ch]">
                 AI-powered review engine turns every session into clear debriefs, drift detection, and actionable coaching notes for lasting edge.
               </p>

               <div className="mt-8 space-y-3">
                 {[
                   {
                     title: 'Real-Time Execution Review',
                     desc: 'Live review of fills, timing, and rule adherence with instant AI flags and drift alerts.',
                   },
                   {
                     title: 'AI Debrief Engine',
                     desc: 'Structured post-session debriefs generated in seconds from your full trade record and notes.',
                   },
                   {
                     title: 'Personalized Review Dashboard',
                     desc: 'Custom widgets and layouts tailored to your trading style and weekly improvement goals.',
                   },
                 ].map((item, idx) => (
                   <button
                     key={idx}
                     onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                     className="flex w-full items-center justify-between rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-5 py-4 text-left transition-colors hover:border-[var(--qe-ref-green)]/30"
                   >
                     <div className="flex items-center gap-3">
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                         {idx === 0 ? <Brain className="h-4 w-4" /> : idx === 1 ? <Zap className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                       </div>
                       <div>
                         <div className="font-medium tracking-[-0.01em] text-[14px]">{item.title}</div>
                         {openAccordion === idx && (
                           <p className="mt-1 text-[12px] leading-relaxed text-[var(--qe-ref-text-muted)]">{item.desc}</p>
                         )}
                       </div>
                     </div>
                     <ChevronDown className={cn('h-4 w-4 text-[var(--qe-ref-text-muted)] transition-transform duration-200', openAccordion === idx && 'rotate-180')} />
                   </button>
                 ))}
               </div>

               <Link href={`/${locale}/authentication`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-6 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90">
                 Try Now
               </Link>
             </div>

            {/* Right: Circular AI Hub diagram */}
            <div className="flex justify-center">
              <AIHubVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: HOW IT WORKS (Reference: 3 process cards with diagrams)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
           <div className="text-center mb-10">
             <div className={eyebrowStyle}>HOW THE TRADING JOURNAL WORKS</div>
             <h2 className="ref-h-section mt-3">How the Trading Journal Builds Edge</h2>
             <p className="ref-body mt-3 max-w-lg mx-auto">
               Capture every fill and note, review the full session with AI, then turn findings into concrete next actions.
             </p>
           </div>

           <div className="grid gap-5 md:grid-cols-3">
             {/* Card 1: Trade Capture & Review */}
             <div className={cardMain}>
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                 <Cpu className="h-5 w-5" />
               </div>
               <h3 className={cn(headingCard, 'mt-4')}>Trade Capture & Review</h3>
               <div className="mt-4 space-y-2">
                 {['Capture', 'Review', 'Flag'].map((step, i) => (
                   <div key={i} className="flex items-center gap-3 rounded-lg bg-[var(--qe-ref-surface-2)] px-3 py-2">
                     <div className={cn('h-2 w-2 rounded-full', i === 0 ? 'bg-[var(--qe-ref-green)]' : i === 1 ? 'bg-blue-400' : 'bg-amber-400')} />
                     <span className="text-[13px]">{step}</span>
                   </div>
                 ))}
               </div>
               <p className={cn(bodySmall, 'mt-4')}>
                 Import broker data and journal notes. AI surfaces timing, sizing, and rule breaks for immediate review.
               </p>
             </div>

             {/* Card 2: Risk & Drift Analysis */}
             <div className={cardMain}>
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                 <Shield className="h-5 w-5" />
               </div>
               <h3 className={cn(headingCard, 'mt-4')}>Risk & Drift Analysis</h3>
               <div className="mt-4 space-y-1.5">
                 {[
                   { label: 'Aug', value: '18', sub: '$94,000.00' },
                   { label: '', value: '19', sub: '$103,000.00' },
                   { label: '', value: '20', sub: '$89,500.00' },
                   { label: '', value: '31', sub: '$126,300.00' },
                 ].map((row, i) => (
                   <div key={i} className="flex items-center justify-between rounded-md bg-[var(--qe-ref-surface-2)] px-3 py-1.5 text-[11px]">
                     <span className="text-[var(--e-ref-text-muted)]">{row.label || `Day ${i + 1}`}</span>
                     <span className="font-semibold tabular-nums">{row.value}</span>
                     <span className="text-[var(--e-ref-text-muted)] tabular-nums">{row.sub}</span>
                   </div>
                 ))}
               </div>
               <p className={cn(bodySmall, 'mt-4')}>
                 Every session is scored for risk adherence, behavior drift, and execution quality against your rules.
               </p>
             </div>

             {/* Card 3: AI Debrief & Action */}
             <div className={cardMain}>
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                 <Zap className="h-5 w-5" />
               </div>
               <h3 className={cn(headingCard, 'mt-4')}>AI Debrief & Action</h3>
               <div className="mt-4 flex items-end gap-1 h-20">
                 {Array.from({ length: 20 }).map((_, i) => {
                   const height = [30, 45, 25, 55, 35, 60, 40, 70, 50, 38, 65, 48, 72, 42, 58, 35, 52, 68, 44, 55][i] || 40
                   return (
                     <div key={i} className="flex-1 mx-[1px] rounded-t-sm bg-[var(--qe-ref-green)]/20" style={{ height: `${height}%` }} />
                   )
                 })}
               </div>
               <p className={cn(bodySmall, 'mt-4')}>
                 When review is complete, the journal generates a concise debrief with specific, actionable improvement steps.
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: WHY MILLIONS TRUST OUR AI (Reference: 3 pillar cards)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
           <div className="text-center mb-10">
             <div className={eyebrowStyle}>WHY TRADERS TRUST THE TRADING JOURNAL</div>
             <h2 className="ref-h-section mt-3">Why Traders Choose Qunt Edge</h2>
             <p className="ref-body mt-3 max-w-lg mx-auto">
               Serious traders use the journal to audit every decision, eliminate behavior drift, and build measurable, repeatable edge.
             </p>
           </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Enterprise-Grade Security */}
            <div className={cardMain}>
              <h3 className={headingCard}>Enterprise-Grade Security</h3>
              <div className="mt-4 flex items-center justify-center py-6">
                <div className="relative h-36 w-full max-w-[200px]">
                  <svg viewBox="0 0 200 140" className="w-full h-full">
                    {/* Security flow diagram */}
                    <rect x="70" y="10" width="60" height="36" rx="8" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <text x="100" y="33" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">Secure Data</text>

                    <rect x="20" y="65" width="56" height="30" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                    <text x="48" y="84" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Encrypted</text>

                    <rect x="124" y="65" width="56" height="30" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                    <text x="152" y="84" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Access Control</text>

                    <rect x="50" y="105" width="100" height="28" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                    <text x="100" y="123" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">Zero-Knowledge Vault</text>

                    <line x1="100" y1="46" x2="48" y2="65" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                    <line x1="100" y1="46" x2="152" y2="65" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                    <line x1="48" y1="95" x2="85" y2="105" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                    <line x1="152" y1="95" x2="115" y2="105" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Verified Performance */}
             <div className={cardMain}>
               <h3 className={headingCard}>Verified Execution Quality</h3>
               <div className="mt-4 flex items-center justify-center py-6">
                 <div className="relative h-36 w-full max-w-[200px]">
                   <svg viewBox="0 0 200 140" className="w-full h-full">
                     {/* Performance chart diagram */}
                     <rect x="30" y="20" width="60" height="50" rx="8" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                     <text x="60" y="40" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Backtested</text>
                     <text x="60" y="52" textAnchor="middle" fill="var(--qe-ref-green)" fontSize="10" fontWeight="700">98.2%</text>

                     <rect x="110" y="20" width="60" height="50" rx="8" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                     <text x="140" y="40" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">High</text>
                     <text x="140" y="52" textAnchor="middle" fill="var(--qe-ref-green)" fontSize="10" fontWeight="700">Win Rate</text>

                     <rect x="30" y="85" width="60" height="40" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <text x="60" y="109" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Low Draw</text>

                     <rect x="110" y="85" width="60" height="40" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                     <text x="140" y="109" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Fast Exec</text>

                     <path d="M60 70 L60 85 M140 70 L140 85 M60 125 L100 135 M140 125 L100 135" stroke="rgba(0,255,159,0.3)" strokeWidth="1" markerEnd="url(#arrowhead)" />
                   </svg>
                 </div>
               </div>
               <div className="text-center">
                 <Link href={`/${locale}/authentication`} className="inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-5 py-2 text-[12px] font-semibold text-black hover:opacity-90">
                   See the Review Loop
                 </Link>
               </div>
             </div>

            {/* Transparent System */}
            <div className={cardMain}>
              <h3 className={headingCard}>Transparent System</h3>
              <div className="mt-4 flex items-center justify-center py-6">
                <div className="relative h-36 w-full max-w-[200px]">
                  <svg viewBox="0 0 200 140" className="w-full h-full">
                    {/* Transparency flow diagram */}
                    <circle cx="50" cy="35" r="18" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <text x="50" y="39" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Open API</text>

                    <circle cx="150" cy="35" r="18" fill="rgba(0,255,159,0.08)" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <text x="150" y="39" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Audit Logs</text>

                    <rect x="25" y="75" width="50" height="34" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                    <text x="50" y="95" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Real-Time</text>

                    <rect x="125" y="75" width="50" height="34" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.2)" strokeWidth="1" />
                    <text x="150" y="95" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8">Reports</text>

                    <rect x="60" y="115" width="80" height="22" rx="4" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" strokeWidth="1" />
                    <text x="100" y="130" textAnchor="middle" fill="var(--qe-ref-text)" fontSize="8" fontWeight="600">Full Visibility</text>

                    <line x1="50" y1="53" x2="40" y2="75" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <line x1="150" y1="53" x2="160" y2="75" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <line x1="50" y1="109" x2="80" y2="115" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                    <line x1="150" y1="109" x2="120" y2="115" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: TESTIMONIALS + STATS (Reference: stats row + testimonial cards)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
           <div className="text-center mb-10">
             <div className={eyebrowStyle}>TRADER FEEDBACK</div>
             <h2 className="ref-h-section mt-3">Traders Share Their Results with the Journal</h2>
             <p className="ref-body mt-3 max-w-lg mx-auto">
               Serious traders use the journal to audit decisions, eliminate drift, and improve session after session.
             </p>
           </div>

           {/* Stats row */}
           <div className="mb-10 grid grid-cols-3 gap-5 text-center">
             <div>
               <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">5k+</div>
               <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Traders</div>
             </div>
             <div>
               <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">3k+</div>
               <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Funded Accounts</div>
             </div>
             <div>
               <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">4.9</div>
               <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Avg Rating</div>
             </div>
           </div>

          {/* Testimonial cards */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
             {[
               {
                 name: 'Sarah J.',
                 role: 'Futures Trader',
                 date: 'September 03, 2025',
                 quote: 'Qunt Edge gave me a clean review loop. I stopped guessing and started improving session by session.',
               },
               {
                 name: 'Sandra B.',
                 role: 'Crypto Trader',
                 date: 'October 05, 2025',
                 quote: 'The import and review flow is fast enough for daily use, and strict enough for real accountability.',
               },
               {
                 name: 'Sandra S.',
                 role: 'Options Trader',
                 date: 'September 05, 2025',
                 quote: 'The journal feels like a real workspace, not a marketing dashboard. That changed my consistency.',
               },
               {
                 name: 'Singla S.',
                 role: 'Forex Trader',
                 date: 'November 02, 2025',
                 quote: 'The weekly brief is the single most useful tool I have. It surfaces patterns I literally could not see on my own.',
               },
             ].map((t, i) => (
              <div key={i} className={cardMain}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{t.name}</div>
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">{t.email || t.role}</div>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed text-[var(--qe-ref-text-muted)]">{t.quote}</p>
                <div className="mt-3 text-[10px] text-[var(--e-ref-text-muted)]">{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: FAQ ACCORDION (Reference: expandable FAQ items)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="text-center mb-10">
            <div className={eyebrowStyle}>FAQ</div>
            <h2 className="ref-h-section mt-3">Frequently Asked Questions</h2>
          </div>

          <div className="mx-auto max-w-[800px] space-y-3">
             {[
               {
                 q: 'What is the trading journal?',
                 a: 'Qunt Edge is a professional trading journal that helps discretionary traders log every fill, review execution quality, and use AI debriefs to build consistent edge.',
               },
               {
                 q: 'Is my trading data secure?',
                 a: 'Yes. Bank-grade encryption, SOC2 compliance, and account-scoped access protect your journal, notes, and performance history.',
               },
               {
                 q: 'Can beginners use the journal?',
                 a: 'Absolutely. The journal is designed for traders at every level, with simple capture tools and clear AI guidance that makes review a habit.',
               },
               {
                 q: 'Which markets and brokers are supported?',
                 a: 'Futures, forex, crypto, and equities via direct broker sync (Tradovate, Rithmic, IBKR, and CSV import) — all in one unified review workspace.',
               },
               {
                 q: 'Do I have to review every day?',
                 a: 'No. The workflow is lightweight enough for daily use but powerful enough to run only when you have time. AI helps surface what matters most.',
               },
               {
                 q: 'How do I get started?',
                 a: 'Sign up, connect your first broker or import a CSV, and the journal immediately begins turning your trade history into clear, actionable review.',
               },
             ].map((faq, idx) => (
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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: FOOTER (Reference: logo, subscribe, links columns)
         ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[var(--qe-ref-card-border)] pt-12 pb-8">
        <div className={HOME_WIDTH}>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* Logo + Subscribe */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-bold tracking-tight text-[var(--qe-ref-green)]">QUNT EDGE</div>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--qe-ref-text-muted)] max-w-[280px]">
                The AI-powered trading journal platform built for serious traders who want lasting edge.
              </p>
              <div className="mt-5 flex gap-2">
                {['twitter', 'github', 'discord'].map((social) => (
                  <a key={social} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] text-[var(--qe-ref-text-muted)] transition-colors hover:border-[var(--qe-ref-green)]/30 hover:text-[var(--qe-ref-green)]">
                    {social === 'twitter' && <Globe className="h-4 w-4" />}
                    {social === 'github' && <Star className="h-4 w-4" />}
                    {social === 'discord' && <MessageCircle className="h-4 w-4" />}
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--qe-ref-text)] mb-3">Product</h4>
              <ul className="space-y-2 text-[13px] text-[var(--qe-ref-text-muted)]">
                <li><Link href={`/${locale}/dashboard`} className="hover:text-[var(--qe-ref-green)] transition-colors">Features</Link></li>
                <li><Link href={`/${locale}/pricing`} className="hover:text-[var(--qe-ref-green)] transition-colors">Pricing</Link></li>
                <li><Link href={`/${locale}/propfirms`} className="hover:text-[var(--qe-ref-green)] transition-colors">About us</Link></li>
                <li><Link href={`/${locale}/careers`} className="hover:text-[var(--qe-ref-green)] transition-colors">Careers</Link></li>
                <li><Link href={`/${locale}/blog`} className="hover:text-[var(--qe-ref-green)] transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--qe-ref-text)] mb-3">Company</h4>
              <ul className="space-y-2 text-[13px] text-[var(--qe-ref-text-muted)]">
                <li><Link href="/terms" className="hover:text-[var(--qe-ref-green)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[var(--qe-ref-green)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/support" className="hover:text-[var(--qe-ref-green)] transition-colors">Regulatory Information</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[var(--qe-ref-green)] transition-colors">How It Works</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--qe-ref-card-border)] pt-6 text-center text-[11px] text-[var(--e-ref-text-muted)]">
            &copy; {new Date().getFullYear()} Qunt Edge. All rights reserved. Built for traders who demand excellence.
          </div>
        </div>
      </footer>

    </div>
  )
}

