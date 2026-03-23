"use client"

import { ReactNode } from "react"
import { BarChart3, Calendar, Database, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ImportFeature } from "./import-feature"
import { useI18n } from "@/locales/client"
import TradingChatAssistant from "./chat-feature"
import { CalendarFeaturePreview } from "./calendar-preview"
import { cn } from "@/lib/utils"
import { PnlPerContractPreview } from "./pnl-per-contract-preview"

type FeatureCard = {
  id: string
  title: string
  icon: ReactNode
  description: string
  stat: string
  image: ReactNode | string
  wrapperClass?: string
}

export default function Features() {
  const t = useI18n()
  const features: FeatureCard[] = [
    {
      id: "ai-journaling",
      title: t("landing.features.ai-journaling.title"),
      icon: <Brain className="h-5 w-5 text-[hsl(var(--primary))]" />,
      description: t("landing.features.ai-journaling.description"),
      stat: t("landing.features.ai-journaling.stat"),
      image: <TradingChatAssistant />
    },
    {
      id: "performance-visualization",
      title: t("landing.features.performance-visualization.title"),
      icon: <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" />,
      description: t("landing.features.performance-visualization.description"),
      stat: t("landing.features.performance-visualization.stat"),
      image: <PnlPerContractPreview />,
      wrapperClass: "min-h-[420px]"
    },
    {
      id: "daily-performance",
      title: t("landing.features.daily-performance.title"),
      icon: <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />,
      description: t("landing.features.daily-performance.description"),
      stat: t("landing.features.daily-performance.stat"),
      image: <CalendarFeaturePreview />,
      wrapperClass: "min-h-[420px] lg:min-h-[480px]"
    },
    {
      id: "data-import",
      title: t("landing.features.data-import.title"),
      icon: <Database className="h-5 w-5 text-[hsl(var(--primary))]" />,
      description: t("landing.features.data-import.description"),
      stat: t("landing.features.data-import.stat"),
      image: <ImportFeature />
    }
  ]

  return (
    <section id="features" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
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
          <Card
            id={feature.id}
            key={feature.id}
            className={`bg-card/80 border border-border/60 shadow-[0_12px_34px_-24px_hsl(var(--foreground)/0.45)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-border/85 ${
              index < 2 ? 'lg:col-span-3' :
              index === 2 ? 'lg:col-span-4' : 'lg:col-span-2'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground sm:text-lg">{feature.title}</CardTitle>
              {feature.icon}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div>
                  <div className="text-xl font-bold text-foreground sm:text-2xl">{feature.stat}</div>
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              <div
                className={cn(
                  "relative w-full flex justify-center items-center rounded-xl overflow-hidden",
                  feature.wrapperClass ?? "h-[250px] sm:h-[300px] md:h-[350px]"
                )}
              >
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
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </section>
  )
}
