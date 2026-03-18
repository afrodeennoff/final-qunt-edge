"use client"

import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Target, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

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

function FloatingOrbs({ className, orbs }: { className?: string; orbs?: Array<{size: number, x: string, y: string, duration: number, delay: number, opacity: number, color: string}> }) {
  const defaultOrbs = [
    { size: 400, x: "5%", y: "15%", duration: 20, delay: 0, opacity: 0.12, color: "from-blue-500/20 to-purple-500/20" },
    { size: 500, x: "75%", y: "5%", duration: 25, delay: 5, opacity: 0.1, color: "from-cyan-500/15 to-teal-500/15" },
    { size: 300, x: "25%", y: "65%", duration: 18, delay: 2, opacity: 0.14, color: "from-indigo-500/20 to-violet-500/20" },
    { size: 350, x: "85%", y: "55%", duration: 22, delay: 8, opacity: 0.08, color: "from-emerald-500/15 to-green-500/15" },
    { size: 250, x: "55%", y: "85%", duration: 16, delay: 3, opacity: 0.11, color: "from-orange-500/20 to-amber-500/20" },
  ]
  const orbList = orbs || defaultOrbs
  
  return (
    <div className={className}>
      {orbList.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            opacity: orb.opacity,
            animation: `float ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

export default function Hero({ locale }: { locale: string }) {
  const prefersReducedMotion = useReducedMotion()

  // If user prefers reduced motion, render static version
  if (prefersReducedMotion) {
    return <HeroStatic locale={locale} />
  }

  return (
    <section className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <FloatingOrbs 
          className="opacity-60"
          orbs={[
            { size: 400, x: "5%", y: "15%", duration: 20, delay: 0, opacity: 0.12, color: "from-blue-500/20 to-purple-500/20" },
            { size: 500, x: "75%", y: "5%", duration: 25, delay: 5, opacity: 0.1, color: "from-cyan-500/15 to-teal-500/15" },
            { size: 300, x: "25%", y: "65%", duration: 18, delay: 2, opacity: 0.14, color: "from-indigo-500/20 to-violet-500/20" },
            { size: 350, x: "85%", y: "55%", duration: 22, delay: 8, opacity: 0.08, color: "from-emerald-500/15 to-green-500/15" },
            { size: 250, x: "55%", y: "85%", duration: 16, delay: 3, opacity: 0.11, color: "from-orange-500/20 to-amber-500/20" },
          ]}
        />
        
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2">
          <div 
            className="absolute inset-0 rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)'
            }}
          />
          <div 
            className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full opacity-20 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent-luxury) / 0.5) 0%, transparent 70%)'
            }}
          />
        </div>
        
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px'
          }}
        />
        
        <div 
          className="absolute inset-x-8 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.5) 70%, transparent)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-10 flex justify-center"
        >
          <motion.div variants={staggerItem} className="group relative">
            <div 
              className="absolute -inset-0.5 rounded-full opacity-30 blur-sm transition-all duration-300 group-hover:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-luxury)))' }}
            />
            <Badge 
              variant="secondary" 
              className="relative border border-primary/20 bg-card/80 px-5 py-2 backdrop-blur-md [font-family:var(--home-copy)]"
            >
              <Sparkles className="mr-2.5 h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-sm font-medium tracking-wide text-transparent">
                Live decision telemetry for discretionary traders
              </span>
            </Badge>
          </motion.div>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto mb-8 text-center tracking-tight [font-family:var(--home-display)]"
        >
          <motion.span 
            variants={staggerItem}
            className="block text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.92] text-foreground"
          >
            Build repeatable edge.
          </motion.span>
          <motion.span 
            variants={staggerItem}
            className="mt-4 block text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-luxury-hover)) 50%, hsl(var(--foreground) / 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Eliminate emotional drift.
          </motion.span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-[1.75] text-muted-foreground sm:text-[19px] [font-family:var(--home-copy)]"
        >
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:mt-14 sm:flex-row sm:gap-5"
        >
          <div className="group relative">
            <div 
              className="absolute -inset-1 rounded-2xl opacity-50 blur-md transition-all duration-300 group-hover:opacity-75"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent)' }}
            />
            <Button 
              asChild
              variant="default"
              size="lg"
              className="relative h-13 w-full min-w-[240px] rounded-2xl bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-200 hover:bg-primary/95 hover:shadow-2xl hover:shadow-primary/30 sm:w-auto [font-family:var(--home-copy)]"
            >
              <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center justify-center">
                <Zap className="mr-2.5 h-5 w-5" />
                Start Free Audit
              </Link>
            </Button>
          </div>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="h-13 w-full min-w-[240px] rounded-2xl border-primary/40 bg-card/50 px-8 py-6 text-sm font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/60 hover:bg-card/80 sm:w-auto [font-family:var(--home-copy)]"
          >
            <Link href={`/${locale}/#pricing`} className="flex items-center justify-center">
              See Pricing
              <ArrowRight className="ml-2.5 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground [font-family:var(--home-copy)]"
        >
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            No credit card required
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            First audit in minutes
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for discretionary futures traders
          </span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-16"
        >
          <Card className="relative overflow-hidden border-primary/10 bg-card/60 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent)'
              }}
            />
            
            <CardContent className="relative p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div
                  variants={staggerItem}
                  className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Session Grade Confidence
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
                    <AnimatedCounter target={94} suffix="%" />
                  </p>
                </motion.div>
                
                <motion.div
                  variants={staggerItem}
                  className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingDown className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Rule Adherence Uplift
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">
                    <AnimatedCounter target={37} prefix="+" suffix="%" />
                  </p>
                </motion.div>
                
                <motion.div
                  variants={staggerItem}
                  className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Impulse Trades Reduced
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">
                    <AnimatedCounter target={42} prefix="-" suffix="%" />
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5"
        >
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'CSV Import'].map((platform) => (
            <span 
              key={platform}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors duration-200 hover:text-foreground [font-family:var(--home-copy)]"
            >
              {platform}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/80 [font-family:var(--home-copy)]">
            NINJA<span className="mx-0.5 align-baseline text-primary/60">|</span>TRADER
          </span>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 text-center text-sm tracking-[0.06em] text-muted-foreground/80 [font-family:var(--home-copy)]"
        >
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </motion.p>
      </div>
      
      <div 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to_bottom, transparent, hsl(var(--background)))'
        }}
      />
    </section>
  )
}

