'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

const SCENES = [
  { label: 'Connect', startFrame: 0, endFrame: 149 },
  { label: 'Performance', startFrame: 150, endFrame: 299 },
  { label: 'Execution', startFrame: 300, endFrame: 419 },
  { label: 'AI Insights', startFrame: 420, endFrame: 539 },
] as const

function getActiveSceneIndex(frame: number): number {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (frame >= SCENES[i].startFrame) return i
  }
  return 0
}

export default function ProductDemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<import('@remotion/player').PlayerRef | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentFrame, setCurrentFrame] = useState(0)
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

  // Listen to player timeupdate for step indicators
  useEffect(() => {
    const ref = playerRef.current
    if (!ref || !isVisible || reducedMotion) return

    const onTimeUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame)
    }
    const onPlay = (_e: { detail: undefined }) => setIsPlaying(true)
    const onPause = (_e: { detail: undefined }) => setIsPlaying(false)

    ref.addEventListener('timeupdate', onTimeUpdate)
    ref.addEventListener('play', onPlay)
    ref.addEventListener('pause', onPause)

    return () => {
      ref.removeEventListener('timeupdate', onTimeUpdate)
      ref.removeEventListener('play', onPlay)
      ref.removeEventListener('pause', onPause)
    }
  }, [isVisible, reducedMotion])

  const togglePlayPause = useCallback(() => {
    const ref = playerRef.current
    if (!ref) return
    if (ref.isPlaying()) {
      ref.pause()
    } else {
      ref.play()
    }
  }, [])

  const activeScene = getActiveSceneIndex(currentFrame)

  return (
    <div className="space-y-5">
      {/* Player area */}
      <div ref={containerRef} className="aspect-video w-full bg-black">
        {isVisible && !reducedMotion ? (
          <div className="relative h-full w-full">
            <Player
              ref={playerRef}
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
            {/* Play/Pause toggle */}
            <button
              type="button"
              onClick={togglePlayPause}
              className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.056_0.01_260_/_0.9)] text-white/70 shadow-md transition-colors hover:bg-[oklch(0.07_0.012_260_/_0.95)] hover:text-white"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <StaticDemoPreview
            label={reducedMotion ? 'Reduced motion preview' : 'Product walkthrough'}
          />
        )}
      </div>

      {/* Step indicators */}
      {isVisible && !reducedMotion && (
        <div className="flex items-start justify-center gap-6 sm:gap-10">
          {SCENES.map((scene, i) => {
            const isActive = i === activeScene
            return (
              <button
                key={scene.label}
                type="button"
                className="flex flex-col items-center gap-2 bg-transparent p-0"
                onClick={() => {
                  const ref = playerRef.current
                  if (ref) {
                    ref.seekTo(scene.startFrame)
                  }
                }}
                aria-label={`Go to step ${i + 1}: ${scene.label}`}
              >
                {/* Dot */}
                <span
                  className={`block h-2 w-2 rounded-full transition-colors duration-300 ${
                    isActive
                      ? 'bg-[oklch(0.65_0.22_260)]'
                      : 'bg-[oklch(0.65_0.22_260_/_0.08)]'
                  }`}
                />
                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-[oklch(0.64_0_0)]'
                      : 'text-[oklch(0.46_0_0)]'
                  }`}
                >
                  {scene.label}
                </span>
              </button>
            )
          })}
        </div>
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
