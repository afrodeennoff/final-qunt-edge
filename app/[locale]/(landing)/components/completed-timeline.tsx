'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface TimelineItem {
  id: string
  title: string
  description: string
  completedDate: string
  status: 'completed' | 'in-progress' | 'upcoming'
  image?: string
  youtubeVideoId?: string
}

export default function CompletedTimeline({ milestones, locale }: { milestones: TimelineItem[], locale: string }) {
  const dateLocale = locale === 'fr' ? fr : enUS

  const completedMilestones = useMemo(() => {
    return milestones
      .filter(milestone => milestone.status === 'completed' && milestone.completedDate)
      .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
  }, [milestones])

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[rgba(0,0,0,0.07)]" />

      <div className="space-y-1">
        {completedMilestones.map((milestone) => (
          <Link
            key={milestone.id}
            href={`/${locale}/updates/${milestone.id}`}
            className="group relative flex gap-5 rounded-xl p-4 transition-[background-color,border-color,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(0,0,0,0.03)]"
          >
            {/* Timeline dot */}
            <div className="relative z-10 mt-1.5 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[rgba(0,0,0,0.06)] transition-[background-color] duration-200 group-hover:bg-[rgba(0,0,0,0.06)]" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <time className="mb-1 block text-xs font-medium tracking-wide text-muted-foreground">
                {format(new Date(milestone.completedDate), 'MMMM d, yyyy', { locale: dateLocale })}
              </time>
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground transition-[color] duration-200 group-hover:text-foreground">
                {milestone.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {milestone.description}
              </p>

              {locale === 'fr' && milestone.youtubeVideoId && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.06)]">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 h-full w-full"
                      src={`https://www.youtube.com/embed/${milestone.youtubeVideoId}`}
                      title={milestone.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {milestone.image && !milestone.youtubeVideoId && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.06)]">
                  <Image
                    src={milestone.image}
                    alt={milestone.title}
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
