"use client"

import { ReactNode, useEffect, useRef, useState, lazy, Suspense } from "react"
import { BarChart3, Calendar, Database, Brain } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ImportFeature } from "./import-feature"
import { useI18n } from "@/locales/client"
import { CalendarFeaturePreview } from "./calendar-preview"
import { cn } from "@/lib/utils"
import { PnlPerContractPreview } from "./pnl-per-contract-preview"

const TradingChatAssistant = lazy(() => import("./chat-feature").then(m => ({ default: m.default })))

type FeatureCard = {
	id: string
	title: string
	icon: ReactNode
	description: string
	stat: string
	image: ReactNode | string
	wrapperClass?: string
}

function FeatureCard({ feature, index, isVisible }: { feature: FeatureCard; index: number; isVisible: boolean }) {
	return (
		<div
			className={cn("group relative overflow-hidden rounded-xl border transition-colors","border-border bg-card","hover:bg-muted","opacity-0 translate-y-8",
			isVisible &&"opacity-100 translate-y-0",
			index < 2 ? 'lg:col-span-3' :
			index === 2 ? 'lg:col-span-4' : 'lg:col-span-2',
			`transition-delay-[${index * 100}ms]`
			)}
			style={{
				transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
			}}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

			<div className="relative h-full">
				<CardHeader className="flex flex-row items-center justify-between gap-0 border-b border-border pb-4">
					<CardTitle className="text-base font-medium tracking-tight text-foreground sm:text-lg">{feature.title}</CardTitle>
					<div className="relative">
						<div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative">
							{feature.icon}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 sm:gap-4">
						<div>
							<div className="text-[28px] font-[250] tracking-tight text-foreground sm:text-[32px]">{feature.stat}</div>
							<p className="mt-3 text-xs leading-[1.7] text-muted-foreground sm:text-sm">
								{feature.description}
							</p>
						</div>
						<div
							className={cn("relative flex w-full items-center justify-center overflow-hidden rounded-xl","border border-border bg-background/25","group-hover:border-border group-hover:bg-muted/40 transition-[transform,opacity,background-color,border-color,box-shadow] duration-500",
							feature.wrapperClass ??"h-[250px] sm:h-[300px] md:h-[350px]"
							)}
						>
							<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

							<div className="relative">
								{typeof feature.image ==="string" ? (
									<Image
										src={feature.image}
										alt={`${feature.title} visualization`}
										className="h-full w-full rounded-md object-contain"
										width={800}
										height={400}
										priority
									/>
								) : (
									feature.image
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</div>
		</div>
	)
}

export default function Features() {
	const t = useI18n()
	const sectionRef = useRef<HTMLDivElement>(null)
	const [isVisible, setIsVisible] = useState(false)

	const features: FeatureCard[] = [
		{
			id:"ai-journaling",
			title: t("landing.features.ai-journaling.title"),
			icon: <Brain className="h-5 w-5 text-primary" />,
			description: t("landing.features.ai-journaling.description"),
			stat: t("landing.features.ai-journaling.stat"),
			image: (
				<Suspense fallback={null}>
					<TradingChatAssistant />
				</Suspense>
			)
		},
		{
			id:"performance-visualization",
			title: t("landing.features.performance-visualization.title"),
			icon: <BarChart3 className="h-5 w-5 text-primary" />,
			description: t("landing.features.performance-visualization.description"),
			stat: t("landing.features.performance-visualization.stat"),
			image: <PnlPerContractPreview />,
			wrapperClass:"min-h-[420px]"
		},
		{
			id:"daily-performance",
			title: t("landing.features.daily-performance.title"),
			icon: <Calendar className="h-5 w-5 text-primary" />,
			description: t("landing.features.daily-performance.description"),
			stat: t("landing.features.daily-performance.stat"),
			image: <CalendarFeaturePreview />,
			wrapperClass:"min-h-[420px] lg:min-h-[480px]"
		},
		{
			id:"data-import ",
			title: t("landing.features.data-import.title"),
			icon: <Database className="h-5 w-5 text-primary" />,
			description: t("landing.features.data-import.description"),
			stat: t("landing.features.data-import.stat"),
			image: <ImportFeature />
		}
	]

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries
				if (entry.isIntersecting) {
					setIsVisible(true)
				}
			},
			{
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px'
			}
		)

		const currentRef = sectionRef.current
		if (currentRef) {
			observer.observe(currentRef)
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	return (
		<section
			id="features"
			ref={sectionRef}
			className="relative px-6 py-12 sm:py-16 lg:py-24"
		>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-6xl space-y-8">
				<div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
					<div className={cn("transition-[transform,opacity] duration-700","opacity-0 translate-y-4",
					isVisible &&"opacity-100 translate-y-0"
					)}>
						<p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground [font-family:var(--home-copy)]">Platform Weapons</p>
						<h2 className="mt-3 text-[clamp(1.95rem,4.9vw,3.4rem)] font-[350] leading-[0.92] tracking-[-0.045em] text-foreground [font-family:var(--home-display)]">
							{t("landing.features.heading")}
						</h2>
						<p className="mt-4 max-w-2xl text-sm leading-[1.8] text-muted-foreground sm:text-base md:text-lg">
							{t("landing.features.subheading")}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:gap-4">
						{features.map((feature, index) => (
							<div
								key={feature.id}
								className={cn("rounded-xl border border-border bg-muted/40 p-6 sm:p-6 transition-[transform,opacity,background-color,border-color,box-shadow] duration-500 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]","hover:-translate-y-1","opacity-0",
								isVisible &&"opacity-100"
								)}
								style={{
									transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
								}}
							>
								<div className="mb-4 flex size-8 items-center justify-center rounded-lg border border-border bg-muted/40">
									{feature.icon}
								</div>
								<p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
									{feature.title}
								</p>
							</div>
						))}
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-8 lg:gap-8">
					{features.map((feature, index) => (
						<FeatureCard key={`${feature.id}-detail`} feature={feature} index={index} isVisible={isVisible} />
					))}
				</div>
			</div>
		</section>
	)
}
