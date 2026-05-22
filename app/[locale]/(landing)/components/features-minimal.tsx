"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-minimal"
import { BarChart3, Calendar, Database, Brain } from "lucide-react"
import { ButtonMinimal } from "@/components/ui/button-minimal"
import { cn } from "@/lib/utils"

type FeatureCard = {
  id: string
  title: string
  icon: ReactNode
  description: string
  stat: string
  image: ReactNode | string
  ctaText?: string
  ctaAction?: () => void
}

interface MinimalFeaturesProps {
  features: FeatureCard[]
  className?: string
}

export function MinimalFeatures({ features, className }: MinimalFeaturesProps) {
  return (
    <section className={cn("py-16 lg:py-24", className)}>
      <div className="text-center mb-16">
        <h2 className="text-3xl font-semibold tracking-tight mb-4">
          Powerful Trading Features
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to analyze, track, and improve your trading performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.id} className="h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {feature.title}
              </CardTitle>
              <div className="p-2 bg-[oklch(0.65_0.22_260/0.02)] rounded-lg">
                {feature.icon}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div>
                <div className="text-2xl font-semibold mb-3">
                  {feature.stat}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-[oklch(0.65_0.22_260/0.05)] bg-muted/30 min-h-[200px]">
                <div className="p-4">
                  {typeof feature.image === "string" ? (
                    <img
                      src={feature.image}
                      alt={`${feature.title} visualization`}
                      className="max-w-full max-h-[160px] object-contain"
                    />
                  ) : (
                    feature.image
                  )}
                </div>
              </div>

              {feature.ctaText && (
                <div className="pt-4">
                  <ButtonMinimal
                    onClick={feature.ctaAction}
                    variant="outline"
                    className="w-full"
                  >
                    {feature.ctaText}
                  </ButtonMinimal>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// Feature definitions
export const minimalFeatureData: FeatureCard[] = [
  {
    id: "analytics",
    title: "Advanced Analytics",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    description: "Comprehensive performance metrics and trading insights with AI-powered analysis",
    stat: "50+ Metrics",
    image: "/images/analytics-preview.png",
    ctaText: "View Analytics",
    ctaAction: () => console.log("View analytics")
  },
  {
    id: "journal",
    title: "Smart Journaling",
    icon: <Brain className="h-5 w-5 text-primary" />,
    description: "AI-powered trade journaling with automatic sentiment analysis and pattern detection",
    stat: "98% Accuracy",
    image: "/images/journal-preview.png",
    ctaText: "Start Journaling",
    ctaAction: () => console.log("Start journaling")
  },
  {
    id: "calendar",
    title: "Trading Calendar",
    icon: <Calendar className="h-5 w-5 text-primary" />,
    description: "Integrated economic events and market calendar with smart notifications",
    stat: "24/7 Coverage",
    image: "/images/calendar-preview.png",
    ctaText: "View Calendar",
    ctaAction: () => console.log("View calendar")
  },
  {
    id: "data",
    title: "Data Import",
    icon: <Database className="h-5 w-5 text-primary" />,
    description: "Seamless import from multiple brokers with real-time sync capabilities",
    stat: "15+ Brokers",
    image: "/images/import-preview.png",
    ctaText: "Connect Brokers",
    ctaAction: () => console.log("Connect brokers")
  }
]