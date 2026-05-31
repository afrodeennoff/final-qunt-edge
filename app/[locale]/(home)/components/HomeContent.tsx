'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
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
  Users2,
  Building2,
  Percent,
  Trophy,
  Cpu,
  MessageCircle,
  Plus,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useCurrentLocale } from '@/locales/client'
import HeroProductPreview from './HeroProductPreview'
import AIHubVisual from './AIHubVisual'
import type { HomeLiveHighlights } from '../page'
import { motion, AnimatePresence, type Variants } from 'motion/react'

const HOME_WIDTH = 'mx-auto w-full max-w-[1100px] px-6'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    }
  }
}

const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
  }
}
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingSection = 'ref-h-section'
const bodyDefault = 'ref-body'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function HomeContent({ liveHighlights }: { liveHighlights?: HomeLiveHighlights }) {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const highlights = liveHighlights ?? { topFirms: [], topCoupons: [], topLeaders: [] }

  return (
    <div className="qe-home-ref flex flex-col overflow-x-hidden bg-[var(--qe-ref-surface)] text-[var(--qe-ref-text)]">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO (Reference: badge + headline + CTAs + dashboard mockup)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left column — text + CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-[var(--qe-ref-text-muted)]">
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
                {['Pre & post trade notes', 'AI pattern detection', '17+ custom tags', 'Prop firm compliance', 'Screenshot analysis'].map((t, i) => (
                  <motion.div
                    key={t}
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> {t}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right column — live product preview */}
            <motion.div
              className="relative -mx-2 lg:mx-0"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroProductPreview />
            </motion.div>
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

           <motion.div 
             className="grid gap-4 sm:gap-5 md:grid-cols-2"
             variants={staggerContainer}
             initial="initial"
             whileInView="animate"
             viewport={{ once: true, margin: "-50px" }}
           >
             {/* Card 1: Multi-Asset Power */}
             <motion.div variants={staggerItem} className={cardMain}>
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
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-warning/10 text-semantic-warning">
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
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-info/10 text-semantic-info">
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
             </motion.div>

            {/* Card 2: 24/7 Customer Support */}
             <motion.div variants={staggerItem} className={cardMain}>
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
                     <circle cx="80" cy="28" r="3" fill="var(--qe-ref-green)" />
                     <circle cx="124" cy="50" r="3" fill="var(--qe-ref-green)" />
                     <circle cx="124" cy="90" r="3" fill="var(--qe-ref-green)" />
                     <circle cx="36" cy="90" r="3" fill="var(--qe-ref-green)" />
                     <circle cx="36" cy="50" r="3" fill="var(--qe-ref-green)" />
                   </svg>
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qe-ref-green)]/30 bg-[var(--qe-ref-surface-2)]">
                     <MessageCircle className="h-4 w-4 text-[var(--qe-ref-green)]" />
                   </div>
                 </div>
               </div>
             </motion.div>

            {/* Card 3: Solana stats */}
             <motion.div variants={staggerItem} className={cardMain}>
               <div className="flex items-start justify-between">
                 <div>
                   <h3 className={headingCard}>Advanced Analytics Widgets</h3>
                   <p className={cn(bodySmall, 'mt-2')}>
                     Heatmaps, decile analysis, and custom metrics turn every trade into clear, actionable review insights.
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Win Rate</div>
                   <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">74%</div>
                 </div>
               </div>
             </motion.div>

             {/* Card 4: Polkadot + 2FA */}
              <motion.div variants={staggerItem} className={cardMain}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={headingCard}>Prop Firm Compliance Tools</h3>
                    <p className={cn(bodySmall, 'mt-2')}>
                      Drawdown tracking, rule adherence monitoring, and payout-ready reports for funded prop firm accounts.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Compliance</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">98%</div>
                  </div>
                </div>
              </motion.div>

             {/* Card 5: Prop Firms Catalogue */}
              <motion.div variants={staggerItem}>
              <Link href={`/${locale}/propfirms`} className={`${cardMain} block transition-all hover:border-[var(--qe-ref-green)]/30 hover:bg-[var(--qe-ref-surface)]/30`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={headingCard}>Prop Firms Catalogue</h3>
                    <p className={cn(bodySmall, 'mt-2')}>
                      Browse 50+ verified prop firms with live user stats on accounts, payouts and success.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Firms</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">120+</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={cardNested}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Verified</div>
                        <div className="text-sm font-semibold tabular-nums">4.2d payout</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                      Real aggregated data from thousands of funded traders.
                    </p>
                  </div>
                  <div className={cardNested}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-info/10 text-semantic-info">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Tracked</div>
                        <div className="text-sm font-semibold tabular-nums">2.4k accounts</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                      Payout performance, platform & drawdown filters.
                    </p>
                  </div>
                </div>
              </Link>
              </motion.div>

             {/* Card 6: Deals */}
              <motion.div variants={staggerItem}>
              <Link href={`/${locale}/deals`} className={`${cardMain} block transition-all hover:border-[var(--qe-ref-green)]/30 hover:bg-[var(--qe-ref-surface)]/30`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={headingCard}>Deals</h3>
                    <p className={cn(bodySmall, 'mt-2')}>
                      Real-time prop firm challenge discounts. Compare fees, promos & move to full research.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Max Save</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">40%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={cardNested}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-warning/10 text-semantic-warning">
                        <Percent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">12 active promos • Expiring soon</div>
                        <p className="text-[11px] text-[var(--qe-ref-text-muted)]">Futures challenges from top firms. Instant funding options too.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              </motion.div>

             {/* Card 7: Leaderboard */}
              <motion.div variants={staggerItem}>
              <Link href={`/${locale}/leaderboard`} className={`${cardMain} block transition-all hover:border-[var(--qe-ref-green)]/30 hover:bg-[var(--qe-ref-surface)]/30`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={headingCard}>Leaderboard</h3>
                    <p className={cn(bodySmall, 'mt-2')}>
                      Public performance rankings. Real monthly PnL, win rates from opted-in traders.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Traders</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">1.2k+</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                    Top performer this month: +$47k realized PnL. Filter by win rate or trade count.
                  </div>
                </div>
              </Link>
              </motion.div>

             {/* Card 8: Teams */}
              <motion.div variants={staggerItem}>
              <Link href={`/${locale}/teams`} className={`${cardMain} block transition-all hover:border-[var(--qe-ref-green)]/30 hover:bg-[var(--qe-ref-surface)]/30`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={headingCard}>Teams</h3>
                    <p className={cn(bodySmall, 'mt-2')}>
                      Shared workspaces for prop firms & funds. Unified analytics, risk & reviews.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Teams</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">50+</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={cardNested}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-success/10 text-semantic-success">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Desk</div>
                        <div className="text-sm font-semibold tabular-nums">Live sync</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                      Manager visibility across all traders in one surface.
                    </p>
                  </div>
                  <div className={cardNested}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-semantic-info/10 text-semantic-info">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Coaching</div>
                        <div className="text-sm font-semibold tabular-nums">Weekly rhythm</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                      Turn reviews into repeatable team process.
                    </p>
                  </div>
                </div>
               </Link>
              </motion.div>
            </motion.div>

             {/* Enterprise-Grade Security (full width below the grid) */}
             <motion.div
               className={cardMain}
               style={{ marginTop: '16px' }}
               initial={{ opacity: 0, y: 16 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
             >
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
             </motion.div>

           </div>
         </section>

        {/* ═══════════════════════════════════════════════════════════════
            LIVE FROM THE PLATFORM — Refined
           ═══════════════════════════════════════════════════════════════ */}
        <section className="pb-16 sm:pb-20">
          <div className={HOME_WIDTH}>
            <div className="mb-8">
              <div className={eyebrowStyle}>LIVE FROM THE PLATFORM</div>
              <h2 className="ref-h-section mt-1">Platform Pulse</h2>
              <p className="ref-body mt-2 max-w-lg">Real-time data from funded traders, active deals, and the leaderboard.</p>
            </div>

            <div className="space-y-4">
            {/* Row 1: Top Firms */}
            <motion.div
              className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--qe-ref-green)]">TOP FIRMS</div>
                  <div className="mt-0.5 text-[13px] text-[var(--qe-ref-text-muted)]">Leading prop firms by total payouts</div>
                </div>
                <Link href={`/${locale}/propfirms`} className="text-[12px] text-[var(--qe-ref-green)] hover:underline font-medium">
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {highlights.topFirms.length > 0 ? (
                  highlights.topFirms.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--qe-ref-surface-2)] px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-[var(--qe-ref-text-muted)] bg-[var(--qe-ref-card)]">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[var(--qe-ref-text)] truncate">{f.name}</div>
                        <div className="text-[11px] text-[var(--qe-ref-text-muted)]">{f.accounts} accounts</div>
                      </div>
                      <div className="text-[13px] font-semibold tabular-nums text-[var(--qe-ref-green)] shrink-0">
                        ${Math.round(f.paidPayout).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--qe-ref-text-muted)] text-sm col-span-3 py-6 text-center">Live data loading…</div>
                )}
              </div>
            </motion.div>

            {/* Row 2: Hot Deals */}
            <motion.div
              className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--qe-ref-green)]">HOT DEALS</div>
                  <div className="mt-0.5 text-[13px] text-[var(--qe-ref-text-muted)]">Active prop firm discounts right now</div>
                </div>
                <Link href={`/${locale}/deals`} className="text-[12px] text-[var(--qe-ref-green)] hover:underline font-medium">
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {highlights.topCoupons.length > 0 ? (
                  highlights.topCoupons.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--qe-ref-surface-2)] px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                        <Percent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[var(--qe-ref-text)] truncate">{c.firmName}</div>
                        <div className="text-[11px] font-mono text-[var(--qe-ref-text-muted)]">{c.code}</div>
                      </div>
                      <div className="text-[13px] font-bold tabular-nums text-[var(--qe-ref-green)] shrink-0">
                        {c.discount}% OFF
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--qe-ref-text-muted)] text-sm col-span-3 py-6 text-center">Live promos loading…</div>
                )}
              </div>
            </motion.div>

            {/* Row 3: Top Traders */}
            <motion.div
              className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--qe-ref-green)]">TOP TRADERS</div>
                  <div className="mt-0.5 text-[13px] text-[var(--qe-ref-text-muted)]">This month's highest performers</div>
                </div>
                <Link href={`/${locale}/leaderboard`} className="text-[12px] text-[var(--qe-ref-green)] hover:underline font-medium">
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {highlights.topLeaders.length > 0 ? (
                  highlights.topLeaders.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--qe-ref-surface-2)] px-4 py-3">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                        i === 0 ? "bg-amber-400/15 text-amber-400" : i === 1 ? "bg-gray-400/15 text-gray-400" : i === 2 ? "bg-orange-400/15 text-orange-400" : "bg-[var(--qe-ref-card)] text-[var(--qe-ref-text-muted)]"
                      )}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[var(--qe-ref-text)] truncate">{l.username}</div>
                      </div>
                      <div className="text-[13px] font-semibold tabular-nums text-[var(--qe-ref-green)] shrink-0">
                        +${Math.round(l.monthlyPnl).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--qe-ref-text-muted)] text-sm col-span-3 py-6 text-center">Leaderboard syncing…</div>
                )}
              </div>
            </motion.div>
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
             <motion.div
               initial={{ opacity: 0, x: -16 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-80px" }}
               transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
             >
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
                         <AnimatePresence initial={false}>
                           {openAccordion === idx && (
                             <motion.p
                               className="mt-1 text-[12px] leading-relaxed text-[var(--qe-ref-text-muted)]"
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                               style={{ overflow: 'hidden' }}
                             >
                               {item.desc}
                             </motion.p>
                           )}
                         </AnimatePresence>
                       </div>
                     </div>
                     <ChevronDown className={cn('h-4 w-4 text-[var(--qe-ref-text-muted)] transition-transform duration-200', openAccordion === idx && 'rotate-180')} />
                   </button>
                 ))}
               </div>

               <Link href={`/${locale}/authentication`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-6 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90">
                 Try Now
               </Link>
             </motion.div>

            {/* Right: Circular AI Hub diagram */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <AIHubVisual />
            </motion.div>
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

            <motion.div 
              className="grid gap-5 md:grid-cols-3"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* Card 1: Trade Capture & Review */}
             <motion.div variants={staggerItem} className={cardMain}>
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
             </motion.div>

             {/* Card 2: Risk & Drift Analysis */}
             <motion.div variants={staggerItem} className={cardMain}>
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
                     <span className="text-[var(--qe-ref-text-muted)]">{row.label || `Day ${i + 1}`}</span>
                     <span className="font-semibold tabular-nums">{row.value}</span>
                     <span className="text-[var(--qe-ref-text-muted)] tabular-nums">{row.sub}</span>
                   </div>
                 ))}
               </div>
               <p className={cn(bodySmall, 'mt-4')}>
                 Every session is scored for risk adherence, behavior drift, and execution quality against your rules.
               </p>
             </motion.div>

             {/* Card 3: AI Debrief & Action */}
             <motion.div variants={staggerItem} className={cardMain}>
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
              </motion.div>
            </motion.div>
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

          <motion.div
            className="grid gap-5 md:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Enterprise-Grade Security */}
            <motion.div variants={staggerItem} className={cardMain}>
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
            </motion.div>

            {/* Verified Performance */}
             <motion.div variants={staggerItem} className={cardMain}>
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
             </motion.div>

            {/* Transparent System */}
            <motion.div variants={staggerItem} className={cardMain}>
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
            </motion.div>
          </motion.div>
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
           <motion.div
             className="mb-10 grid grid-cols-3 gap-5 text-center"
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
           >
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
           </motion.div>

           {/* Testimonial cards */}
           <motion.div 
             className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4"
             variants={staggerContainer}
             initial="initial"
             whileInView="animate"
             viewport={{ once: true }}
           >
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
              <motion.div key={i} variants={staggerItem} className={cardMain}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                    <Users className="h-4 w-4" />
                  </div>
                   <div>
                     <div className="text-[13px] font-semibold">{t.name}</div>
                     <div className="text-[10px] text-[var(--qe-ref-text-muted)]">{t.role}</div>
                   </div>
                </div>
                <p className="text-[12px] leading-relaxed text-[var(--qe-ref-text-muted)]">{t.quote}</p>
                 <div className="mt-3 text-[10px] text-[var(--qe-ref-text-muted)]">{t.date}</div>
               </motion.div>
             ))}
           </motion.div>
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

          <motion.div
            className="mx-auto max-w-[800px] space-y-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
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
              <motion.div key={idx} variants={staggerItem}>
              <button
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
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.p
                        className="mt-2 text-[13px] leading-relaxed text-[var(--qe-ref-text-muted)]"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  )
}

