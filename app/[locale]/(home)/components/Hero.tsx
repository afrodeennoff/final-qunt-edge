"use client"

import Link from 'next/link'
import { useReducedMotion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ButtonV2 } from '@/components/ui/v2'
import { cn } from '@/lib/utils'
import { ChartIcon, ProfileIcon } from '@/components/icons/svg-icons'

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, target])
  
  return <span ref={ref}>{prefix}{isInView ? count : 0}{suffix}</span>
}

export default function Hero({ locale }: { locale: string }) {
  const prefersReducedMotion = useReducedMotion()

  // If user prefers reduced motion, render static version
  if (prefersReducedMotion) {
    return <HeroStatic locale={locale} />
  }

  return (
    <section className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
      {/* Clean V2 gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2">
          <div 
            className="absolute inset-0 rounded-full opacity-[0.08] blur-[100px]"
            style={{
              background: 'radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Badge */}
        <div className="mb-10 flex justify-center">
          <div className="group relative">
            <div 
              className="absolute -inset-0.5 rounded-full opacity-20 blur-sm transition-all duration-300 group-hover:opacity-30"
              style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 50%))' }}
            />
            <div className="relative rounded-full border border-v2-accent/20 bg-v2-bg-surface/80 px-5 py-2 backdrop-blur-md">
              <span className="flex items-center gap-2.5 text-sm font-medium tracking-wide text-v2-text-secondary">
                <ChartIcon size={16} className="text-v2-accent" />
                <span className="bg-gradient-to-r from-v2-accent to-v2-accent/70 bg-clip-text text-transparent">
                  Live decision telemetry for discretionary traders
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Single-line headline with subtle accent gradient */}
        <h1 className="mx-auto mb-8 text-center font-sans font-semibold tracking-tight">
          <span className="block text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] text-v2-text-primary">
            Build repeatable edge.
          </span>
          <span 
            className="mt-4 block text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(217 92% 65%) 50%, hsl(0 0% 97% / 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-[1.75] text-v2-text-secondary sm:text-[19px]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        {/* Single CTA button with V2 Button */}
        <div className="mt-12 flex justify-center">
          <ButtonV2 variant="solid" size="lg" className="min-w-[240px]">
            <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center justify-center">
              Start Free Audit
            </Link>
          </ButtonV2>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.14em] text-v2-text-secondary">
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            No credit card required
          </span>
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            First audit in minutes
          </span>
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            Built for discretionary futures traders
          </span>
        </div>

        {/* Stats cards */}
        <div className="mt-16">
          <div className={cn(
            "relative overflow-hidden rounded-v2-lg border border-v2-border bg-v2-bg-surface/60",
            "shadow-v2-lg shadow-black/20 backdrop-blur-xl"
          )}>
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(217 91% 60% / 0.15), transparent)'
              }}
            />
            
            <div className="relative p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ProfileIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Session Grade Confidence
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-text-primary">
                    <AnimatedCounter target={94} suffix="%" />
                  </p>
                </div>
                
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ChartIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Rule Adherence Uplift
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-accent">
                    <AnimatedCounter target={37} prefix="+" suffix="%" />
                  </p>
                </div>
                
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ChartIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Impulse Trades Reduced
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-accent">
                    <AnimatedCounter target={42} prefix="-" suffix="%" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform logos */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'CSV Import'].map((platform) => (
            <span 
              key={platform}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary/80 transition-colors duration-200 hover:text-v2-text-primary"
            >
              {platform}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-v2-accent/80">
            NINJA<span className="mx-0.5 align-baseline text-v2-accent/60">|</span>TRADER
          </span>
        </div>

        <p className="mt-8 text-center text-sm tracking-[0.06em] text-v2-text-secondary/80">
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </p>
      </div>
      
      <div 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to_bottom, transparent, hsl(240 6% 3%))'
        }}
      />
    </section>
  )
}

function HeroStatic({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
      {/* Clean V2 gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2">
          <div 
            className="absolute inset-0 rounded-full opacity-[0.08] blur-[100px]"
            style={{
              background: 'radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Badge */}
        <div className="mb-10 flex justify-center">
          <div className="group relative">
            <div 
              className="absolute -inset-0.5 rounded-full opacity-20 blur-sm transition-all duration-300 group-hover:opacity-30"
              style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 50%))' }}
            />
            <div className="relative rounded-full border border-v2-accent/20 bg-v2-bg-surface/80 px-5 py-2 backdrop-blur-md">
              <span className="flex items-center gap-2.5 text-sm font-medium tracking-wide text-v2-text-secondary">
                <ChartIcon size={16} className="text-v2-accent" />
                <span className="bg-gradient-to-r from-v2-accent to-v2-accent/70 bg-clip-text text-transparent">
                  Live decision telemetry for discretionary traders
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Single-line headline with subtle accent gradient */}
        <h1 className="mx-auto mb-8 text-center font-sans font-semibold tracking-tight">
          <span className="block text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] text-v2-text-primary">
            Build repeatable edge.
          </span>
          <span 
            className="mt-4 block text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(217 92% 65%) 50%, hsl(0 0% 97% / 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-[1.75] text-v2-text-secondary sm:text-[19px]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        {/* Single CTA button with V2 Button */}
        <div className="mt-12 flex justify-center">
          <ButtonV2 variant="solid" size="lg" className="min-w-[240px]">
            <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center justify-center">
              Start Free Audit
            </Link>
          </ButtonV2>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.14em] text-v2-text-secondary">
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            No credit card required
          </span>
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            First audit in minutes
          </span>
          <span className="flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-surface/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-v2-accent" />
            Built for discretionary futures traders
          </span>
        </div>

        {/* Stats cards */}
        <div className="mt-16">
          <div className={cn(
            "relative overflow-hidden rounded-v2-lg border border-v2-border bg-v2-bg-surface/60",
            "shadow-v2-lg shadow-black/20 backdrop-blur-xl"
          )}>
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(217 91% 60% / 0.15), transparent)'
              }}
            />
            
            <div className="relative p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ProfileIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Session Grade Confidence
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-text-primary">
                    94%
                  </p>
                </div>
                
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ChartIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Rule Adherence Uplift
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-accent">
                    +37%
                  </p>
                </div>
                
                <div className="group relative rounded-v2-md border border-v2-border bg-v2-bg-elevated/40 p-5 text-center transition-all duration-300 hover:border-v2-accent/30 hover:bg-v2-bg-elevated/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-accent/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-v2-accent-subtle">
                    <ChartIcon size={20} className="text-v2-accent" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary">
                    Impulse Trades Reduced
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-v2-accent">
                    -42%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform logos */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'CSV Import'].map((platform) => (
            <span 
              key={platform}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-v2-text-secondary/80 transition-colors duration-200 hover:text-v2-text-primary"
            >
              {platform}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-v2-accent/80">
            NINJA<span className="mx-0.5 align-baseline text-v2-accent/60">|</span>TRADER
          </span>
        </div>

        <p className="mt-8 text-center text-sm tracking-[0.06em] text-v2-text-secondary/80">
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </p>
      </div>
      
      <div 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to_bottom, transparent, hsl(240 6% 3%))'
        }}
      />
    </section>
  )
}
