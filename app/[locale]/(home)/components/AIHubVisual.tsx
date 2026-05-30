'use client'

import React from 'react'

export default function AIHubVisual() {
  return (
    <div className="ref-ai-hub mx-auto">
      {/* Connecting lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 280 280" fill="none">
        <circle cx="140" cy="140" r="78" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
        <line x1="140" y1="62" x2="140" y2="98" stroke="var(--qe-ref-card-border)" strokeWidth="1.5" />
        <line x1="140" y1="182" x2="140" y2="218" stroke="var(--qe-ref-card-border)" strokeWidth="1.5" />
        <line x1="62" y1="140" x2="98" y2="140" stroke="var(--qe-ref-card-border)" strokeWidth="1.5" />
        <line x1="182" y1="140" x2="218" y2="140" stroke="var(--qe-ref-card-border)" strokeWidth="1.5" />
        <line x1="78" y1="78" x2="102" y2="102" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
        <line x1="202" y1="78" x2="178" y2="102" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
        <line x1="78" y1="202" x2="102" y2="178" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
        <line x1="202" y1="202" x2="178" y2="178" stroke="var(--qe-ref-card-border)" strokeWidth="1" />
      </svg>

      {/* Center hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)]">
        <div className="text-center">
          <div className="text-[10px] font-semibold tracking-[0.08em] text-[var(--qe-ref-green)]">QUNT</div>
          <div className="text-[9px] text-[var(--qe-ref-text-muted)] -mt-0.5">AI</div>
        </div>
      </div>

      {/* Nodes */}
      <div className="ref-ai-node" style={{ left: '50%', top: '8px', transform: 'translateX(-50%)' }}>
        <span>PULSE</span>
      </div>
      <div className="ref-ai-node" style={{ left: '50%', bottom: '8px', transform: 'translateX(-50%)' }}>
        <span>DEBRIEF</span>
      </div>
      <div className="ref-ai-node" style={{ left: '8px', top: '50%', transform: 'translateY(-50%)' }}>
        <span>SENTINEL</span>
      </div>
      <div className="ref-ai-node" style={{ right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
        <span>EDGE</span>
      </div>
    </div>
  )
}