function HeroStatic({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2">
          <div 
            className="absolute inset-0 rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)'
            }}
          />
          <div 
            className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full opacity-20 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent-luxury) / 0.5) 0%, transparent 70%)'
            }}
          />
        </div>
        
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px'
          }}
        />
        
        <div 
          className="absolute inset-x-8 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.5) 70%, transparent)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 flex justify-center">
          <div className="group relative">
            <div 
              className="absolute -inset-0.5 rounded-full opacity-30 blur-sm transition-all duration-300 group-hover:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-luxury)))' }}
            />
            <Badge 
              variant="secondary" 
              className="relative border border-primary/20 bg-card/80 px-5 py-2 backdrop-blur-md [font-family:var(--home-copy)]"
            >
              <Sparkles className="mr-2.5 h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-sm font-medium tracking-wide text-transparent">
                Live decision telemetry for discretionary traders
              </span>
            </Badge>
          </div>
        </div>

        <h1 className="mx-auto mb-8 text-center tracking-tight [font-family:var(--home-display)]">
          <span className="block text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.92] text-foreground">
            Build repeatable edge.
          </span>
          <span 
            className="mt-4 block text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-luxury-hover)) 50%, hsl(var(--foreground) / 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-[1.75] text-muted-foreground sm:text-[19px] [font-family:var(--home-copy)]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:mt-14 sm:flex-row sm:gap-5">
          <div className="group relative">
            <div 
              className="absolute -inset-1 rounded-2xl opacity-50 blur-md transition-all duration-300 group-hover:opacity-75"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent)' }}
            />
            <Button 
              asChild 
              size="lg" 
              className="relative h-13 w-full min-w-[240px] rounded-2xl bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-200 hover:bg-primary/95 hover:shadow-2xl hover:shadow-primary/30 sm:w-auto [font-family:var(--home-copy)]"
            >
              <Link href={`/${locale}/authentication?next=dashboard`}>
                <Zap className="mr-2.5 h-5 w-5" />
                Start Free Audit
              </Link>
            </Button>
          </div>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="h-13 w-full min-w-[240px] rounded-2xl border-primary/40 bg-card/50 px-8 py-6 text-sm font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/60 hover:bg-card/80 sm:w-auto [font-family:var(--home-copy)]"
          >
            <Link href={`/${locale}/#pricing`}>
              See Pricing
              <ArrowRight className="ml-2.5 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground [font-family:var(--home-copy)]">
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            No credit card required
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            First audit in minutes
          </span>
          <span className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for discretionary futures traders
          </span>
        </div>

        <div className="mt-16">
          <Card className="relative overflow-hidden border-primary/10 bg-card/60 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent)'
              }}
            />
            
            <CardContent className="relative p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Session Grade Confidence
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
                    94%
                  </p>
                </div>
                
                <div className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingDown className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Rule Adherence Uplift
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">
                    +37%
                  </p>
                </div>
                
                <div className="group relative rounded-xl border border-border/60 bg-background/40 p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-background/55">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
                    Impulse Trades Reduced
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">
                    -42%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'CSV Import'].map((platform) => (
            <span 
              key={platform}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors duration-200 hover:text-foreground [font-family:var(--home-copy)]"
            >
              {platform}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/80 [font-family:var(--home-copy)]">
            NINJA<span className="mx-0.5 align-baseline text-primary/60">|</span>TRADER
          </span>
        </div>

        <p className="mt-8 text-center text-sm tracking-[0.06em] text-muted-foreground/80 [font-family:var(--home-copy)]">
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </p>
      </div>
      
      <div 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to_bottom, transparent, hsl(var(--background)))'
        }}
      />
    </section>
  )
}
