"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type BackgroundGlowVariant = "default" | "accent"

interface BackgroundGlowProps {
  className?: string
  variant?: BackgroundGlowVariant
}

function AnimatedGridOverlay({ accent = false }: { accent?: boolean }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-[0.22]"
      viewBox="0 0 1440 960"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={accent ? 'qe-glow-line-accent' : 'qe-glow-line'} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={accent ? 'rgba(94,234,212,0.75)' : 'rgba(56,189,248,0.75)'} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {prefersReducedMotion ? (
        <>
          <path d="M-24 176C186 96 414 96 636 176C826 244 1018 260 1468 124" stroke={`url(#${accent ? 'qe-glow-line-accent' : 'qe-glow-line'})`} strokeWidth="1.5" />
          <path d="M-40 612C184 500 362 470 566 542C804 628 1038 676 1490 534" stroke={`url(#${accent ? 'qe-glow-line-accent' : 'qe-glow-line'})`} strokeWidth="1.25" />
          <circle cx="1110" cy="226" r="92" stroke="rgba(148,163,184,0.28)" strokeDasharray="6 8" />
        </>
      ) : (
        <>
          <motion.path
            d="M-24 176C186 96 414 96 636 176C826 244 1018 260 1468 124"
            stroke={`url(#${accent ? 'qe-glow-line-accent' : 'qe-glow-line'})`}
            strokeWidth="1.5"
            initial={{ pathLength: 0.25, opacity: 0.32 }}
            animate={{ pathLength: 1, opacity: [0.22, 0.58, 0.22] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-40 612C184 500 362 470 566 542C804 628 1038 676 1490 534"
            stroke={`url(#${accent ? 'qe-glow-line-accent' : 'qe-glow-line'})`}
            strokeWidth="1.25"
            initial={{ pathLength: 0.2, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: [0.16, 0.42, 0.16] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          />
          <motion.circle
            cx="1110"
            cy="226"
            r="92"
            stroke="rgba(148,163,184,0.28)"
            strokeDasharray="6 8"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '1110px 226px' }}
          />
          <motion.circle
            cx="310"
            cy="700"
            r="54"
            stroke="rgba(56,189,248,0.22)"
            strokeDasharray="5 10"
            animate={{ rotate: -360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '310px 700px' }}
          />
        </>
      )}
    </svg>
  )
}

const BackgroundGlow = React.forwardRef<HTMLDivElement, BackgroundGlowProps>(
  ({ className, variant = "default" }, ref) => {
    if (variant === "accent") {
      return (
        <div
          ref={ref}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_82%_54%_at_50%_-16%,oklch(0.74_0.16_250/0.18),transparent_52%),radial-gradient(ellipse_64%_44%_at_85%_105%,oklch(0.64_0.16_286/0.14),transparent_52%)]"
            animate={{ opacity: [0.9, 1, 0.88], scale: [1, 1.03, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 opacity-[0.045]">
            <div className="absolute inset-0 bg-[linear-gradient(oklch(0.97_0_0/0.03)_1px,transparent_1px),linear-gradient(90deg,oklch(0.97_0_0/0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
          </div>
          <AnimatedGridOverlay accent />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-0 h-full w-full",
          className
        )}
      >
        <motion.div
          className="absolute left-[-10%] top-[-10%] h-[48%] w-[48%] rounded-full bg-primary/10 blur-[140px]"
          animate={{ x: [0, 18, 0], y: [0, -14, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-12%] right-[-10%] h-[44%] w-[44%] rounded-full bg-emerald-300/10 blur-[140px]"
          animate={{ x: [0, -20, 0], y: [0, 12, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <div className="absolute inset-0 opacity-[0.035] qe-v2-grid" />
        <AnimatedGridOverlay />
      </div>
    )
  }
)

BackgroundGlow.displayName = "BackgroundGlow"

export { BackgroundGlow }
export type { BackgroundGlowProps }
