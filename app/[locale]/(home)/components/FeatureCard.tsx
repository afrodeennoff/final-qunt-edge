'use client'

import React from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}

export default function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="ref-feature-card border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] rounded-2xl p-5">
      <div className="ref-feature-icon mb-4">
        {icon}
      </div>
      <div className="flex items-start justify-between">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--qe-ref-text)] leading-tight pr-2">
          {title}
        </h3>
        {badge && (
          <span className="shrink-0 rounded-full bg-[var(--qe-ref-green)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--qe-ref-green)]">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]">
        {description}
      </p>
    </div>
  )
}
