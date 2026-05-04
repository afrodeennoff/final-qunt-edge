'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UpdatesNavigationProps {
  previous: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  locale: string
  position?: 'top' | 'bottom'
}

const labels = {
  en: { newer: 'Newer', older: 'Older' },
  fr: { newer: 'Plus récent', older: 'Plus ancien' },
} as const

export function UpdatesNavigation({ previous, next, locale, position = 'bottom' }: UpdatesNavigationProps) {
  if (!previous && !next) {
    return null
  }

  const t = labels[locale as keyof typeof labels] || labels.en

  return (
    <nav
      className={`grid grid-cols-2 gap-4 ${position === 'top' ? 'mb-8' : 'mt-8'}`}
      aria-label="Update navigation"
    >
      <div className="min-w-0">
        {next ? (
          <Link
            href={`/${locale}/updates/${next.slug}`}
            className="group flex flex-col gap-1.5 rounded-xl border border-[rgba(0,0,0,0.05)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] p-4 transition-[background-color,border-color,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgba(0,0,0,0.08)] hover:bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)]"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ChevronLeft className="h-3.5 w-3.5" />
              {t.newer}
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1 transition-[color] duration-200 group-hover:text-foreground">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="min-w-0">
        {previous ? (
          <Link
            href={`/${locale}/updates/${previous.slug}`}
            className="group flex flex-col items-end gap-1.5 rounded-xl border border-[rgba(0,0,0,0.05)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] p-4 transition-[background-color,border-color,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgba(0,0,0,0.08)] hover:bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)]"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t.older}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1 text-right transition-[color] duration-200 group-hover:text-foreground">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}
