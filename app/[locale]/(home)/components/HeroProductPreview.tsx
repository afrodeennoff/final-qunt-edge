'use client'

import React from 'react'

export default function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] scale-[0.92] sm:scale-100">
      {/* Top floating AI Pulse card — reference style compact score panel */}
      <div className="ref-app-window absolute -right-1 -top-2 z-20 w-[158px] scale-[0.94] shadow-2xl border border-[var(--qe-ref-card-border)]">
        <div className="ref-app-header px-3 h-7">
          <div className="text-[9px] font-semibold tracking-[0.14em] text-[var(--qe-ref-text-muted)]">AI PULSE</div>
        </div>
        <div className="p-2.5 space-y-1 text-[10px]">
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
          <div className="pt-0.5 text-center text-[9px] font-medium text-[var(--qe-ref-green)]">OVERALL 82 • ELITE</div>
        </div>
      </div>

      {/* Main Live Edge / Portfolio card — dense reference style */}
      <div className="ref-app-window relative z-10">
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
            <svg width="100%" height="58" viewBox="0 0 260 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 44 L28 37 L52 39 L76 24 L100 28 L124 15 L148 20 L172 8 L196 13 L220 2 L244 5 L258 -1" stroke="var(--qe-ref-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 44 L28 37 L52 39 L76 24 L100 28 L124 15 L148 20 L172 8 L196 13 L220 2 L244 5 L258 -1" stroke="var(--qe-ref-green)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.18"/>
            </svg>
          </div>

          <div className="mt-1.5 flex justify-between text-[11px]">
            <div className="text-[var(--qe-ref-text-muted)]">R-Multiple <span className="font-semibold text-[var(--qe-ref-text)] tabular-nums">2.8R</span></div>
            <div className="ref-green">+3.4%</div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Reviews list — styled exactly like reference transaction list */}
      <div className="ref-app-window mt-3 z-10">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--qe-ref-text-muted)] border-b border-[var(--qe-ref-card-border)]">
          RECENT REVIEWS
        </div>
        <div className="divide-y divide-[var(--qe-ref-card-border)] text-[11px]">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[var(--qe-ref-text-muted)]">Debrief • NQ Long</span>
            <span className="ref-green font-medium tabular-nums">+2.8R</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[var(--qe-ref-text-muted)]">Pulse Score Update</span>
            <span className="font-medium tabular-nums text-[var(--qe-ref-text)]">82 → 87</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[var(--qe-ref-text-muted)]">Sentinel Alert</span>
            <span className="text-amber-400 font-medium">2 rules active</span>
          </div>
        </div>
        <div className="px-3 py-2 text-[10px] text-[var(--qe-ref-text-muted)] border-t border-[var(--qe-ref-card-border)]">
          Confidence in pattern: 94%
        </div>
      </div>

      {/* Thin vertical AI Agent visual sidebar — exact reference density */}
      <div className="absolute -right-8 top-6 z-0 w-[54px] rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] py-2 text-[9px] text-[var(--qe-ref-text-muted)] hidden lg:block">
        <div className="px-2 py-1 text-[var(--qe-ref-green)] font-medium tracking-wider">PULSE</div>
        <div className="px-2 py-1">DEBRIEF</div>
        <div className="px-2 py-1">SENTINEL</div>
        <div className="px-2 py-1">JOURNAL</div>
        <div className="px-2 pt-2 mt-1 border-t border-[var(--qe-ref-card-border)] text-[8px] tracking-[0.1em]">AI LIVE</div>
      </div>
    </div>
  )
}
