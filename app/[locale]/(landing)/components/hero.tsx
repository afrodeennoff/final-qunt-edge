'use client'
import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { HeroCard } from '@/components/patterns/hero-card'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import { TrendingUp, Zap } from 'lucide-react'

interface HeroProps {
	onStart?: () => void
}

export default function Hero({ }: HeroProps) {
	const ref = useRef(null)
	const locale = useCurrentLocale()
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start start', 'end start'],
	})

	const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

	return (
		<section
			ref={ref}
			className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-40"
		>
			<motion.div
				initial={false}
				animate="visible"
				style={{ scale }}
				className="max-w-3xl mx-auto relative z-10 w-full animate-fade-up-smooth"
			>
				<MotionStagger className="space-y-6" delay={0.12} staggerSpeed={1}>
					<MotionStaggerItem blur>
						<HeroCard
							icon={Zap}
							label="YOUR TRADING COMMAND CENTER"
							value="3.8M"
							unit="+"
							trend={{
								value: '+12.4%',
								direction: 'up',
								label: 'vs. last month',
							}}
							watermarkIcon={TrendingUp}
							className="mx-6 rounded-xl p-8"
						/>
					</MotionStaggerItem>
				</MotionStagger>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-8"
				>
					<h1 className="mb-6 text-[clamp(2rem,6vw,5.625rem)] font-[350] leading-[1.06] tracking-[-0.045em] text-foreground [font-family:var(--font-geist,sans-serif)]">
						Qunt <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">Edge.</span>
					</h1>

					<p className="text-[15px] max-w-lg mx-auto mb-12 leading-[1.65] font-[350] px-2 text-muted-foreground tracking-[-0.01em]">
						Stop auditing the money. Audit the execution. <br className="hidden sm:block" />
						The clinical intelligence layer for professional discretionary traders.
					</p>
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
				>
					<Link
						href={`/${locale}/authentication?next=dashboard`}
						className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center rounded-full bg-white px-8 text-center text-[13px] font-semibold text-black tracking-[-0.01em] transition-[transform,background-color,opacity,border-color] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] sm:w-auto shadow-[0_0_32px_rgba(255,255,255,0.15)]"
					>
						<span className="relative z-10">Start Free Audit</span>
					</Link>

					<Link
						href={`/${locale}/updates`}
						className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center gap-2 rounded-full border border-border/0.08 bg-background/30 px-8 text-center text-[13px] font-medium text-foreground/80 tracking-[-0.01em] transition-[transform,background-color,opacity,border-color] hover:border-border/0.14 hover:bg-background/0.11 hover:text-foreground sm:w-auto"
					>
						View Product Updates
						<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="mt-20 border-t border-border/30 px-4 pt-10 opacity-50 transition-[opacity] duration-700 hover:opacity-100 sm:mt-24 sm:pt-12"
				>
					<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
						<span className="text-[11px] font-black tracking-[0.20em] uppercase text-foreground/35 transition-[color,letter-spacing] duration-300 hover:text-foreground hover:tracking-[0.15em] cursor-default">TRADOVATE</span>
						<span className="text-[11px] font-black tracking-[0.20em] uppercase text-foreground/35 transition-[color,letter-spacing] duration-300 hover:text-foreground hover:tracking-[0.15em] cursor-default">RITHMIC</span>
						<span className="text-[11px] font-black tracking-[0.20em] uppercase text-foreground/35 transition-[color,letter-spacing] duration-300 hover:text-foreground hover:tracking-[0.15em] cursor-default">IBKR</span>
						<span className="text-[11px] font-black tracking-[0.20em] uppercase text-foreground/35 transition-[color,letter-spacing] duration-300 hover:text-foreground hover:tracking-[0.15em] cursor-default">CQG</span>
					</div>
				</motion.div>
			</motion.div>
		</section>
	)
}
