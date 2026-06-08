'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import {
  Brain, BookOpen, LayoutDashboard, Upload, Building2,
  Trophy, Users, BarChart3, Target, ChevronDown, Play,
  Sparkles, TrendingUp, Shield, Zap, LineChart, Workflow,
  MessageSquare, Calendar, PieChart, Gift, Star, Route,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    id: 'ai-copilot',
    title: 'AI Copilot',
    subtitle: 'Your 24/7 Trading Analyst',
    description: 'Conversational AI that knows your trades. Ask anything — pattern recognition, risk analysis, session debriefs, strategy drift detection. Get answers in seconds, not hours.',
    icon: Brain,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    accent: 'text-emerald-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Smart Insights per session', 'Session Debriefs', 'Pattern Recognition', 'Strategy Drift Detection'],
  },
  {
    id: 'journal',
    title: 'Trading Journal',
    subtitle: 'Precision Recording, Zero Effort',
    description: 'Pre-trade notes with immutable timestamps, post-trade reviews, mood tracking, screenshot attachments, and AI-generated journal suggestions. Every trade tells a story.',
    icon: BookOpen,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    accent: 'text-blue-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Pre & Post Trade Notes', 'Mood & Emotion Tracking', 'Screenshot Attachments', 'AI Journal Suggestions'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Widgets',
    subtitle: 'Your Command Center',
    description: '25+ drag-and-drop widgets across 4 categories. Customize your layout, apply global filters, save multiple configurations. Desktop and mobile layouts included.',
    icon: LayoutDashboard,
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    accent: 'text-violet-400',
    preview: '/posts/custom-dashboard-layout/product-demo.png',
    metrics: ['25+ Widgets', 'Drag & Drop Canvas', 'Global Filters', 'Desktop + Mobile'],
  },
  {
    id: 'import',
    title: 'Data Import',
    subtitle: '18+ Platforms, One Journal',
    description: 'Auto-sync with Tradovate, Rithmic, DXfeed. Import from NinjaTrader, MT5, IBKR, TradingView, and 12+ more. CSV with smart column mapping. IBKR PDF OCR parsing.',
    icon: Upload,
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    accent: 'text-amber-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Auto-Sync Brokers', 'File Import (18+)', 'Duplicate Detection', 'PDF OCR'],
  },
  {
    id: 'propfirms',
    title: 'Prop Firm Tools',
    subtitle: 'Pass Challenges, Track Compliance',
    description: 'Real-time drawdown tracking, daily loss limits, consistency rules. Challenge progress monitoring, funded account management, trailing drawdown. 50+ verified firms in catalogue.',
    icon: Building2,
    gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    accent: 'text-rose-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Compliance Engine', 'Challenge Tracking', 'Funded Management', '50+ Firms Catalogue'],
  },
  {
    id: 'deals',
    title: 'Deals Marketplace',
    subtitle: 'Save on Top Prop Firms',
    description: 'Active promo codes, exclusive discounts, side-by-side firm comparisons, challenge cost calculator. Find the best deals on FTMO, Topstep, and 50+ firms.',
    icon: Gift,
    gradient: 'from-green-500/20 via-green-500/5 to-transparent',
    accent: 'text-green-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Active Coupons', 'Firm Comparisons', 'Cost Calculator', 'Exclusive Deals'],
  },
  {
    id: 'leaderboard',
    title: 'Trader Leaderboard',
    subtitle: 'Public Performance Rankings',
    description: 'Rank traders by monthly P&L, win rate, or total trades. Public profiles with verified performance data. Anonymous mode available.',
    icon: Trophy,
    gradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
    accent: 'text-yellow-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Performance Rankings', 'Public Profiles', 'Multiple Sort Modes', '1.2k+ Traders'],
  },
  {
    id: 'teams',
    title: 'Teams',
    subtitle: 'Trade Together, Win Together',
    description: 'Create trading teams, share analytics, manage roles. Aggregated team dashboards, per-trader analytics view, invitations and member management.',
    icon: Users,
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    accent: 'text-cyan-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['Team Dashboards', 'Role Management', 'Shared Analytics', '50+ Teams'],
  },
  {
    id: 'statistics',
    title: 'Statistics & Risk',
    subtitle: 'Deep Analytics, Clear Decisions',
    description: 'Sharpe, Sortino, Calmar ratios. Kelly Criterion, max drawdown, expectancy. Win rate, profit factor, risk-reward, streaks, decile analysis. Everything you need to measure edge.',
    icon: BarChart3,
    gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
    accent: 'text-indigo-400',
    preview: '/videos/demo_dark_poster.webp',
    metrics: ['15+ Risk Metrics', 'Kelly Criterion', 'Drawdown Analysis', 'Strategy Comparison'],
  },
]

