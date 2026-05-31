'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  Brain, Activity, TrendingUp, AlertTriangle, Shield, BarChart3, ArrowRight, Check,
  Zap, Target, Eye, Clock, RefreshCw, Heart, LineChart, Award, Sliders
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsBehaviorPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How does the platform detect trading patterns?",
      a: "The platform analyzes your complete trade history using statistical pattern recognition. It looks at sequences of trades, P&L volatility, timing between entries, deviations from planned risk, and emotional journal tags. The Copilot correlates these signals to identify behavioral patterns like revenge trading (large, quick entries after a loss), FOMO (entries near highs after a breakout), and overtrading (excessive frequency with declining edge)."
    },
    {
      q: "What is a behavior score?",
      a: "Your behavior score is a 0-100 composite metric that quantifies how closely your actual trading aligns with disciplined, rule-based behavior. It factors in: adherence to planned entries/exits, risk consistency, trade frequency discipline, emotional neutrality (based on journal tags), and recovery behavior after losses. A higher score means more consistent, rule-following behavior."
    },
    {
      q: "Can I improve my behavior score?",
      a: "Yes. The platform provides personalized recommendations for improvement. Common levers include: reducing trade frequency during low-conviction periods, taking planned breaks after consecutive losses, sticking to predefined position sizes, and journaling emotional states before and after each trade. As you implement these changes, your behavior score updates in near real-time."
    },
    {
      q: "What are the most common negative patterns?",
      a: "The most frequently detected patterns are: Revenge trading (35% of users), FOMO entries (28%), Overtrading (22%), Abandoning stop losses (18%), Moving targets (15%), and Hesitation entries (12%). These percentages come from aggregate, anonymized platform data across thousands of traders."
    },
    {
      q: "How does behavior tracking integrate with the journal?",
      a: "The behavior analysis engine uses your journal entries as a primary signal. When you tag an emotional state (e.g., 'anxious', 'overconfident', 'revengeful'), the platform correlates it with the corresponding trade outcome. Over time, it learns your emotional patterns and which states lead to your best and worst trades — turning your journal into a behavioral feedback loop."
    },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>BEHAVIOR ANALYSIS</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Behavior Analysis</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Understand the psychology behind your trading decisions. Behavior Analysis tracks patterns like revenge trading, 
          FOMO, and overtrading — then quantifies your discipline with a behavior score. Use these insights to build 
          the habits that separate consistently profitable traders from the rest.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/behavior`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            View My Behavior <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/playbook`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Strategy Playbook
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['What is Behavior Analysis?', '#what'],
            ['Behavior Score', '#score'],
            ['Negative Pattern Detection', '#patterns'],
            ['Using Insights to Improve', '#improve'],
            ['Behavior Dashboard', '#dashboard'],
            ['Behavior Trends Over Time', '#trends'],
            ['Team Behavior Insights', '#team'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* WHAT IS BEHAVIOR ANALYSIS */}
      <div id="what">
        <div className={eyebrowStyle}>DEFINITION</div>
        <h2 className="ref-h-section mt-2">What is Behavior Analysis?</h2>
        <div className={cardMain}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Brain className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">The Psychology of Your P&L</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Behavior Analysis is a data-driven approach to understanding the emotional and psychological patterns that drive your trading decisions. Every trade is influenced by mental state — fear, greed, revenge, overconfidence — and these states leave measurable fingerprints in your trading data.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
                {[
                  { title: "Pattern Recognition", desc: "The platform analyzes sequences of trades, timing, risk deviations, and journal tags to identify behavioral patterns automatically." },
                  { title: "Quantified Discipline", desc: "Your behavior score provides a single, objective measure of trading discipline — track it over time to see improvement." },
                  { title: "Actionable Feedback", desc: "Receive personalized recommendations from the Copilot that target your specific behavioral weaknesses." },
                ].map((s, i) => (
                  <div key={i} className={cardNested}>
                    <div className="font-medium text-[var(--qe-ref-text)]">{s.title}</div>
                    <div className="text-[var(--qe-ref-text-muted)] mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BEHAVIOR SCORE */}
      <div id="score">
        <div className={eyebrowStyle}>METRIC</div>
        <h2 className="ref-h-section mt-2">Behavior Score</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>How the Score is Calculated</div>
            </div>
            <p className={bodySmall}>The behavior score (0-100) is a weighted composite of five dimensions: Plan Adherence (25%) — did you follow your entry/exit plan? Risk Consistency (20%) — is your position sizing stable? Emotional Neutrality (20%) — what emotional states do you journal? Recovery Behavior (20%) — how do you act after a loss? Trade Frequency (15%) — are you trading within your optimal cadence? Each dimension is scored independently and aggregated into your overall score.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Score Tiers & Benchmarks</div>
            </div>
            <p className={bodySmall}>90-100: Elite discipline — consistent rule-based trading. 75-89: Strong — minor deviations, well-managed. 50-74: Developing — noticeable patterns that need work. Below 50: High risk — significant behavioral issues impacting P&L. Benchmarks are calibrated against anonymized aggregate data from traders on the platform. Your score updates after every closed trade.</p>
          </div>
        </div>
      </div>

      {/* NEGATIVE PATTERN DETECTION */}
      <div id="patterns">
        <div className={eyebrowStyle}>DETECTION</div>
        <h2 className="ref-h-section mt-2">Negative Pattern Detection</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: AlertTriangle, name: "Revenge Trading", desc: "Detected when a larger-than-average position is opened within 3 trades of a significant loss, especially with matching instrument direction. The Copilot flags these and correlates them with lower average R-multiples." },
            { icon: Eye, name: "FOMO Entries", desc: "Identified by entries near session highs, late breakouts with declining volume, or trades taken after a sharp move without pullback. These trades statistically show lower win rates and higher drawdowns." },
            { icon: RefreshCw, name: "Overtrading", desc: "Flagged when trade frequency exceeds your optimal range (learned from your historical best performance). Includes churning (multiple quick trades in the same direction) and trading during low-probability market conditions." },
          ].map((r, i) => (
            <div key={i} className={cardMain}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                <r.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{r.name}</div>
              <p className={bodySmall + ' mt-2'}>{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
          <div className="font-medium mb-2">Additional Patterns Detected</div>
          <div className="grid gap-2 md:grid-cols-4 text-xs">
            {[
              { label: "Stop Abandonment", value: "Closing trades manually when price approaches stop loss, or widening stops beyond original plan" },
              { label: "Moving Targets", value: "Holding past original take-profit level; letting a winner turn into a loser" },
              { label: "Hesitation Entries", value: "Entering significantly later than planned, catching the tail end of a move" },
              { label: "Overconfidence Cycle", value: "Increasing position size after a win streak, followed by outsized losses" },
            ].map((f, i) => (
              <div key={i} className={cardNested}>
                <div className="font-medium text-[var(--qe-ref-green)]">{f.label}</div>
                <div className="text-[var(--qe-ref-text-muted)] mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* USING INSIGHTS TO IMPROVE */}
      <div id="improve">
        <div className={eyebrowStyle}>ACTION</div>
        <h2 className="ref-h-section mt-2">Using Insights to Improve</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          Behavior insights are only valuable if they lead to change. The platform provides structured paths to turn awareness into better trading habits.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Copilot Recommendations</div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                "Personalized alerts when a pattern is detected mid-session",
                "Pre-trade checklist reminders based on your weak areas",
                "Post-session behavior recap with actionable next steps",
                "Weekly trend report showing improvement or regression",
                "Suggested journaling prompts targeting detected patterns",
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2">
                  <Check className="h-3 w-3 text-[var(--qe-ref-green)] shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Building New Habits</div>
            <p className={bodySmall + ' mt-2'}>The platform supports habit formation through: automated trade limits (pause trading after configurable loss limits or consecutive losses), mandatory journaling prompts before high-risk setups, a cool-down timer after detected revenge trading, and streak tracking for positive behaviors like 'trades with planned stop' and 'days without overtrading.'</p>
          </div>
        </div>
      </div>

      {/* BEHAVIOR DASHBOARD */}
      <div id="dashboard">
        <div className={eyebrowStyle}>ANALYTICS</div>
        <h2 className="ref-h-section mt-2">Behavior Dashboard</h2>
        <div className={cardMain}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Activity className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Your Behavioral Control Center</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">The Behavior Dashboard is your central hub for all behavioral data. It displays your current score with a historical trend chart, top detected patterns with frequency counts, the largest behavioral impacts on your P&L over the selected period, and a daily breakdown of plan adherence. Each detected pattern links to the specific trades where it occurred so you can review and learn from each instance.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
                {[
                  { title: "Pattern Timeline", desc: "See when specific behaviors surfaced and how they correlated with P&L drawdowns or recoveries." },
                  { title: "Score Breakdown", desc: "View each dimension (plan adherence, risk consistency, etc.) scored independently to pinpoint weak areas." },
                  { title: "Session Reviews", desc: "End-of-day behavior summaries that highlight what went well and what needs attention." },
                ].map((s, i) => (
                  <div key={i} className={cardNested}>
                    <div className="font-medium text-[var(--qe-ref-text)]">{s.title}</div>
                    <div className="text-[var(--qe-ref-text-muted)] mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BEHAVIOR TRENDS */}
      <div id="trends">
        <div className={eyebrowStyle}>EVOLUTION</div>
        <h2 className="ref-h-section mt-2">Behavior Trends Over Time</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Tracking Long-Term Change</div>
            </div>
            <p className={bodySmall}>Behavioral change is a journey. The platform tracks your score weekly, monthly, and quarterly to show the trajectory of your discipline. View a multi-month chart with key events annotated (e.g., 'started journaling', 'implemented trade limits'). Compare your current 30-day average to your lifetime average to gauge real improvement. The Copilot provides trend summaries: "Your plan adherence has improved 15% since you started using the pre-trade checklist."</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Setting Behavior Goals</div>
            </div>
            <p className={bodySmall}>Set monthly behavior goals (e.g., "Score above 80 for 30 consecutive days", "Zero revenge trading detections this week", "Maintain 90%+ plan adherence"). The platform tracks progress and sends milestone notifications. Goals are integrated with the dashboard so you see your current target and distance to goal at all times.</p>
          </div>
        </div>
      </div>

      {/* TEAM BEHAVIOR INSIGHTS */}
      <div id="team">
        <div className={eyebrowStyle}>COLLABORATION</div>
        <h2 className="ref-h-section mt-2">Team Behavior Insights</h2>
        <div className={cardMain}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><BarChart3 className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Aggregated Behavioral Analytics for Teams</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">For team and prop firm accounts, behavior analysis extends to the group level. Managers can view aggregate behavior trends across the team, identify traders who may need coaching (e.g., elevated revenge trading risk), and benchmark individual behavior scores against team averages. Individual behavioral data remains private — managers see patterns and trends, not individual trade logs.</p>
            </div>
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
        <div className="text-lg font-semibold tracking-tight">Know your patterns. Master your mind.</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Behavior awareness is the first step to consistent profitability. Start tracking your trading psychology today.</p>
        <Link href={`/${locale}/docs/playbook`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Strategy Playbook <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/journal`} className="underline underline-offset-2 hover:no-underline">Trade Journal</Link> • <Link href={`/${locale}/docs/analytics`} className="underline underline-offset-2 hover:no-underline">Analytics</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Behavior Analysis turns trading psychology from an abstract concept into a measurable, improvable skill.</div>
    </div>
  )
}
