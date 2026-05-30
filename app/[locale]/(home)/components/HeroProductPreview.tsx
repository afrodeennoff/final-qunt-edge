'use client'

import React from 'react'

export default function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] scale-[0.92] sm:scale-100">
      {/* Main Journal Entry Panel */}
      <div className="ref-app-window">
        <div className="ref-app-header">
          <div className="dot" />
          <div className="dot" />
          <div className="dot green" />
          <div className="ml-auto text-[10px] font-medium tracking-[0.1em] text-[var(--qe-ref-text-muted)]">LIVE JOURNAL • NQ</div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-[var(--qe-ref-text-muted)]">NQ — LONG</div>
              <div className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--qe-ref-text)]">ES 5-lot Scalp</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.1em] text-[var(--qe-ref-text-muted)]">P&amp;L</div>
              <div className="ref-green tabular-nums text-[15px]">+$1,247.50</div>
            </div>
          </div>

          <div className="mt-2 ref-mini-chart rounded-md">
            <svg width="100%" height="62" viewBox="0 0 260 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 48 L28 41 L52 43 L76 28 L100 32 L124 19 L148 24 L172 12 L196 17 L220 6 L244 9 L258 3" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 48 L28 41 L52 43 L76 28 L100 32 L124 19 L148 24 L172 12 L196 17 L220 6 L244 9 L258 3" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.15"/>
            </svg>
          </div>

          <div className="mt-2 flex justify-between text-[11px]">
            <div className="text-[var(--qe-ref-text-muted)]">R-Multiple <span className="font-semibold text-[var(--qe-ref-text)] tabular-nums">2.8R</span></div>
            <div className="ref-green">+3.4%</div>
          </div>
        </div>
      </div>

      {/* AI Pulse Scores Panel (floating right) */}
      <div className="ref-app-window absolute -right-2 top-8 w-[168px] scale-[0.95] shadow-xl">
        <div className="ref-app-header px-3">
          <div className="text-[10px] font-semibold tracking-[0.12em] text-[var(--qe-ref-text-muted)]">AI PULSE</div>
        </div>
        <div className="p-3 space-y-2 text-[11px]">
          {[
            { label: 'PSY', val: '89' },
            { label: 'PLAN', val: '76' },
            { label: 'RISK', val: '91' },
            { label: 'EXEC', val: '71' },
            { label: 'CONS', val: '82' },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[var(--qe-ref-text-muted)]">{d.label}</span>
              <span className="font-semibold tabular-nums text-[var(--qe-ref-text)]">{d.val}</span>
            </div>
          ))}
          <div className="pt-1 text-center text-[10px] font-medium text-[var(--qe-ref-green)]">OVERALL 82 • ELITE</div>
        </div>
      </div>

      {/* Recent AI Insight Card (bottom) */}
      <div className="ref-app-window mt-3 w-[92%]">
        <div className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-[var(--qe-ref-text-muted)] border-b border-[var(--qe-ref-card-border)]">
          DEBRIEF INSIGHT
        </div>
        <div className="p-3 text-[12px] leading-[1.45] text-[var(--qe-ref-text)]">
          Your win rate jumps 27% when you wait for the first 15-min candle to close before entry. Confirmed across 142 sessions.
        </div>
        <div className="px-3 pb-3 text-[10px] text-[var(--qe-ref-text-muted)]">Confidence in pattern: 94%</div>
      </div>
    </div>
  )
}
