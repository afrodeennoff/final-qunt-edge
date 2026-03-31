"use client"

import { ReactNode, useEffect, useRef, useState, lazy, Suspense } from "react"
import { BarChart3, Calendar, Database, Brain } from "lucide-react"
import { CardV2Content, CardV2Header, CardV2Title } from "@/components/ui/v2"
import Image from "next/image"
import { ImportFeature } from "./import-feature"
import { useI18n } from "@/locales/client"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarFeaturePreview } from "./calendar-preview"
import { cn } from "@/lib/utils"
import { PnlPerContractPreview } from "./pnl-per-contract-preview"

const TradingChatAssistant = lazy(() => import("./chat-feature").then(m => ({ default: m.default })))

function ChatLoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-card/50">
      <div className="space-y-3 w-full max-w-[280px]">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="pt-2 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
        </div>
      </div>
    </div>
  )
}

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
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-500",
        "bg-card/80 backdrop-blur-sm",
        "border-border/60 hover:border-border/85",
        "shadow-[0_12px_34px_-24px_hsl(var(--foreground)/0.45)] hover:shadow-[0_20px_40px_-20px_hsl(var(--foreground)/0.55)]",
        "hover:-translate-y-1",
        "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0",
        index < 2 ? 'lg:col-span-3' :
        index === 2 ? 'lg:col-span-4' : 'lg:col-span-2',
        `transition-delay-[${index * 100}ms]`
      )}
      style={{
        transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative h-full">
        <CardV2Header className="flex flex-row items-center justify-between gap-0 border-b border-border/60 pb-4">
          <CardV2Title className="text-base font-medium text-foreground sm:text-lg">{feature.title}</CardV2Title>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              {feature.icon}
            </div>
          </div>
        </CardV2Header>
        <CardV2Content>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <div className="text-xl font-bold text-foreground sm:text-2xl">{feature.stat}</div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                {feature.description}
              </p>
            </div>
          <div
            className={cn(
              "relative w-full flex justify-center items-center rounded-xl overflow-hidden",
              "border border-border/40 bg-card/50 backdrop-blur-sm",
              "group-hover:border-border/60 group-hover:bg-card/70 transition-all duration-500",
              feature.wrapperClass ?? "h-[250px] sm:h-[300px] md:h-[350px]"
            )}
          >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                {typeof feature.image === "string" ? (
                  <Image
                    src={feature.image}
                    alt={`${feature.title} visualization`}
                    className="h-full w-full rounded-md object-contain"
                    width={800}
                    height={400}
                  />
                ) : (
                  feature.image
                )}
              </div>
            </div>
          </div>
        </CardV2Content>
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
      id: "ai-journaling",
      title: t("landing.features.ai-journaling.title"),
      icon: <Brain className="h-5 w-5 text-primary" />,
      description: t("landing.features.ai-journaling.description"),
      stat: t("landing.features.ai-journaling.stat"),
      image: (
        <Suspense fallback={<ChatLoadingFallback />}>
          <TradingChatAssistant />
        </Suspense>
      )
    },
    {
      id: "performance-visualization",
      title: t("landing.features.performance-visualization.title"),
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      description: t("landing.features.performance-visualization.description"),
      stat: t("landing.features.performance-visualization.stat"),
      image: <PnlPerContractPreview />,
      wrapperClass: "min-h-[420px]"
    },
    {
      id: "daily-performance",
      title: t("landing.features.daily-performance.title"),
      icon: <Calendar className="h-5 w-5 text-primary" />,
      description: t("landing.features.daily-performance.description"),
      stat: t("landing.features.daily-performance.stat"),
      image: <CalendarFeaturePreview />,
      wrapperClass: "min-h-[420px] lg:min-h-[480px]"
    },
    {
      id: "data-import",
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
      className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="mx-auto max-w-6xl relative">
        <div className={cn(
          "mb-10 text-center sm:mb-14 transition-all duration-700",
          "opacity-0 translate-y-4",
          isVisible && "opacity-100 translate-y-0"
        )}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/85 [font-family:var(--home-copy)]">Platform Weapons</p>
          <h2 className="mt-2 text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
            {t("landing.features.heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
            {t("landing.features.subheading")}
          </p>
        </div>
        <div className="mb-6 h-px bg-border/40 sm:mb-8" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 sm:gap-5 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