const STATS = [
  { label: 'Active Traders', value: '5,000+', icon: Users },
  { label: 'Funded Accounts', value: '3,000+', icon: Shield },
  { label: 'Prop Firms Listed', value: '50+', icon: Building2 },
  { label: 'Avg Rating', value: '4.9', icon: Star },
  { label: 'Teams Created', value: '50+', icon: Route },
  { label: 'Platforms Supported', value: '18+', icon: Upload },
]

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance])
}

function FeatureFrame({
  feature,
  index,
  progress,
  targetRef,
}: {
  feature: (typeof FEATURES)[number]
  index: number
  progress: MotionValue<number>
  targetRef: React.RefObject<HTMLDivElement | null>
}) {
  const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4])
  const scale = useTransform(progress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.92])
  const y = useTransform(progress, [0, 0.3, 0.7, 1], [40, 0, 0, -40])
  const imageY = useParallax(progress, 60)
  const Icon = feature.icon

  return (
    <motion.section
      ref={targetRef}
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className={cn(
        'pointer-events-none absolute inset-0 bg-gradient-to-b',
        feature.gradient,
      )} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-20" />

      <div className="relative z-10 mx-auto w-full max-w-[1360px]">
        <div className={cn(
          'grid gap-10 items-center',
          index % 2 === 0 ? 'lg:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-[1.2fr_1fr]',
        )}>
          <motion.div style={{ y: y }} className={cn(
            'order-2',
            index % 2 === 0 ? 'lg:order-1' : 'lg:order-2',
          )}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              <Icon className={cn('h-3.5 w-3.5', feature.accent)} />
              <span>Feature {String(index + 1).padStart(2, '0')}</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {feature.title}
            </h2>
            <p className="mt-2 text-lg font-medium text-white/50">
              {feature.subtitle}
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/40">
              {feature.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {feature.metrics.map((metric, i) => (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5"
                >
                  <Sparkles className="h-3 w-3 text-white/30 shrink-0" />
                  <span className="text-sm text-white/50">{metric}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ y: imageY }} className={cn(
            'order-1',
            index % 2 === 0 ? 'lg:order-2' : 'lg:order-1',
          )}>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
              <div className="aspect-[16/10] bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col items-center gap-3 text-white/20">
                  <LayoutDashboard className="h-16 w-16" />
                  <span className="text-sm font-medium">Dashboard Preview</span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Play className="h-3 w-3" />
                  View Demo
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function StatsCounter({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  const ref = useRef<HTMLDivElement>(null)
  const [counted, setCounted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCounted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-2 p-4"
    >
      <Icon className="h-5 w-5 text-white/30" />
      <motion.span
        className="text-3xl font-bold tracking-tight text-white"
        initial={{ opacity: 0 }}
        animate={counted ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {counted ? value : '\u2014'}
      </motion.span>
      <span className="text-sm text-white/40">{label}</span>
    </motion.div>
  )
}

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const featureProgressValues = FEATURES.map((_, i) => {
    const start = i / FEATURES.length
    const end = (i + 1) / FEATURES.length
    return useTransform(scrollYProgress, [start, end], [0, 1])
  })

  const sectionRefs = FEATURES.map(() => useRef<HTMLDivElement>(null))

  return (
    <div ref={containerRef} className="relative bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.7_0.2_160)_0%,_transparent_60%)] opacity-[0.03]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Product Demo
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Everything You Need
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-emerald-300 to-white bg-clip-text text-transparent">
              To Trade Smarter
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/40 leading-relaxed">
            One platform. Every tool. From AI-powered analytics to prop firm compliance —
            Qunt Edge is the complete trading ecosystem for serious traders.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/en/authentication"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-emerald-400 active:scale-[0.97]"
            >
              <Play className="h-4 w-4" />
              Start Free Trial
            </Link>
            <Link
              href="/en/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/10 active:scale-[0.97]"
            >
              View Pricing
            </Link>
          </div>

          <motion.div
            className="mt-16 flex items-center justify-center gap-2 text-sm text-white/30"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span>Scroll to explore</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-white/5 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((stat) => (
              <StatsCounter key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Frames */}
      {FEATURES.map((feature, index) => (
        <FeatureFrame
          key={feature.id}
          feature={feature}
          index={index}
          progress={featureProgressValues[index]}
          targetRef={sectionRefs[index]}
        />
      ))}

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_oklch(0.7_0.2_160)_0%,_transparent_60%)] opacity-[0.02]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
            Get Started
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to Find Your Edge?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/40">
            5,000+ traders already use Qunt Edge. Join them and transform your trading.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/en/authentication"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-emerald-400 active:scale-[0.97]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/en/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/10 active:scale-[0.97]"
            >
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
