'use client'

import React from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { ButtonMinimal } from '@/components/ui/button-minimal'
import { TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card-minimal'

interface HeroProps {
  onStart?: () => void
}

export default function HeroMinimal({ }: HeroProps) {
  const locale = useCurrentLocale()

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          {/* Hero Stat Card */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      YOUR TRADING COMMAND CENTER
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">3.8M</span>
                      <span className="text-lg font-semibold text-success">+</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12.4%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs. last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              Qunt <span className="text-primary">Edge.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stop auditing the money. Audit the execution. <br />
              The clinical intelligence layer for professional discretionary traders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ButtonMinimal asChild>
                <Link href={`/${locale}/authentication?next=dashboard`}>
                  Start Free Audit
                </Link>
              </ButtonMinimal>

              <ButtonMinimal variant="outline" asChild>
                <Link href={`/${locale}/propfirms`}>
                  Explore Prop Firms
                </Link>
              </ButtonMinimal>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Trusted by</span>
                <span className="font-semibold text-foreground">50K+</span>
                <span>Traders</span>
              </div>
              <div className="h-px w-16 bg-border/50" />
              <div className="flex items-center gap-2">
                <span>4.9/5</span>
                <span className="font-semibold text-foreground">Rating</span>
              </div>
              <div className="h-px w-16 bg-border/50" />
              <div className="flex items-center gap-2">
                <span>$2B+</span>
                <span className="font-semibold text-foreground">Volume Tracked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
    </section>
  )
}