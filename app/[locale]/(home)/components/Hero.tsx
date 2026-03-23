'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentLocale } from '@/locales/client'

function AnimatedTradingSVG() {
  return (
    <svg
      viewBox="0 0 800 400"
      className="w-full h-auto max-w-3xl mx-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="candleUp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(150 30% 40%)" />
          <stop offset="100%" stopColor="hsl(150 30% 30%)" />
        </linearGradient>
        <linearGradient id="candleDown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(0 40% 35%)" />
          <stop offset="100%" stopColor="hsl(0 40% 25%)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[...Array(9)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={50 + i * 40}
          x2="800"
          y2={50 + i * 40}
          stroke="hsl(var(--border))"
          strokeOpacity="0.15"
          strokeWidth="0.5"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.1;0.2;0.1"
            dur={`${3 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
      {[...Array(17)].map((_, i) => (
        <line
          key={`v-${i}`}
          x1={50 + i * 45}
          y1="0"
          x2={50 + i * 45}
          y2="400"
          stroke="hsl(var(--border))"
          strokeOpacity="0.1"
          strokeWidth="0.5"
        />
      ))}

      {/* Animated candlesticks */}
      {[
        { x: 80, open: 220, close: 180, high: 160, low: 240, delay: 0 },
        { x: 130, open: 180, close: 200, high: 170, low: 220, delay: 0.2 },
        { x: 180, open: 200, close: 160, high: 150, low: 210, delay: 0.4 },
        { x: 230, open: 160, close: 140, high: 130, low: 180, delay: 0.6 },
        { x: 280, open: 140, close: 170, high: 135, low: 190, delay: 0.8 },
        { x: 330, open: 170, close: 130, high: 120, low: 180, delay: 1.0 },
        { x: 380, open: 130, close: 110, high: 100, low: 150, delay: 1.2 },
        { x: 430, open: 110, close: 90, high: 80, low: 130, delay: 1.4 },
        { x: 480, open: 90, close: 120, high: 85, low: 140, delay: 1.6 },
        { x: 530, open: 120, close: 100, high: 90, low: 130, delay: 1.8 },
        { x: 580, open: 100, close: 80, high: 70, low: 110, delay: 2.0 },
        { x: 630, open: 80, close: 60, high: 50, low: 90, delay: 2.2 },
        { x: 680, open: 60, close: 40, high: 30, low: 70, delay: 2.4 },
        { x: 730, open: 40, close: 20, high: 10, low: 50, delay: 2.6 },
      ].map((candle, i) => {
        const isUp = candle.close < candle.open
        const bodyTop = Math.min(candle.open, candle.close)
        const bodyHeight = Math.abs(candle.close - candle.open)
        return (
          <g key={i} opacity="0">
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.3s"
              begin={`${candle.delay}s`}
              fill="freeze"
            />
            {/* Wick */}
            <line
              x1={candle.x}
              y1={candle.high}
              x2={candle.x}
              y2={candle.low}
              stroke={isUp ? 'hsl(150 30% 40%)' : 'hsl(0 40% 35%)'}
              strokeWidth="1.5"
              opacity="0.7"
            />
            {/* Body */}
            <rect
              x={candle.x - 12}
              y={bodyTop}
              width="24"
              height={Math.max(bodyHeight, 4)}
              fill={isUp ? 'url(#candleUp)' : 'url(#candleDown)'}
              rx="2"
              opacity="0.85"
            />
          </g>
        )
      })}

      {/* Animated trend line */}
      <path
        d="M 80 200 Q 150 180 200 160 T 320 130 T 440 90 T 560 60 T 680 30 T 750 20"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        opacity="0.6"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="1200"
          to="0"
          dur="3s"
          begin="0.5s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
          keyTimes="0;1"
        />
      </path>

      {/* Moving dot on trend line */}
      <circle r="4" fill="hsl(var(--primary))" filter="url(#glow)" opacity="0">
        <animateMotion
          path="M 80 200 Q 150 180 200 160 T 320 130 T 440 90 T 560 60 T 680 30 T 750 20"
          dur="3s"
          begin="0.5s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
          keyTimes="0;1"
        />
        <animate
          attributeName="opacity"
          values="0;0.8;0.8;0"
          dur="3.5s"
          begin="0.5s"
          fill="freeze"
        />
      </circle>

      {/* Data points with pulse */}
      {[
        { cx: 200, cy: 160, delay: 1.2 },
        { cx: 320, cy: 130, delay: 1.6 },
        { cx: 440, cy: 90, delay: 2.0 },
        { cx: 560, cy: 60, delay: 2.4 },
        { cx: 680, cy: 30, delay: 2.8 },
      ].map((point, i) => (
        <g key={i}>
          <circle
            cx={point.cx}
            cy={point.cy}
            r="0"
            fill="hsl(var(--primary))"
            opacity="0"
          >
            <animate
              attributeName="r"
              from="0"
              to="5"
              dur="0.4s"
              begin={`${point.delay}s`}
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="0"
              to="0.6"
              dur="0.4s"
              begin={`${point.delay}s`}
              fill="freeze"
            />
          </circle>
          <circle
            cx={point.cx}
            cy={point.cy}
            r="0"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0"
          >
            <animate
              attributeName="r"
              from="5"
              to="15"
              dur="1.5s"
              begin={`${point.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.4"
              to="0"
              dur="1.5s"
              begin={`${point.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      {/* Volume bars at bottom */}
      {[80, 130, 180, 230, 280, 330, 380, 430, 480, 530, 580, 630, 680, 730].map((x, i) => {
        const heights = [22, 35, 18, 28, 40, 25, 32, 20, 38, 30, 24, 36, 28, 22]
        const height = heights[i]
        const isUp = i % 3 !== 0
        return (
          <rect
            key={i}
            x={x - 10}
            y={380 - height}
            width="20"
            height={height}
            fill={isUp ? 'hsl(150 30% 40%)' : 'hsl(0 40% 35%)'}
            opacity="0"
            rx="1"
          >
            <animate
              attributeName="opacity"
              from="0"
              to="0.25"
              dur="0.3s"
              begin={`${0.8 + i * 0.15}s`}
              fill="freeze"
            />
          </rect>
        )
      })}

      {/* Floating metrics */}
      <g opacity="0">
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.6s"
          begin="2.5s"
          fill="freeze"
        />
        <rect x="50" y="280" width="120" height="50" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeOpacity="0.3" />
        <text x="65" y="300" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="var(--font-sans)">Win Rate</text>
        <text x="65" y="320" fill="hsl(var(--primary))" fontSize="18" fontWeight="600" fontFamily="var(--font-sans)">78.4%</text>

        <rect x="630" y="60" width="120" height="50" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeOpacity="0.3" />
        <text x="645" y="80" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="var(--font-sans)">Monthly PnL</text>
        <text x="645" y="100" fill="hsl(150 30% 40%)" fontSize="18" fontWeight="600" fontFamily="var(--font-sans)">+$12,450</text>
      </g>
    </svg>
  )
}

const proofStats = [
  { label: 'Session Grade Confidence', value: '94%' },
  { label: 'Rule Adherence Uplift', value: '+37%' },
  { label: 'Impulse Trades Reduced', value: '-42%' },
]

export default function Hero() {
  const locale = useCurrentLocale()

  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-40">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-8%,hsl(var(--foreground)/0.16)_0%,transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:44px_44px] sm:bg-[size:52px_52px]" />
        <div className="absolute inset-x-10 top-8 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.34),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <Badge variant="secondary" className="border-border/70 bg-card/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
            Live decision telemetry for discretionary traders
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-5xl text-center text-[clamp(3rem,10vw,7.1rem)] font-semibold leading-[0.88] tracking-[-0.04em] [font-family:var(--home-display)] animate-slide-up">
          Build repeatable edge.
          <span className="mt-2 block bg-[linear-gradient(95deg,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.62)_100%)] bg-clip-text text-transparent">
            Eliminate emotional drift.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-3xl text-center text-[14px] leading-[1.72] text-foreground/85 sm:text-[18px] sm:leading-[1.8] [font-family:var(--home-copy)] animate-fade-in-delayed">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex w-full flex-col items-center justify-center gap-3 sm:mt-14 sm:w-auto sm:flex-row sm:gap-5 animate-fade-in-delayed-2">
          <Button asChild size="lg" className="h-12 w-full max-w-[320px] rounded-2xl bg-primary text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start Free Audit
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 w-full max-w-[320px] rounded-2xl border-border/70 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-card/50 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/#pricing`}>
              See Pricing
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-foreground/80 [font-family:var(--home-copy)] animate-fade-in-delayed-3">
          <span className="marketing-badge rounded-full px-3 py-1">No credit card required</span>
          <span className="marketing-badge rounded-full px-3 py-1">First audit in minutes</span>
          <span className="marketing-badge rounded-full px-3 py-1">Built for discretionary futures traders</span>
        </div>

        {/* Animated SVG */}
        <div className="mt-12 animate-fade-in-delayed-2">
          <AnimatedTradingSVG />
        </div>

        {/* Stats */}
        <div className="mt-8 animate-fade-in-delayed-3">
          <Card className="overflow-hidden border-border/70 bg-card/75 shadow-xl backdrop-blur-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border/70 bg-background/35 p-4 text-center transition-colors hover:bg-background/55"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/85 [font-family:var(--home-copy)]">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform logos */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/80 [font-family:var(--home-copy)] animate-fade-in-delayed-3">
          <span>Tradovate</span>
          <span>Rithmic</span>
          <span>IBKR</span>
          <span>CQG</span>
          <span className="font-medium tracking-[0.15em] text-primary/80" aria-label="NinjaTrader">
            NINJA<span className="mx-1 align-baseline text-primary">|</span>TRADER
          </span>
          <span>CSV Import</span>
        </div>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-foreground/80 [font-family:var(--home-copy)] animate-fade-in-delayed-3">
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
