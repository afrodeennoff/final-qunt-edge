import { cn } from './utils'
import React from 'react'

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({
  children,
  className,
}: PageContentProps) {
  return (
    <div
      className={cn('pb-24 space-y-6', className)}
      data-slot="page-content"
    >
      {children}
    </div>
  )
}