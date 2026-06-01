'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { Bot, Brain, Sparkles, TrendingUp, BarChart3, MessageSquareText, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStatCard } from '@/components/ui/dashboard-stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { Skeleton } from '@/components/ui/skeleton'

const AnalysisOverview = dynamic(
  () => import('../../components/analysis/analysis-overview').then((m) => ({ default: m.AnalysisOverview })),
  { loading: () => <Skeleton className="h-80 w-full rounded-xl" /> },
)

const ChatWidget = dynamic(() => import('../../components/chat/chat'), {
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
})

interface BehaviorInsights {
  summary: { emotionalRiskPercent: number; confidenceScore: number; confidenceBand: string; overtradingDays: number; lossChasingEvents: number; impulsiveTradeCount: number; averageEmotion: number }
  modules: { checkInRate: number; riskAlignmentScore: number; reflectionCompletionRate: number }
  prompts: { mindful: string; riskGuard: string }
  recommendations: string[]
  achievements: { steadyHand: boolean; emotionalMaster: boolean; controlStreak: boolean }
  drivers: { key: string; explanation: string; contribution: string }[]
}

export default function AnalyticsClient() {
  const [periodDays, setPeriodDays] = useState(30)
  const [insights, setInsights] = useState<BehaviorInsights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    setIsLoadingInsights(true)

    fetch(`/api/behavior/insights?periodDays=${periodDays}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (mounted) setInsights(data) })
      .catch(() => {})
      .finally(() => { if (mounted) setIsLoadingInsights(false) })

    return () => { mounted = false; controller.abort() }
  }, [periodDays])

  const copilotSuggestions = useMemo(() => {
    if (!insights) return []
    const suggestions: { icon: typeof Brain; text: string; priority: string }[] = []
    if (insights.summary.emotionalRiskPercent > 40) {
      suggestions.push({ icon: Brain, text: `High emotional risk (${insights.summary.emotionalRiskPercent}%). Consider a cooldown after 2 consecutive losses.`, priority: 'high' })
    }
    if (insights.modules.checkInRate < 50) {
      suggestions.push({ icon: MessageSquareText, text: `Check-in rate is ${insights.modules.checkInRate}%. Daily mood tracking improves consistency by up to 30%.`, priority: 'medium' })
    }
    return suggestions
  }, [insights])

  return (
    <UnifiedPageShell density="compact">
      <div className="w-full min-h-full space-y-5 flex flex-col">
        <UnifiedSurface className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight">Trading Copilot</h1>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Behavioral analytics, performance reports, and AI-driven trade insights — all in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[7, 30, 90].map((d) => (
                <Button key={d} size="sm" variant={periodDays === d ? 'default' : 'ghost'} onClick={() => setPeriodDays(d)}>
                  {d}d
                </Button>
              ))}
            </div>
          </div>

          {copilotSuggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              {copilotSuggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/4 px-4 py-3">
                  <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                  <Badge variant={s.priority === 'high' ? 'destructive' : 'secondary'} className="ml-auto shrink-0">
                    {s.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </UnifiedSurface>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="analytics"><BarChart3 className="mr-1.5 h-4 w-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="insights"><Brain className="mr-1.5 h-4 w-4" /> Insights</TabsTrigger>
            <TabsTrigger value="market"><TrendingUp className="mr-1.5 h-4 w-4" /> Market</TabsTrigger>
            <TabsTrigger value="coach"><Bot className="mr-1.5 h-4 w-4" /> Coach</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2"><AnalysisOverview /></div>
              <div className="space-y-4">
                   <Card>
                     <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
                     <CardContent>
                       {isLoadingInsights ? (
                         <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                       ) : (
                         <div className="grid grid-cols-2 gap-3">
                           <DashboardStatCard
                             label="Risk Alignment"
                             value={`${insights?.modules.riskAlignmentScore ?? '-'}%`}
                             size="sm"
                           />
                           <DashboardStatCard
                             label="Emotional Risk"
                             value={`${insights?.summary.emotionalRiskPercent ?? '-'}%`}
                             size="sm"
                           />
                           <DashboardStatCard
                             label="Check-In Rate"
                             value={`${insights?.modules.checkInRate ?? '-'}%`}
                             size="sm"
                           />
                           <DashboardStatCard
                             label="Confidence"
                             value={`${insights?.summary.confidenceScore ?? '-'}%`}
                             size="sm"
                           />
                         </div>
                       )}
                     </CardContent>
                   </Card>

              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {isLoadingInsights ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Brain className="h-4 w-4" /> Behavior Health</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Overtrading Days</span><span className="font-semibold">{insights?.summary.overtradingDays ?? 0}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Loss Chasing Events</span><span className="font-semibold">{insights?.summary.lossChasingEvents ?? 0}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Impulsive Trades</span><span className="font-semibold">{insights?.summary.impulsiveTradeCount ?? 0}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Risk Alignment</span><span className="font-semibold">{insights?.modules.riskAlignmentScore ?? 0}%</span></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-4 w-4" /> Guidance</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className={cn(unifiedInsetPanelClassName, 'p-3')}>
                        <p className="font-semibold mb-1">Live Prompt</p>
                        <p className="text-muted-foreground">{insights?.prompts.mindful ?? 'Before executing: is this trade analysis-driven or emotion-driven?'}</p>
                      </div>
                      <div className={cn(unifiedInsetPanelClassName, 'p-3')}>
                        <p className="font-semibold mb-1">Risk Guard</p>
                        <p className="text-muted-foreground">{insights?.prompts.riskGuard ?? 'Stay disciplined.'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {insights?.recommendations && insights.recommendations.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-4 w-4" /> AI Recommendations</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {insights.recommendations.map((rec, i) => (
                        <p key={i} className="text-sm text-muted-foreground">• {rec}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="market">
            <Card className="bg-card border-0">
              <CardHeader><CardTitle className="text-lg">Market Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground/40">
                  Connect a data provider to see live market charts.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach">
            <Card className="bg-card border-0">
              <CardHeader>
                <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /><CardTitle className="text-lg">AI Trading Coach</CardTitle></div>
              </CardHeader>
              <CardContent>
                <div className="h-[min(620px,68dvh)] min-h-[420px]"><ChatWidget size="large" /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedPageShell>
  )
}
