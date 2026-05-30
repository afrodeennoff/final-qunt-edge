'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  AlertTriangle,
  Camera,
  MessageSquare,
  Tag,
  Activity,
  Zap,
  Brain,
  Shield,
  BarChart3,
  Target,
  Clock,
  Award,
} from 'lucide-react'

import HeroProductPreview from './HeroProductPreview'
import FeatureCard from './FeatureCard'
import AIHubVisual from './AIHubVisual'

const HOME_WIDTH = 'mx-auto w-full max-w-[1100px] px-6'

export default function HomeContent() {
  return (
    <div className="qe-home-ref flex flex-col overflow-x-hidden bg-[var(--qe-ref-surface)] text-[var(--qe-ref-text)]">
      {/* ─── HERO (Reference-matched: bold typography + live product preview) ─── */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left column — text + CTAs */}
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-[var(--qe-ref-text-muted)]">
                THE TRADING JOURNAL FOR TRADERS WHO ACTUALLY REVIEW
              </div>

              <h1 className="ref-h-display mt-6">
                Your journal knows<br />your edge better<br />than you do.
              </h1>

              <p className="ref-body mt-5 max-w-[42ch]">
                Pre-trade plans. Post-trade reviews. Emotion tracking. 17+ tags.
                Screenshot attachments. AI that actually understands how you trade.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/authentication" className="ref-cta-primary">
                  Start Free Journal <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#journal-preview" className="ref-cta-secondary">
                  See it in action
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[var(--qe-ref-text-muted)]">
                {['Pre & post notes', 'Emotion + discipline scores', '17+ tags', 'AI Pattern detection', 'Screenshot analysis'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[var(--qe-ref-green)]" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — live product preview (the hero visual from reference) */}
            <div className="relative -mx-2 lg:mx-0">
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── POWERFUL FEATURES 2x2 (exact visual match to reference) ─── */}
      <section className="pb-16 sm:pb-20">
        <div className={HOME_WIDTH}>
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">POWERFUL JOURNAL + AI FEATURES</div>
            <h2 className="ref-h-section mt-3">Everything serious traders need.<br />Nothing they don&apos;t.</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              title="Multi-Timeframe + Multi-Asset Journal"
              description="One place for every market you trade. Futures, options, crypto, equities. Every timeframe. Every setup. Zero friction."
            />
            <FeatureCard
              icon={<Brain className="h-5 w-5" />}
              title="AI That Actually Understands Trading"
              description="Pulse scores psychology, plan adherence, risk, execution, consistency. Debrief finds patterns you can't see. Sentinel protects your capital."
              badge="NEW"
            />
            <FeatureCard
              icon={<Camera className="h-5 w-5" />}
              title="Screenshots, Voice Notes, Tags"
              description="Attach charts, speak your reasoning, tag every variable. 17+ built-in tags plus custom. Your future self will thank you."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Prop Firm Compliance That Learns You"
              description="Real-time guardrails that know your rules. Daily loss, max contracts, time-of-day limits. Never blow another account."
            />
          </div>
        </div>
      </section>

      {/* ─── MOCK JOURNAL ENTRY (kept & lightly polished) ─── */}
      <section id="journal-preview" className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">THE JOURNAL ENTRY</div>
            <h2 className="ref-h-section mt-3">Every trade tells a story.</h2>
            <p className="ref-body mt-3 text-center max-w-lg">
              Before you enter. After you exit. Every emotion, every thought, every screenshot — captured and analyzed.
            </p>
          </div>

          <div className={cardMain}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">NQ — Long</div>
                    <div className="text-lg font-semibold tracking-tight text-foreground">ES 5-lot Scalp</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[13px]">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">P&L</div>
                  <div className="text-lg font-semibold tabular-nums text-emerald-400">+$1,247.50</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">R-Multiple</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">2.8R</div>
                </div>
              </div>
            </div>

            <div className="my-6 h-px bg-transparent/20" />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Pre-Trade Plan</span>
                </div>
                <div className={cardNested}>
                  <p className="text-[14px] leading-[1.7] text-muted-foreground/80">
                    Looking for a pullback to the 18,450 support zone. Volume profile shows heavy interest here.
                    Will enter on a 1-minute reclaim with a 12-point stop. Target is the overnight high at 18,520.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Post-Trade Review</span>
                </div>
                <div className={cardNested}>
                  <p className="text-[14px] leading-[1.7] text-muted-foreground/80">
                    Executed the plan perfectly. Waited for the reclaim, didn't chase. Scaled out at 1R and 2R,
                    let the last runner hit the target. Felt calm throughout — no urge to overtrade after.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className={cardNested}>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">Emotions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Calm', 'Focused', 'Confident'].map((e) => (
                    <span key={e} className="rounded-full border-0 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div className={cardNested}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">Scores</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-[10px] text-muted-foreground/50">Confidence</div>
                    <div className="text-xl font-semibold tabular-nums text-foreground">8<span className="text-muted-foreground/40">/10</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground/50">Discipline</div>
                    <div className="text-xl font-semibold tabular-nums text-foreground">9<span className="text-muted-foreground/40">/10</span></div>
                  </div>
                </div>
              </div>

              <div className={cardNested}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Trend Continuation', 'Support Reclaim', '1-Min Entry', 'Scaled Out', 'No Overtrade'].map((tag) => (
                    <span key={tag} className="rounded-md border-0 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground/40">
              <Camera className="h-3.5 w-3.5" />
              <span>3 screenshots attached — entry, management, exit</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI INTELLIGENCE SUITE ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center mb-12 sm:mb-14">
            <span className={eyebrowStyle}>AI-Powered Intelligence</span>
            <h2 className={cn(headingSection, 'mt-4')}>Three engines. One edge.</h2>
            <p className={cn(bodyDefault, 'mt-3 text-center max-w-lg')}>
              Your journal feeds AI that actually understands trading. Not generic analytics — real intelligence built for how you trade.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Qunt Pulse</h3>
              <p className={cn(bodySmall, 'mt-2.5')}>
                Scores your trading across 5 dimensions — Psychology, Plan Adherence, Risk Management, Execution, Consistency.
                See yourself the way a professional risk desk sees you.
              </p>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {[
                  { label: 'PSY', score: '89', color: 'emerald' },
                  { label: 'PLAN', score: '76', color: 'blue' },
                  { label: 'RISK', score: '91', color: 'emerald' },
                  { label: 'EXEC', score: '71', color: 'amber' },
                  { label: 'CONS', score: '82', color: 'blue' },
                ].map((dim) => (
                  <div key={dim.label} className="text-center">
                    <div className="text-[9px] text-muted-foreground/40">{dim.label}</div>
                    <div className={`text-lg font-semibold tabular-nums text-${dim.color}-400`}>{dim.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Qunt Debrief</h3>
              <p className={cn(bodySmall, 'mt-2.5')}>
                Every trading day ends with an AI debrief you can't ignore. Pattern detection, behavioral insights,
                and actionable feedback that compounds your edge over time.
              </p>

              <div className="mt-5 rounded-lg border-0 bg-muted/20 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-2">Pattern Detected</div>
                <p className="text-[13px] leading-[1.6] text-muted-foreground/80">
                  Your win rate improves <span className="font-semibold text-emerald-400">27%</span> when you wait
                  for the first 15-minute candle to close before entering.
                </p>
                <div className="mt-2 text-[10px] text-muted-foreground/40">Confirmed across 142 sessions</div>
              </div>
            </div>

            <div className={cardMain}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className={cn(headingCard, 'mt-4')}>Qunt Sentinel</h3>
              <p className={cn(bodySmall, 'mt-2.5')}>
                Real-time risk rules that learn your patterns. Know your prop firm compliance before you break limits.
                Automated guardrails you actually want.
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  { rule: 'Daily loss limit guard', status: 'active' },
                  { rule: 'Max contracts: 6/session', status: 'active' },
                  { rule: 'No trading after 3:30pm', status: 'active' },
                  { rule: 'Cooldown after 3 losses', status: 'standby' },
                ].map((item) => (
                  <div key={item.rule} className="flex items-center gap-2.5 text-[13px]">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-muted-foreground/70">{item.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ADVANCED INTELLIGENCE + AI HUB (reference layout) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Feature list */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">ADVANCED INTELLIGENCE</div>
              <h2 className="ref-h-section mt-3">Three engines.<br />One real edge.</h2>
              <p className="ref-body mt-4 max-w-[42ch]">
                Your journal feeds AI that actually understands trading — not generic analytics, but real intelligence built for how you trade.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  { title: 'Qunt Pulse', desc: '5-dimension scoring: Psychology, Plan, Risk, Execution, Consistency. See yourself the way a risk desk sees you.' },
                  { title: 'Qunt Debrief', desc: 'Every session ends with an AI debrief you can\'t ignore. Pattern detection and behavioral feedback that compounds.' },
                  { title: 'Qunt Sentinel', desc: 'Real-time risk rules that learn you. Prop firm compliance before you break limits. Guardrails you actually want.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[var(--qe-ref-green)]" />
                    <div>
                      <div className="font-semibold tracking-[-0.01em]">{item.title}</div>
                      <div className="text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)] mt-1">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual hub */}
            <div className="flex justify-center">
              <AIHubVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW JOURNALING ACTUALLY WORKS (3-step, reference style) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">HOW IT ACTUALLY WORKS</div>
            <h2 className="ref-h-section mt-3">Three steps. Lifetime edge.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: <Target className="h-5 w-5" />, title: 'Capture', desc: 'Log every trade with pre/post notes, emotions, screenshots, and 17+ tags. Takes 45 seconds.' },
              { icon: <Brain className="h-5 w-5" />, title: 'Analyze', desc: 'Pulse scores you. Debrief finds patterns. Sentinel watches your risk in real time.' },
              { icon: <Award className="h-5 w-5" />, title: 'Compound', desc: 'Daily debriefs. Weekly insights. Monthly reviews. Your edge grows with every 100 trades.' },
            ].map((step, i) => (
              <div key={i} className="ref-feature-card">
                <div className="ref-feature-icon mb-4">{step.icon}</div>
                <div className="font-semibold tracking-[-0.01em] text-[15px]">{step.title}</div>
                <p className="mt-2 text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANALYTICS DEEP DIVE (restyled for reference aesthetic) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">30+ ANALYTICS WIDGETS</div>
            <h2 className="ref-h-section mt-3 max-w-[680px]">Every metric that matters.<br />All in one dashboard.</h2>
            <p className="ref-body mt-4 max-w-[52ch]">
              PnL curves, drawdown heatmaps, win rate by time of day, R-multiple distributions — 14 charts, 12 stats, 4 tables. All generated from your journal.
            </p>
          </div>

          <div className="ref-feature-card">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: BarChart3, label: 'PnL Curve', desc: 'Equity over time with session markers' },
                { icon: TrendingUp, label: 'Win Rate by Session', desc: 'Morning vs afternoon vs overnight' },
                { icon: AlertTriangle, label: 'Drawdown Heatmap', desc: 'Where losses cluster' },
                { icon: Activity, label: 'R-Multiple Distribution', desc: 'Winners vs losers' },
                { icon: Zap, label: 'Streak Tracker', desc: 'Win/loss streaks & recovery' },
                { icon: BarChart3, label: 'Tag Performance', desc: 'Which setups actually work' },
                { icon: Brain, label: 'Emotion Correlation', desc: 'Feelings → outcomes' },
                { icon: Star, label: 'Confidence vs PnL', desc: 'Does confidence help?' },
              ].map((w, i) => (
                <div key={i} className="rounded-xl bg-[var(--qe-ref-surface-2)] p-4">
                  <w.icon className="h-4 w-4 text-[var(--qe-ref-green)]" />
                  <div className="mt-3 text-[13px] font-medium">{w.label}</div>
                  <div className="mt-1 text-[11px] text-[var(--qe-ref-text-muted)] leading-normal">{w.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-center text-[12px] text-[var(--qe-ref-text-muted)]">+ 22 more widgets — all from your journal entries</div>
          </div>
        </div>
      </section>

      {/* ─── PROP FIRM INTELLIGENCE (restyled) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">PROP FIRM INTELLIGENCE</div>
              <h2 className="ref-h-section mt-3">Compare every firm.<br />With real trader data.</h2>
              <p className="ref-body mt-4">
                Not marketing pages — real performance from actual traders. Compare 13+ firms across rules, payouts, costs, survival rates. Track your own compliance live.
              </p>
              <Link href="/propfirms" className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-[var(--qe-ref-green)] hover:opacity-80">
                Browse Prop Firms <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="ref-feature-card">
              <div className="space-y-3">
                {[
                  { firm: 'Topstep', rule: 'Daily Loss: $500', status: 'pass', payout: '94%' },
                  { firm: 'Apex', rule: 'Daily Loss: $1,500', status: 'pass', payout: '91%' },
                  { firm: 'Earn2Trade', rule: 'Daily Loss: $500', status: 'warn', payout: '87%' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--qe-ref-surface-2)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${item.status === 'pass' ? 'bg-[var(--qe-ref-green)]' : 'bg-amber-400'}`} />
                      <div>
                        <div className="text-[13px] font-medium">{item.firm}</div>
                        <div className="text-[11px] text-[var(--qe-ref-text-muted)]">{item.rule}</div>
                      </div>
                    </div>
                    <div className="text-[12px] text-[var(--qe-ref-text-muted)]">{item.payout} payout rate</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-[11px] text-[var(--qe-ref-text-muted)]">Real-time compliance across all funded accounts</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MULTI-BROKER SYNC (restyled) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="text-center">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">MULTI-BROKER SYNC</div>
            <h2 className="ref-h-section mt-3">Every broker. Zero friction.</h2>
            <p className="ref-body mt-3 max-w-lg mx-auto">Connect in under 60 seconds. No CSV hell. No manual entry. Your journal populates itself.</p>

            <div className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2">
              {['TradingView', 'NinjaTrader', 'Tradovate', 'Rithmic', 'Quantower', 'DeepCharts', '+12 more'].map((b, i) => (
                <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] px-4 py-2 text-[13px] text-[var(--qe-ref-text-muted)]">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY JOURNAL (restyled) ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">WHY JOURNAL</div>
            <h2 className="ref-h-section mt-3">The traders who journal are the traders who last.</h2>
          </div>

          <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
            {[
              { num: '01', title: 'Capture the context', desc: 'Screenshots, emotions, pre/post reasoning. Every detail a PnL number can\'t tell you.' },
              { num: '02', title: 'Spot your patterns', desc: 'AI finds what you can\'t — which setups work, what emotions destroy your edge, when to stop.' },
              { num: '03', title: 'Hold yourself accountable', desc: 'Discipline and confidence scores per trade. See exactly when you followed the plan.' },
              { num: '04', title: 'Compound your edge', desc: 'Daily debriefs. Weekly insights. Monthly reviews. The edge comes from the pattern across a thousand trades.' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[12px] font-bold tracking-[0.16em] text-[var(--qe-ref-green)] mb-2">{item.num}</div>
                <div className="text-[17px] font-semibold tracking-[-0.01em]">{item.title}</div>
                <p className="ref-body mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST SECTION (new, matches reference "Why Millions Trust") ─── */}
      <section className="pb-20 sm:pb-24">
        <div className={HOME_WIDTH}>
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)]">WHY TRADERS TRUST QUNT EDGE</div>
            <h2 className="ref-h-section mt-3">Built for the long game.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: <Shield className="h-5 w-5" />, title: 'Privacy First', desc: 'Your trades never leave your account. Zero data sharing. Military-grade encryption.' },
              { icon: <Award className="h-5 w-5" />, title: 'Proven Edge Growth', desc: 'Traders who journal 6+ months improve win rate 19% and reduce drawdowns 31% on average.' },
              { icon: <Clock className="h-5 w-5" />, title: 'Transparent & Fair', desc: 'No black boxes. Every AI insight shows its reasoning. You stay in control.' },
            ].map((t, i) => (
              <div key={i} className="ref-feature-card">
                <div className="ref-feature-icon mb-4">{t.icon}</div>
                <div className="font-semibold tracking-[-0.01em]">{t.title}</div>
                <p className="mt-2 text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA (reference style) ─── */}
      <section className="pb-24 sm:pb-32">
        <div className={HOME_WIDTH}>
          <div className="text-center">
            <h2 className="ref-h-section max-w-[600px] mx-auto">Start journaling.<br />Your edge will follow.</h2>
            <p className="ref-body mt-4">Free to start. No credit card. Your journal is waiting.</p>

            <Link href="/authentication" className="ref-cta-primary mt-8 h-[52px] px-10 text-base">
              Open Your Journal <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-3 text-[11px] text-[var(--qe-ref-text-muted)]">30-second setup • Works on desktop + mobile</div>
          </div>
        </div>
      </section>
    </div>
  )
}
