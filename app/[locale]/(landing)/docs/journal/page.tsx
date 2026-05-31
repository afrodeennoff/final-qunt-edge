'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  FileText, Brain, Camera, Tag, Smile, Calendar, Target, ArrowRight,
  Check, Star, MessageCircle, TrendingUp, Shield, BarChart3, Clock,
  GripVertical, Pen, Image, Sparkles
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'

export default function DocsJournalPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How long does it take to journal a trade?",
      a: "30-60 seconds per trade once you are in the flow. Pre-trade notes can be written before entry. Post-trade review takes under 30 seconds with the template system. The Copilot can auto-generate suggested notes based on your trade data."
    },
    {
      q: "Can I journal trades in bulk?",
      a: "Yes — use the batch journal feature from the Trade Log. Select multiple trades and add a common post-trade note or tag them with the same setup. Individual trades can then be expanded for detailed notes."
    },
    {
      q: "Are screenshots stored securely?",
      a: "All screenshots are uploaded to secure cloud storage with encryption at rest. Images are automatically compressed and optimized for fast loading. Maximum 10MB per image, 50 images per trade."
    },
    {
      q: "How does journaling improve the AI Copilot?",
      a: "Every note, emotion rating, and tag you add becomes context for the Copilot. The AI correlates your pre-trade intent with actual outcomes, maps emotional states to P&L, and surfaces patterns like 'you rated confidence 8+ but your win rate on those trades is only 40%.'"
    },
  ]

  const journalFields = [
    { icon: Pen, name: "Pre-Trade Notes", desc: "Your analysis, plan, and reasoning before entering the trade. Capture the thesis — what you expect to happen and why. These notes anchor your post-trade review against your original intent." },
    { icon: FileText, name: "Post-Trade Review", desc: "What actually happened, what went right/wrong, and what you would change. Structured fields for execution quality, plan adherence, and lessons learned." },
    { icon: Smile, name: "Emotions & Mood", desc: "Visual emotion selector with 6 core states (focused, confident, anxious, frustrated, excited, neutral). Rate intensity 1-10. Track how emotional state correlates with P&L over time." },
    { icon: Star, name: "Confidence & Discipline Scores", desc: "Pre-trade confidence (1-10) and post-trade discipline score (1-10). The gap between these two is one of the most powerful metrics the Copilot tracks." },
    { icon: Tag, name: "Custom Tags & Categories", desc: "Organize setups with custom tags (breakout, reversal, scalp, momentum). Create tag groups (Setups, Mistakes, Market Conditions). Tags power every filter, statistic, and Copilot insight." },
    { icon: Image, name: "Screenshots & Attachments", desc: "Attach chart screenshots, trade plans, or any image. Up to 50 per trade. Thumbnails appear inline in the journal view. Full images open in a lightbox." },
    { icon: MessageCircle, name: "AI-Generated Notes", desc: "The Copilot can auto-generate a post-trade debrief based on the execution data and your pre-trade notes. Review, edit, and approve — or write your own." },
  ]

  return (
    <div className="qe-home-ref space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>TRADE JOURNAL</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">The Structured Trade Journal</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          The journal is where raw execution data becomes actionable intelligence. Pre-trade intent captures your thesis before the market moves. Post-trade reflection locks in the lesson. 
          Emotions, screenshots, and tags add the context that no broker statement can provide — and they power the AI Copilot.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/trades`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Open Trade Journal <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/analytics`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            AI Copilot Docs
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Journal Interface Overview', '#overview'],
            ['Every Journal Field', '#fields'],
            ['Pre-Trade vs Post-Trade', '#prepost'],
            ['Emotional Tracking & Mood', '#emotions'],
            ['Screenshots & Attachments', '#screenshots'],
            ['Tags & Categories', '#tags'],
            ['Calendar Integration', '#calendar'],
            ['How Journaling Powers Copilot', '#copilot'],
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
        <h2 className="ref-h-section mt-2">Journal Interface Overview</h2>
        <p className="ref-body mt-2 max-w-[65ch] text-[var(--qe-ref-text-muted)]">
          The journal lives at <strong>/dashboard/trades/journal</strong> and opens as a side-by-side view. The left panel shows the trade detail (instrument, P&L, entry/exit), and the right panel is the journal editor.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4 sm:p-6">
          <div className="text-center text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">JOURNAL INTERFACE</div>
          <svg viewBox="0 0 920 400" className="w-full h-auto max-h-[370px]" preserveAspectRatio="xMidYMid meet">
            <rect x="20" y="20" width="880" height="360" rx="16" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" strokeWidth="1" />

            {/* Left panel — Trade Details */}
            <rect x="35" y="35" width="380" height="330" rx="10" fill="var(--qe-ref-surface-2)" />
            <text x="55" y="55" fill="var(--qe-ref-green)" fontSize="10" fontWeight="600">TRADE DETAILS</text>

            <rect x="45" y="70" width="360" height="28" rx="4" fill="var(--qe-ref-card)" />
            <text x="55" y="88" fill="var(--qe-ref-text-muted)" fontSize="9">ESM6 • LONG • 2 Contracts</text>
            <text x="350" y="88" fill="var(--qe-ref-green)" fontSize="12" fontWeight="700" textAnchor="end">+$640</text>

            <rect x="45" y="105" width="170" height="50" rx="5" fill="var(--qe-ref-card)" />
            <text x="55" y="120" fill="var(--qe-ref-text-muted)" fontSize="8">ENTRY</text>
            <text x="55" y="140" fill="var(--qe-ref-text)" fontSize="12" fontWeight="600">5,540.25</text>
            <text x="130" y="140" fill="var(--qe-ref-text-muted)" fontSize="9">09:31:15</text>

            <rect x="225" y="105" width="175" height="50" rx="5" fill="var(--qe-ref-card)" />
            <text x="235" y="120" fill="var(--qe-ref-text-muted)" fontSize="8">EXIT</text>
            <text x="235" y="140" fill="var(--qe-ref-text)" fontSize="12" fontWeight="600">5,556.50</text>
            <text x="310" y="140" fill="var(--qe-ref-text-muted)" fontSize="9">10:47:03</text>

            <rect x="45" y="165" width="360" height="40" rx="5" fill="var(--qe-ref-card)" />
            <text x="55" y="180" fill="var(--qe-ref-text-muted)" fontSize="8">METRICS</text>
            <text x="55" y="195" fill="var(--qe-ref-text)" fontSize="9">Duration: 1h16m</text>
            <text x="200" y="195" fill="var(--qe-ref-text)" fontSize="9">R:R: 1.8</text>
            <text x="310" y="195" fill="var(--qe-ref-text)" fontSize="9">Commission: $4.20</text>

            {/* Tags preview */}
            <rect x="45" y="215" width="360" height="55" rx="5" fill="var(--qe-ref-card)" />
            <text x="55" y="230" fill="var(--qe-ref-text-muted)" fontSize="8">TAGS</text>
            <rect x="55" y="240" width="50" height="18" rx="3" fill="rgba(0,255,159,0.15)" />
            <text x="80" y="253" fill="var(--qe-ref-green)" fontSize="8" textAnchor="middle">breakout</text>
            <rect x="112" y="240" width="60" height="18" rx="3" fill="rgba(99,102,241,0.15)" />
            <text x="142" y="253" fill="#818cf8" fontSize="8" textAnchor="middle">momentum</text>
            <rect x="180" y="240" width="40" height="18" rx="3" fill="rgba(255,159,0,0.15)" />
            <text x="200" y="253" fill="#fbbf24" fontSize="8" textAnchor="middle">ES</text>

            {/* Screenshot thumb */}
            <rect x="45" y="280" width="80" height="60" rx="4" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" />
            <text x="85" y="310" fill="var(--qe-ref-text-muted)" fontSize="12" textAnchor="middle">📷</text>
            <rect x="135" y="280" width="80" height="60" rx="4" fill="var(--qe-ref-card)" stroke="var(--qe-ref-card-border)" />
            <text x="175" y="310" fill="var(--qe-ref-text-muted)" fontSize="12" textAnchor="middle">📷</text>

            {/* Right panel — Journal Editor */}
            <rect x="430" y="35" width="470" height="330" rx="10" fill="var(--qe-ref-surface-2)" />
            <text x="450" y="55" fill="var(--qe-ref-green)" fontSize="10" fontWeight="600">JOURNAL EDITOR</text>

            {/* Pre trade notes */}
            <rect x="440" y="68" width="450" height="80" rx="6" fill="var(--qe-ref-card)" />
            <text x="450" y="82" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">Pre-Trade Notes</text>
            <text x="450" y="98" fill="var(--qe-ref-text-muted)" fontSize="8">"Break above 5540 resistance with volume. Expecting continuation to 5575. Stop at 5530. Risk $200 for $700 target — good R:R."</text>
            <text x="450" y="118" fill="var(--qe-ref-text-muted)" fontSize="8">Confidence: 7/10 • Setup: Breakout • Bias: Bullish</text>

            {/* Emotion selector */}
            <rect x="440" y="156" width="450" height="44" rx="6" fill="var(--qe-ref-card)" />
            <text x="450" y="170" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">How did you feel?</text>
            {[0,1,2,3,4,5].map(i => (
              <rect key={i} x={450 + i*36} y="178" width="30" height="18" rx="3" fill={i === 2 ? 'rgba(99,102,241,0.2)' : 'var(--qe-ref-surface-2)'} />
            ))}

            {/* Post trade */}
            <rect x="440" y="208" width="450" height="80" rx="6" fill="var(--qe-ref-card)" />
            <text x="450" y="222" fill="var(--qe-ref-text)" fontSize="9" fontWeight="600">Post-Trade Review</text>
            <text x="450" y="238" fill="var(--qe-ref-text-muted)" fontSize="8">"Executed well. Entry was clean on the breakout candle. Held through pullback as planned. Exit at target. Discipline: 8/10 — followed the plan exactly."</text>

            {/* AI suggestions */}
            <rect x="440" y="296" width="450" height="55" rx="6" fill="rgba(0,255,159,0.06)" stroke="rgba(0,255,159,0.15)" />
            <text x="450" y="310" fill="var(--qe-ref-green)" fontSize="9" fontWeight="600">✨ Copilot Suggestion</text>
            <text x="450" y="326" fill="var(--qe-ref-text-muted)" fontSize="8">"Your last 5 breakout trades on ES have an 80% win rate. This setup is outperforming your reversal plays by 23%."</text>

            {/* Save button */}
            <rect x="820" y="298" width="70" height="20" rx="4" fill="rgba(0,255,159,0.15)" />
            <text x="855" y="312" fill="var(--qe-ref-green)" fontSize="9" textAnchor="middle" fontWeight="600">SAVE</text>
          </svg>
          <p className="text-center text-[11px] text-[var(--qe-ref-text-muted)] mt-2">Left: trade details with metrics, tags, and screenshots. Right: journal editor with pre/post notes, emotion selector, and AI suggestions.</p>
        </div>
      </div>

      {/* FIELDS */}
      <div id="fields">
        <div className={eyebrowStyle}>DETAILED FIELDS</div>
        <h2 className="ref-h-section mt-2">Every Journal Field</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {journalFields.map((f, i) => (
            <div key={i} className={cardMain}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] mb-3">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <div className={headingCard}>{f.name}</div>
              <p className={bodySmall + ' mt-2'}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRE VS POST */}
      <div id="prepost">
        <div className={eyebrowStyle}>THE TWO PILLARS</div>
        <h2 className="ref-h-section mt-2">Pre-Trade vs Post-Trade</h2>
        <p className="ref-body mt-2 max-w-[70ch] text-[var(--qe-ref-text-muted)]">
          The distinction between pre-trade and post-trade is the single most important concept in behavioral journaling. 
          Pre-trade captures your intention. Post-trade captures the outcome. The gap between them is where the learning lives.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Pen className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Pre-Trade Notes</div>
            </div>
            <p className={bodySmall}>Written <strong>before</strong> the trade is entered. Include your analysis, the specific setup you see, your entry/exit plan, risk parameters, and confidence level. Pre-trade notes are timestamped and immutable — once saved, they cannot be edited to prevent revisionist bias.</p>
            <div className="mt-3 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs text-[var(--qe-ref-text-muted)]">
              Pre-trade notes are the #1 predictor of journaling ROI. Traders who write them see 40% higher review consistency.
            </div>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[var(--qe-ref-green)]" />
              <div className={headingCard}>Post-Trade Review</div>
            </div>
            <p className={bodySmall}>Written <strong>after</strong> the trade is closed. Compare outcome vs plan. Rate your discipline honestly. Note what you did well and what you would change. Post-trade reviews are editable to refine insights as you gain perspective.</p>
            <div className="mt-3 rounded-lg bg-[var(--qe-ref-surface-2)] p-3 text-xs text-[var(--qe-ref-text-muted)]">
              The Copilot compares your pre-trade confidence vs actual outcome. A recurring gap here is a behavioral red flag the AI will flag.
            </div>
          </div>
        </div>
      </div>

      {/* EMOTIONS */}
      <div id="emotions">
        <div className={eyebrowStyle}>BEHAVIORAL DATA</div>
        <h2 className="ref-h-section mt-2">Emotional Tracking &amp; Mood</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Emotion States</div>
            <p className={bodySmall + ' mt-2'}>Select from 6 core emotional states with intensity sliders:</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {[
                { emoji: "🎯", label: "Focused", color: "text-emerald-400" },
                { emoji: "💪", label: "Confident", color: "text-blue-400" },
                { emoji: "😰", label: "Anxious", color: "text-amber-400" },
                { emoji: "😤", label: "Frustrated", color: "text-red-400" },
                { emoji: "⚡", label: "Excited", color: "text-purple-400" },
                { emoji: "😐", label: "Neutral", color: "text-gray-400" },
              ].map((e, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg bg-[var(--qe-ref-surface-2)] p-2 ${e.color}`}>
                  <span className="text-base">{e.emoji}</span>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Mood Timeline &amp; Calendar</div>
            <p className={bodySmall + ' mt-2'}>Every emotion log creates a data point on the Mood Timeline — a heatmap overlay on the P&L calendar. See at a glance which emotional states precede your best and worst trading days. The Copilot analyzes patterns like "Frustrated → revenge trade → loss" or "Confident → disciplined → win."</p>
            <Link href={`/${locale}/docs/behavior`} className="mt-3 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Learn about Behavioral Analysis →</Link>
          </div>
        </div>
      </div>

      {/* SCREENSHOTS */}
      <div id="screenshots">
        <div className={eyebrowStyle}>VISUAL CONTEXT</div>
        <h2 className="ref-h-section mt-2">Screenshots &amp; Attachments</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className={cardMain}>
            <div className="headingCard">Chart Screenshots</div>
            <p className={bodySmall + ' mt-2'}>Upload your entry chart, exit chart, or any analysis image. Drag-and-drop or paste from clipboard. Images are automatically compressed to WebP for fast loading. Each trade supports up to 50 screenshots.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Image Viewer</div>
            <p className={bodySmall + ' mt-2'}>Thumbnails appear inline in the journal. Click any to open the full lightbox viewer with zoom, pan, and fullscreen. Navigate between images with keyboard arrows. Right-click to download original resolution.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Screenshot Management</div>
            <p className={bodySmall + ' mt-2'}>Rename, reorder, or delete screenshots. Add captions to each image. Copy images from one trade to another. Use screenshots as evidence in your post-trade review — a picture of a bad entry tells a story numbers alone cannot.</p>
          </div>
        </div>
      </div>

      {/* TAGS */}
      <div id="tags">
        <div className={eyebrowStyle}>ORGANIZATION</div>
        <h2 className="ref-h-section mt-2">Tags &amp; Categories</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">Creating &amp; Using Tags</div>
            <p className={bodySmall + ' mt-2'}>Tags are freeform text labels with optional color coding. Create them on the fly while journaling or from the Tag Manager in Settings. Common tag categories include: Setup Type (breakout, reversal, scalp), Mistake (fomo, revenge, overtrade), Market Condition (trending, ranging, news-driven). Type to search existing tags or press Enter to create a new one.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">Tag Groups &amp; Tab Organization</div>
            <p className={bodySmall + ' mt-2'}>Organize tags into tabbed groups in the journal editor. For example, create a "Setups" tab with your strategy tags, a "Mistakes" tab for behavioral tags, and a "Market" tab for conditions. This keeps the journal editor clean and fast — you only see the tags relevant to the current journaling moment.</p>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div id="calendar">
        <div className={eyebrowStyle}>TIME-BASED REVIEW</div>
        <h2 className="ref-h-section mt-2">Calendar Integration</h2>
        <div className={cardMain}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Calendar className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">The P&L Calendar + Mood Overlay</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">
                Every journal entry — emotions, tags, pre/post notes — is mapped to the P&L Calendar. This is the heatmap widget on the Dashboard that shows daily P&L with color intensity. Hover any day to see a summary: P&L, trade count, notes, and emotional state. Click a day to filter the entire dashboard to that session's trades.
              </p>
              <p className="text-sm text-[var(--qe-ref-text-muted]) mt-2">
                The calendar supports month-by-month navigation, weekly aggregates, and year-to-date views. Days with no journal entries are visually distinct from days with rich notes. This visual feedback encourages consistent journaling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COPILOT INTEGRATION */}
      <div id="copilot">
        <div className={eyebrowStyle}>AI INTEGRATION</div>
        <h2 className="ref-h-section mt-2">How Journaling Powers the Copilot</h2>

        <div className="mt-4 space-y-4">
          <div className={cardMain}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Brain className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Context for Every Insight</div>
                <p className="mt-1 text-sm text-[var(--qe-ref-text-muted])">Every note, emotion score, tag, and screenshot caption you add becomes part of the Copilot's context. When you ask "Why did my win rate drop this month?" the AI correlates your emotional state trends, pre-trade confidence levels, and tag distributions against P&L to find the real cause.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardMain}>
              <div className="font-semibold mb-1">AI Debrief Generation</div>
              <p className={bodySmall}>After a trading session, the Copilot can auto-generate a structured debrief that references your pre-trade notes against actual outcomes. It highlights trades where your plan was correct (intent matched outcome) and trades where it was not (plan violations, setup drift).</p>
            </div>
            <div className={cardMain}>
              <div className="font-semibold mb-1">Pattern Detection Across Notes</div>
              <p className={bodySmall}>The AI reads across all your journal entries to detect recurring patterns: "Your last 10 'breakout' trades on ES had a 70% win rate, but your 'reversal' trades on NQ only 30%." These patterns are surfaced in Smart Insights on the Dashboard.</p>
            </div>
          </div>

          <div className={cardMain}>
            <div className="font-semibold mb-1">Suggested Journals</div>
            <p className={bodySmall}>The Copilot can suggest pre-fill journal entries based on your trade data and historical patterns. For example, if you consistently journal "Breakout above resistance, high volume" for similar setups, the AI will offer that as a draft pre-trade note. Review, edit, and approve in one click.</p>
            <Link href={`/${locale}/docs/analytics`} className="mt-2 inline-flex text-xs text-[var(--qe-ref-green)] hover:underline">Read full Analytics &amp; Copilot documentation →</Link>
          </div>
        </div>
      </div>

      {/* WORKFLOW */}
      <div>
        <div className={eyebrowStyle}>WORKFLOW</div>
        <h2 className="ref-h-section mt-2">Building the Journaling Habit</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          {[
            "Pre-Trade First: Write one sentence before every entry. \"ES breakout above 5540\" takes 5 seconds and anchors your review. Start with just 1 pre-trade note per day.",
            "Post-Trade in 30 Seconds: After closing, rate discipline 1-10, pick an emotion, and write one sentence on what you would change. Templates make this even faster.",
            "Weekly Review: Use the Calendar to scan your week. Click red days, read the notes, check emotions. The Copilot will highlight patterns you missed. This 5-minute habit compounds dramatically.",
          ].map((tip, i) => (
            <div key={i} className={cardNested}>
              <div className="text-[10px] text-[var(--qe-ref-green)] font-semibold tracking-widest mb-1">HABIT {i+1}</div>
              {tip}
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
        <div className="text-lg font-semibold tracking-tight">Start journaling with intent</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Your first pre-trade note takes 10 seconds. The insight lasts a career.</p>
        <Link href={`/${locale}/docs/analytics`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Analytics &amp; Copilot <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/trade-log`} className="underline underline-offset-2 hover:no-underline">Trade Log</Link> • <Link href={`/${locale}/docs/behavior`} className="underline underline-offset-2 hover:no-underline">Behavioral Analysis</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">The Trade Journal powers every Copilot insight, behavioral analysis, and compliance report.</div>
    </div>
  )
}
