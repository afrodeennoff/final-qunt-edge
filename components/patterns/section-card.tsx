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
      className={cn('rounded-2xl p-6 bg-card border-0', className)}
      data-slot="section-card"
    >
      {title && (
        <h3 className="text-[18px] font-black text-foreground mb-6">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}