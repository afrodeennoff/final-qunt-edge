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
  Minus,
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
                Smart AI Trading with<br />Automated Risk Management
              </h1>

              <p className="ref-body mt-5 max-w-[42ch]">
                Leverage AI-driven automation to maximize stop loss, take profit, and trading strategies, ensuring precise and decisive trading.
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
            <div className={eyebrowStyle}>AI-Powered Features</div>
            <h2 className="ref-h-section mt-3">Powerful AI Trading Features</h2>
            <p className="ref-body mt-3 max-w-lg mx-auto">
              Our AI trading bot analyzes market data, automates execution, manages risk intelligently, and delivers consistent performance.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {/* Card 1: Multi-Asset Power */}
            <div className={cardMain}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={headingCard}>Multi-Asset Power: One Smart Bot.</h3>
                  <p className={cn(bodySmall, 'mt-2')}>
                    One smart AI bot handles multiple asset classes, analyzing markets in real-time and executing trades across different instruments for optimized performance.
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
                      <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Bitcoin (BTC)</div>
                      <div className="text-sm font-semibold tabular-nums">$92,000</div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                    Bitcoin is one of the most decentralized cryptocurrencies offering robust security, offering strong returns for traders and long-term investors alike.
                  </p>
                </div>
                <div className={cardNested}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--qe-ref-text-muted)]">Ethereum (ETH)</div>
                      <div className="text-sm font-semibold tabular-nums">$3,242</div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                    Ethereum (ETH) enables smart contracts, decentralized applications, and a thriving ecosystem of DeFi protocols and trading opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: 24/7 Customer Support */}
            <div className={cardMain}>
              <h3 className={headingCard}>24/7 Customer Support</h3>
              <p className={cn(bodySmall, 'mt-2')}>
                Our dedicated support team is available 24/7 to provide fast, reliable assistance whenever you need help.
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
                  <h3 className={headingCard}>Solana (SOL)</h3>
                  <p className={cn(bodySmall, 'mt-2')}>
                    Solana is a high-speed, low-cost blockchain powering DeFi, NFTs, and more — delivering exceptional performance.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--e-ref-text-muted)]">Price</div>
                  <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">$159</div>
                </div>
              </div>
            </div>

            {/* Card 4: Polkadot + 2FA */}
            <div className={cardMain}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={headingCard}>Polkadot (DOT)</h3>
                  <p className={cn(bodySmall, 'mt-2')}>
                    Polkadot DOT is a scalable, interoperable blockchain token enabling cross-chain communication and fast transactions.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--e-ref-text-muted)]">Price</div>
                  <div className="text-lg font-semibold tabular-nums text-[var(--qe-ref-green)]">$1.70</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication card (full width below) */}
          <div className={cardMain} style={{ marginTop: '16px' }}>
            <h3 className={headingCard}>Two-Factor Authentication</h3>
            <p className={cn(bodySmall, 'mt-2', 'max-w-[600px]')}>
              Two-factor authentication adds an extra layer of security before granting secure account access.
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)]">
                  <Fingerprint className="h-6 w-6 text-[var(--qe-ref-green)]" />
                </div>
                <span className="text-[11px] text-[var(--qe-ref-text-muted)]">Time-based<br/>one-time password</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)]">
                  <Lock className="h-6 w-6 text-[var(--qe-ref-text-muted)]" />
                </div>
                <span className="text-[11px] text-[var(--qe-ref-text-muted)]">SMS email<br/>verification codes</span>
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
              <div className={eyebrowStyle}>Advanced</div>
              <h2 className="ref-h-section mt-3">Advanced Trading Powered by Intelligent AI</h2>
              <p className="ref-body mt-4 max-w-[42ch]">
                Our AI-powered platform delivers fast, real-time insights, automated decision-making with intelligent accuracy. Make smarter trades, maximize consistent gains.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {
                    title: 'Real-Time Market Intelligence',
                    desc: 'Live market data analysis with AI-driven predictions and trend identification.',
                  },
                  {
                    title: 'Lightning-Fast Execution Engine',
                    desc: 'Execute trades in milliseconds with our optimized trading infrastructure.',
                  },
                  {
                    title: 'Personalized Trading Dashboard',
                    desc: 'Customizable dashboards tailored to your trading style and preferences.',
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
            <div className={eyebrowStyle}>AI Trading Platform</div>
            <h2 className="ref-h-section mt-3">How Our AI <span className="text-[var(--qe-ref-green)]">Trading Bot</span> Works</h2>
            <p className="ref-body mt-3 max-w-lg mx-auto">
              Our AI engine predicts market shifts, executes instant trades, and manages risk automatically to consistently outperform.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Card 1: Automated Signal Engine */}
            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Automated Signal Engine</h3>
              <div className="mt-4 space-y-2">
                {['Start', 'Analyze', 'Monitor'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-[var(--qe-ref-surface-2)] px-3 py-2">
                    <div className={cn('h-2 w-2 rounded-full', i === 0 ? 'bg-[var(--qe-ref-green)]' : i === 1 ? 'bg-blue-400' : 'bg-amber-400')} />
                    <span className="text-[13px]">{step}</span>
                  </div>
                ))}
              </div>
              <p className={cn(bodySmall, 'mt-4')}>
                AI analyzes real-time data using advanced algorithms to identify market opportunities.
              </p>
            </div>

            {/* Card 2: Intelligent Risk Management */}
            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Intelligent Risk Management</h3>
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
                Every trade comes with risk management, ensuring safety, profits, and optimized outcomes.
              </p>
            </div>

            {/* Card 3: Automated Trade Execution */}
            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Automated Trade Execution</h3>
              <div className="mt-4 flex items-end gap-1 h-20">
                {Array.from({ length: 20 }).map((_, i) => {
                  const height = [30, 45, 25, 55, 35, 60, 40, 70, 50, 38, 65, 48, 72, 42, 58, 35, 52, 68, 44, 55][i] || 40
                  return (
                    <div key={i} className="flex-1 mx-[1px] rounded-t-sm bg-[var(--qe-ref-green)]/20" style={{ height: `${height}%` }} />
                  )
                })}
              </div>
              <p className={cn(bodySmall, 'mt-4')}>
                When a strong signal appears, the bot executes instantly, safely, and without human error.
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
            <div className={eyebrowStyle}>Millions Choose Us</div>
            <h2 className="ref-h-section mt-3">Why Millions Trust Our AI</h2>
            <p className="ref-body mt-3 max-w-lg mx-auto">
              Millions rely on our AI for accuracy, speed, and reliability. Powered by advanced algorithms and continuous learning, it delivers precision insights and outcomes at scale.
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
              <h3 className={headingCard}>Verified Performance</h3>
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
                  See It In Action
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
            <div className={eyebrowStyle}>Testimonials</div>
            <h2 className="ref-h-section mt-3">Traders Share Their Success Stories With Our AI</h2>
            <p className="ref-body mt-3 max-w-lg mx-auto">
              Traders succeed using AI Automation, executing smart trades profitably.
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-10 grid grid-cols-3 gap-5 text-center">
            <div>
              <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">5k+</div>
              <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Total Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">3k+</div>
              <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight text-[var(--qe-ref-text)]">4.9</div>
              <div className="mt-1 text-[13px] text-[var(--qe-ref-text-muted)]">Review Rate</div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Sarah J.',
                role: 'Futures Trader',
                date: 'September 03, 2025',
                quote: 'Using Qunt Edge in trading has fully satisfied my need for reliable and accurate analytics that enhance my profitability and effectiveness.',
              },
              {
                name: 'Sandra B.',
                role: 'Crypto Trader',
                date: 'October 05, 2025',
                quote: 'Using this AI trading bot has completely changed my trading strategy, delivering consistent profitability while reducing manual errors.',
              },
              {
                name: 'Sandra S.',
                role: 'Options Trader',
                date: 'September 05, 2025',
                quote: 'I rely on this AI trading bot every day; it efficiently boosts the speed and accuracy of my trades while helping me achieve much higher than my normal approach.',
              },
              {
                name: 'Singla S.',
                role: 'Forex Trader',
                date: 'November 02, 2025',
                quote: 'This AI trading bot is consistent, reliable, and user-friendly, providing accurate signals that lead to higher profits and a more profitable outcome daily.',
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
                q: 'What Is the AI Trading bot?',
                a: 'This AI trading bot is a fully automated system that continuously analyzes real-time market data, identifies trading opportunities, and executes automated decisions based on your preferred strategy.',
              },
              {
                q: 'Is the trading bot safe to use?',
                a: 'Yes, the trading bot uses advanced encryption, secure authentication, and follows strict risk management protocols to protect your funds and personal information.',
              },
              {
                q: 'Can beginners use the AI trading bot?',
                a: 'Absolutely! The AI trading bot is designed with user-friendliness in mind, making it accessible even for those with no prior trading experience.',
              },
              {
                q: 'Which assets or currencies can the bot trade?',
                a: 'The bot supports trading across major cryptocurrency pairs, forex, stocks, commodities, and indices depending on your configured preferences.',
              },
              {
                q: 'Do I need to monitor trades manually?',
                a: 'No, the AI trading bot operates autonomously once configured. You can review performance and adjust settings anytime through the dashboard.',
              },
              {
                q: 'How can I start using the AI trading bot?',
                a: 'Simply sign up for an account, configure your trading preferences, connect your exchange or broker, and let the AI bot start trading on your behalf.',
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
                      {openFaq === idx ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
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

