import { cn } from './utils'
import React from 'react'

interface SectionCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({
  title,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 bg-card shadow-card border border-[hsl(var(--border)/0.18)]', className)}
      data-slot="section-card"
    >
      {title && (
        <h3 className="text-[18px] font-bold text-foreground mb-6">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}