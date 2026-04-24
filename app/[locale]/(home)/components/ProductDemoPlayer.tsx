'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from 'motion/react'

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
  loading: () => <StaticDemoPreview label="Loading walkthrough" />,
})

const QuntEdgeDemo = dynamic(() => import('./remotion/QuntEdgeDemo'), {
  ssr: false,
})

const TOTAL_FRAMES = 540
const FPS = 30

export default function ProductDemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const reducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin: '160px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="aspect-video w-full bg-black">
      {isVisible && !reducedMotion ? (
        <Player
          component={QuntEdgeDemo}
          durationInFrames={TOTAL_FRAMES}
          compositionWidth={1280}
          compositionHeight={720}
          fps={FPS}
          autoPlay
          loop
          initiallyMuted
          controls={false}
          clickToPlay={false}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <StaticDemoPreview
          label={reducedMotion ? 'Reduced motion preview' : 'Product walkthrough'}
        />
      )}
    </div>
  )
}

function StaticDemoPreview({ label }: { label: string }) {
  const bars = [45, 58, 52, 66, 78, 72, 84, 88, 76, 92]

  return (
    <div className="flex h-full w-full flex-col bg-[oklch(0_0_0)] p-5 sm:p-8">
      <div className="flex items-center justify-between border-b border-[oklch(0.65_0.22_260_/_0.08)] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
            Qunt Edge
          </p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground">{label}</p>
        </div>
        <span className="rounded-full border border-[oklch(0.65_0.22_260_/_0.1)] bg-[oklch(0.65_0.22_260_/_0.07)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Audit loop
        </span>
      </div>
      <div className="grid flex-1 gap-4 pt-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.056_0.01_260_/_0.76)] p-4">
          <div className="flex h-full items-end gap-2">
            {bars.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t-md bg-primary/70"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {['Imported trades', 'Behavior drift', 'AI debrief'].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.056_0.01_260_/_0.76)] p-4"
            >
              <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">{item}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Review signal ready for the next session.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
