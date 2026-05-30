'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  Shield,
  BarChart3,
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
  Eye,
} from 'lucide-react'

const HOME_WIDTH = 'mx-auto w-full max-w-[1100px] px-6'

const headingDisplay = 'text-[48px] sm:text-[56px] md:text-[68px] font-light tracking-[-0.035em] leading-[1.05] text-foreground'
const headingSection = 'text-[32px] sm:text-[40px] md:text-[48px] font-light tracking-[-0.03em] leading-[1.08] text-foreground'
const headingCard = 'text-[22px] sm:text-[26px] font-medium tracking-[-0.02em] leading-tight text-foreground'
const eyebrowStyle = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-primary'
const bodyLarge = 'text-[17px] leading-[1.6] text-muted-foreground/80 max-w-[560px]'
const bodyDefault = 'text-[15px] leading-[1.65] text-muted-foreground/70'
const bodySmall = 'text-[13px] leading-[1.6] text-muted-foreground/60'

const cardMain = 'rounded-2xl border-0 bg-card p-6 sm:p-8'
const cardNested = 'rounded-xl border-0 bg-muted/30 p-5'

const accent = (color: string) => `text-${color}-400`

export default function HomeContent() {
  return (
    <div className="flex flex-col">
      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center">
            <span className={eyebrowStyle}>The Trading Journal for Traders Who Track Everything</span>

            <h1 className={cn(headingDisplay, 'mt-6 max-w-[900px]')}>
              Your journal knows<br />your edge better than you do.
            </h1>

            <p className={cn(bodyLarge, 'mt-6 text-center')}>
              Pre-trade plans. Post-trade reviews. Emotion tracking. Confidence and discipline scores.
              17+ tags per trade. Screenshot attachments. AI-powered pattern recognition.
              This is what a real trading journal looks like.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/authentication"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Your Journal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#journal-preview"
                className="inline-flex h-[52px] items-center justify-center rounded-full border-0 bg-muted/30 px-6 text-[15px] font-medium text-foreground transition-all hover:bg-muted/50"
              >
                See the Journal
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
              {['Pre & post trade notes', 'Emotion tracking', '17+ trade tags', 'Screenshot attachments', 'AI-powered insights'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] text-muted-foreground/60">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOCK JOURNAL ENTRY ─── */}
      <section id="journal-preview" className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center mb-12">
            <span className={eyebrowStyle}>The Journal Entry</span>
            <h2 className={cn(headingSection, 'mt-4')}>Every trade tells a story.</h2>
            <p className={cn(bodyDefault, 'mt-3 text-center max-w-lg')}>
              Before you enter. After you exit. Every emotion, every thought, every screenshot — captured and analyzed.
            </p>
          </div>

          <div className={cardMain}>
            {/* Journal entry header */}
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

            {/* Pre-trade notes */}
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

            {/* Emotions, confidence, tags row */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* Emotions */}
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

              {/* Confidence & Discipline */}
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

              {/* Tags */}
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

            {/* Screenshots placeholder */}
            <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground/40">
              <Camera className="h-3.5 w-3.5" />
              <span>3 screenshots attached — entry, management, exit</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI INTELLIGENCE SUITE ─── */}
      <section className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center mb-14">
            <span className={eyebrowStyle}>AI-Powered Intelligence</span>
            <h2 className={cn(headingSection, 'mt-4')}>Three engines. One edge.</h2>
            <p className={cn(bodyDefault, 'mt-3 text-center max-w-lg')}>
              Your journal feeds AI that actually understands trading. Not generic analytics — real intelligence built for how you trade.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Pulse */}
            <div className={cardMain}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className={cn(headingCard, 'mt-5')}>Qunt Pulse</h3>
              <p className={cn(bodySmall, 'mt-3')}>
                Scores your trading across 5 dimensions — Psychology, Plan Adherence, Risk Management, Execution, Consistency.
                See yourself the way a professional risk desk sees you.
              </p>

              {/* Mini pulse preview */}
              <div className="mt-6 grid grid-cols-5 gap-2">
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

            {/* Debrief */}
            <div className={cardMain}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className={cn(headingCard, 'mt-5')}>Qunt Debrief</h3>
              <p className={cn(bodySmall, 'mt-3')}>
                Every trading day ends with an AI debrief you can't ignore. Pattern detection, behavioral insights,
                and actionable feedback that compounds your edge over time.
              </p>

              {/* Mini debrief preview */}
              <div className="mt-6 rounded-lg border-0 bg-muted/20 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-2">Pattern Detected</div>
                <p className="text-[13px] leading-[1.6] text-muted-foreground/80">
                  Your win rate improves <span className="font-semibold text-emerald-400">27%</span> when you wait
                  for the first 15-minute candle to close before entering.
                </p>
                <div className="mt-2 text-[10px] text-muted-foreground/40">Confirmed across 142 sessions</div>
              </div>
            </div>

            {/* Sentinel */}
            <div className={cardMain}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-0 bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className={cn(headingCard, 'mt-5')}>Qunt Sentinel</h3>
              <p className={cn(bodySmall, 'mt-3')}>
                Real-time risk rules that learn your patterns. Know your prop firm compliance before you break limits.
                Automated guardrails you actually want.
              </p>

              {/* Mini sentinel preview */}
              <div className="mt-6 space-y-2.5">
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

      {/* ─── ANALYTICS DEEP DIVE ─── */}
      <section className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="mb-14">
            <span className={eyebrowStyle}>30+ Analytics Widgets</span>
            <h2 className={cn(headingSection, 'mt-4 max-w-[680px]')}>
              Every metric that matters.<br/>All in one dashboard.
            </h2>
            <p className={cn(bodyLarge, 'mt-4')}>
              From PnL curves to drawdown heatmaps, win rate by time of day to R-multiple distributions —
              14 charts, 12 statistics, and 4 data tables built from your journal data.
            </p>
          </div>

          <div className={cardMain}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: BarChart3, label: 'PnL Curve', desc: 'Equity over time with session markers' },
                { icon: TrendingUp, label: 'Win Rate by Session', desc: 'Morning vs afternoon vs overnight' },
                { icon: AlertTriangle, label: 'Drawdown Heatmap', desc: 'Where losses cluster by day and time' },
                { icon: Activity, label: 'R-Multiple Distribution', desc: 'Are your winners bigger than losers?' },
                { icon: Zap, label: 'Streak Tracker', desc: 'Win/loss streaks and recovery patterns' },
                { icon: Eye, label: 'Tag Performance', desc: 'Which setups and patterns actually work' },
                { icon: Brain, label: 'Emotion Correlation', desc: 'How feelings predict your outcomes' },
                { icon: Star, label: 'Confidence vs PnL', desc: 'Does confidence actually help?' },
              ].map((widget) => (
                <div key={widget.label} className="rounded-xl border-0 bg-muted/20 p-4">
                  <widget.icon className="h-4 w-4 text-primary" />
                  <div className="mt-2 text-[13px] font-medium text-foreground">{widget.label}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground/50">{widget.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-[12px] text-muted-foreground/40">
              + 22 more widgets — all generated from your journal entries
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROP FIRM INTELLIGENCE ─── */}
      <section className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <span className={eyebrowStyle}>Prop Firm Intelligence</span>
              <h2 className={cn(headingSection, 'mt-4')}>
                Compare every prop firm.<br/>With real trader data.
              </h2>
              <p className={cn(bodyLarge, 'mt-4')}>
                Not marketing pages — real performance data from actual traders.
                Compare 13+ firms across rules, payouts, costs, and survival rates.
                Track your own compliance in real time.
              </p>
              <Link
                href="/propfirms"
                className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-primary transition-colors hover:text-primary/80"
              >
                Browse Prop Firms <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className={cardMain}>
              <div className="space-y-4">
                {[
                  { firm: 'Topstep', rule: 'Daily Loss: $500', status: 'pass', payout: '94%' },
                  { firm: 'Apex', rule: 'Daily Loss: $1,500', status: 'pass', payout: '91%' },
                  { firm: 'Earn2Trade', rule: 'Daily Loss: $500', status: 'warn', payout: '87%' },
                ].map((item) => (
                  <div key={item.firm} className="flex items-center justify-between rounded-lg border-0 bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${item.status === 'pass' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <div>
                        <div className="text-[13px] font-medium text-foreground">{item.firm}</div>
                        <div className="text-[11px] text-muted-foreground/50">{item.rule}</div>
                      </div>
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground/60">{item.payout} payout rate</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[11px] text-muted-foreground/40 text-center">
                Real-time compliance tracking across all your funded accounts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MULTI-BROKER SYNC ─── */}
      <section className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center">
            <span className={eyebrowStyle}>Multi-Broker Sync</span>
            <h2 className={cn(headingSection, 'mt-4')}>Every broker. Zero friction.</h2>
            <p className={cn(bodyDefault, 'mt-3 text-center max-w-lg')}>
              Connect in under 60 seconds. No CSV hell. No manual entry. Your journal populates itself.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
              {[
                'TradingView', 'NinjaTrader', 'Tradovate', 'Rithmic', 'Quantower', 'DeepCharts',
              ].map((broker) => (
                <div key={broker} className="rounded-lg border-0 bg-muted/20 px-4 py-2.5 text-[13px] font-medium text-muted-foreground/70">
                  {broker}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[12px] text-muted-foreground/40">+ 12 more platforms supported</div>
          </div>
        </div>
      </section>

      {/* ─── WHY JOURNAL ─── */}
      <section className="pb-24">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center mb-14">
            <span className={eyebrowStyle}>Why Journal</span>
            <h2 className={cn(headingSection, 'mt-4')}>The traders who journal are the traders who last.</h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {[
              {
                title: 'Capture the context',
                desc: 'Screenshots, emotions, pre-trade reasoning, post-trade reflection. Every detail that a PnL number alone can\'t tell you.',
              },
              {
                title: 'Spot your patterns',
                desc: 'AI finds what you can\'t — which setups work, what emotions destroy your edge, when you should stop trading and when to push.',
              },
              {
                title: 'Hold yourself accountable',
                desc: 'Discipline and confidence scores per trade. See exactly when you followed your plan and when you didn\'t.',
              },
              {
                title: 'Compound your edge',
                desc: 'Daily debriefs. Weekly insights. Monthly reviews. The edge doesn\'t come from one trade — it comes from the pattern across a thousand.',
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/60 mb-2">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-medium tracking-[-0.01em] text-foreground">{item.title}</h3>
                <p className={cn(bodyDefault, 'mt-2')}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="pb-28 sm:pb-36">
        <div className={HOME_WIDTH}>
          <div className="flex flex-col items-center text-center">
            <h2 className={cn(headingSection, 'max-w-[600px]')}>
              Start journaling.<br/>Your edge will follow.
            </h2>
            <p className={cn(bodyDefault, 'mt-4 text-center')}>
              Free to start. No credit card. Your journal is waiting.
            </p>

            <Link
              href="/authentication"
              className="mt-8 inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-10 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Open Your Journal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function cn(...inputs: (string | false | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ')
}
