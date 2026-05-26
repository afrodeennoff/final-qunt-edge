'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Brain,
  CircleCheck,
  CircleX,
  Gauge,
  Loader2,
  MessageSquareText,
  PauseCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import { useI18n } from '@/locales/client'
import type { BehaviorInsights } from '@/lib/behavior-insights'

const MindsetWidget = dynamic(
  () => import('../components/mindset/mindset-widget').then((m) => ({ default: m.MindsetWidget })),
  {
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl border border-border/30 bg-card" />
    ),
  },
)

const AnalysisOverview = dynamic(
  () =>
    import('../components/analysis/analysis-overview').then((m) => ({
      default: m.AnalysisOverview,
    })),
  {
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl border border-border/30 bg-card" />
    ),
  },
)

const ChatWidget = dynamic(() => import('../components/chat/chat'), {
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-xl border border-border/30 bg-card" />
  ),
})

export default function DashboardBehaviorPage() {
  const t = useI18n()
  const [periodDays, setPeriodDays] = useState(30)
  const [refreshKey, setRefreshKey] = useState(0)
  const [insights, setInsights] = useState<BehaviorInsights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const inFlightControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let isMounted = true
    inFlightControllerRef.current?.abort()
    const controller = new AbortController()
    inFlightControllerRef.current = controller

    const loadInsights = async () => {
      setIsLoadingInsights(true)
      setInsightsError(null)
      try {
        const response = await fetch(`/api/behavior/insights?periodDays=${periodDays}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Insights request failed (${response.status})`)
        }

        const payload = (await response.json()) as BehaviorInsights
        if (isMounted) {
          setInsights(payload)
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return

        if (isMounted) {
          setInsightsError('Unable to load behavior insights right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingInsights(false)
        }
      }
    }

    loadInsights()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [periodDays, refreshKey])

  const trainingModules = useMemo(() => {
    const checkInRate = insights?.modules.checkInRate ?? 0
    const averageEmotion = insights?.summary.averageEmotion ?? 50
    const emotionalRisk = insights?.summary.emotionalRiskPercent ?? 0

    return [
      {
        title: 'Daily Emotional Check-In',
        description:
          'Track confidence, anxiety, and focus before market open to adapt your execution plan.',
        metric: `${checkInRate}% completion`,
      },
      {
        title: 'Mindset Coaching Loop',
        description:
          'Use coaching prompts for market anxiety, losses, and overconfidence after winning streaks.',
        metric: `Avg emotion: ${averageEmotion}/100`,
      },
      {
        title: 'Mindful Entry Reminders',
        description: 'Nudges before execution: planned setup or emotional reaction?',
        metric: `Emotion-driven risk: ${emotionalRisk}%`,
      },
    ]
  }, [insights])

  const reflectionModules = useMemo(() => {
    return [
      {
        title: 'Weekly Self-Reflection Dashboard',
        description:
          'Review loss-chasing, panic exits, and impulsive entries with behavior trend views.',
        metric: 'Emotion-Driven Trades',
        value: `${insights?.summary.emotionalRiskPercent ?? 0}%`,
      },
      {
        title: 'Post-Trade Psychological Review',
        description:
          'After high-risk trades, capture state-of-mind and trigger source (news, social, revenge, FOMO).',
        metric: 'Reflection Completion',
        value: `${insights?.modules.reflectionCompletionRate ?? 0}%`,
      },
      {
        title: 'Stress & Risk Impact Report',
        description:
          'Monthly synthesis of market exposure and emotional volatility with AI recommendations.',
        metric: 'Stress Events',
        value: `${(insights?.summary.overtradingDays ?? 0) + (insights?.summary.lossChasingEvents ?? 0) + (insights?.summary.impulsiveTradeCount ?? 0)}`,
      },
    ]
  }, [insights])

  const gamificationModules = useMemo(() => {
    return [
      {
        badge: 'Steady Hand',
        detail: 'Maintain your risk profile for 30 consecutive days.',
        achieved: insights?.achievements.steadyHand ?? false,
      },
      {
        badge: 'Emotional Master',
        detail: 'Avoid revenge trading and overtrading behavior.',
        achieved: insights?.achievements.emotionalMaster ?? false,
      },
      {
        badge: 'Control Streak',
        detail: 'Trade 7 days with disciplined size and planned entries.',
        achieved: insights?.achievements.controlStreak ?? false,
      },
    ]
  }, [insights])

  const recommendationList = insights?.recommendations ?? []

  return (
    <UnifiedPageShell density="compact">
      <div className="w-full space-y-6">
      <Card className="rounded-xl border border-border/30 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-foreground" />
                <CardTitle className="text-2xl font-semibold tracking-tight">Behavior AI Hub</CardTitle>
                <Badge variant="secondary" className="border-border/30 text-foreground">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  AI
                </Badge>
              </div>
            </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-border/30 bg-muted/40 p-1">
              <Button
                size="sm"
                variant={periodDays === 7 ? 'solid' : 'ghost'}
                onClick={() => setPeriodDays(7)}
              >
                7d
              </Button>
              <Button
                size="sm"
                variant={periodDays === 30 ? 'solid' : 'ghost'}
                onClick={() => setPeriodDays(30)}
              >
                30d
              </Button>
              <Button
                size="sm"
                variant={periodDays === 90 ? 'solid' : 'ghost'}
                onClick={() => setPeriodDays(90)}
              >
                90d
              </Button>
              </div>
              <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const section = document.getElementById('analysis-section')
                  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Open AI Analysis
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const section = document.getElementById('coach-section')
                  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Ask AI Coach
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const section = document.getElementById('mindset-section')
                  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Open Journal
              </Button>
              </div>
              {isLoadingInsights ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating insights
                </Badge>
              ) : null}
              {!isLoadingInsights ? (
                <Badge variant="outline" className="gap-1">
                  Confidence: {insights?.summary.confidenceScore ?? 0}% (
                  {insights?.summary.confidenceBand ?? 'low'})
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {insightsError && !isLoadingInsights ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">{insightsError}</p>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto shrink-0 text-xs"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="h-auto rounded-xl border border-border/30 bg-muted/40 p-1">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {isLoadingInsights && !insights ? (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="h-48 animate-pulse rounded-xl border border-border/30 bg-muted/40 lg:col-span-2" />
                <div className="h-48 animate-pulse rounded-xl border border-border/30 bg-muted/40" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64 animate-pulse rounded-xl border border-border/30 bg-muted/40" />
                <div className="h-64 animate-pulse rounded-xl border border-border/30 bg-muted/40" />
              </div>
            </div>
          ) : (
          <>
          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/30 bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold tracking-tight">Behavior Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Alignment</span>
                  <span className="font-semibold">{insights?.modules.riskAlignmentScore ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Emotional Risk</span>
                  <span className="font-semibold">
                    {insights?.summary.emotionalRiskPercent ?? 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-In Rate</span>
                  <span className="font-semibold">{insights?.modules.checkInRate ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Loss Chasing Events</span>
                  <span className="font-semibold">{insights?.summary.lossChasingEvents ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold tracking-tight">Live Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {insights?.prompts.mindful ??
                    'Before executing: is this trade analysis-driven or emotion-driven?'}
                </p>
              </CardContent>
            </Card>
          </section>

          {(insights?.drivers?.length ?? 0) > 0 ? (
          <section className="rounded-xl border border-border/30 bg-card p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-foreground" />
              <h3 className="text-lg font-semibold tracking-tight">Top Risk Drivers</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {insights?.drivers.slice(0, 4).map((driver) => (
                <div
                  key={driver.key}
                  className="rounded-xl border border-border/30 bg-muted/40 p-3"
                >
                  <p className="text-sm font-semibold">{driver.key}</p>
                  <p className="text-xs text-muted-foreground">{driver.explanation}</p>
                  <Badge variant="secondary" className="mt-2">
                    Contribution: {driver.contribution}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/30 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Training & Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainingModules.map((module) => (
                <div
                  key={module.title}
                  className="rounded-xl border border-border/30 bg-muted/40 p-3"
                >
                  <p className="text-sm font-semibold">{module.title}</p>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {module.metric}
                  </Badge>
                </div>
              ))}
              {reflectionModules.map((module) => (
                <div
                  key={module.title}
                  className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/40 p-3 text-sm"
                >
                  <span className="text-muted-foreground">{module.metric}</span>
                  <span className="font-semibold">{module.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Achievements & Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gamificationModules.map((module) => (
                <div
                  key={module.badge}
                  className="rounded-xl border border-border/30 bg-muted/40 p-3"
                >
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {module.achieved ? (
                      <CircleCheck className="h-4 w-4 text-foreground" />
                    ) : (
                      <CircleX className="h-4 w-4 text-muted-foreground" />
                    )}
                    {module.badge}
                  </p>
                  <p className="text-xs text-muted-foreground">{module.detail}</p>
                </div>
              ))}
              <div className="rounded-xl border border-border/30 bg-muted/40 p-3">
                <p className="text-sm font-semibold mb-1">Risk Guard</p>
                <p className="text-xs text-muted-foreground">{insights?.prompts.riskGuard}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {recommendationList.length > 0 ? (
          <section className="rounded-xl border border-border/30 bg-card p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <h3 className="text-lg font-semibold tracking-tight">AI Recommendations</h3>
            </div>
            <div className="space-y-2">
              {insights?.recommendationsDetailed?.length
                ? insights.recommendationsDetailed.map((recommendation, index) => (
                    <div
                      key={`${recommendation.text}-${index}`}
                      className="rounded-xl border border-border/30 p-3 bg-background/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">{recommendation.text}</p>
                        <Badge
                          variant={
                            recommendation.priority === 'high'
                              ? 'error'
                              : recommendation.priority === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {recommendation.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                : recommendationList.map((recommendation) => (
                    <p key={recommendation} className="text-sm text-muted-foreground">
                      {recommendation}
                    </p>
                  ))}
            </div>
          </section>
        ) : null}
          </>
          )}
      </TabsContent>

          <TabsContent value="workspace" className="space-y-4">
            <section
              id="analysis-section"
              className="rounded-xl border border-border/30 bg-card p-4 sm:p-6"
            >
              <AnalysisOverview />
            </section>

            <section
              id="coach-section"
              className="rounded-xl border border-border/30 bg-card p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight">AI Trading Coach</h2>
              </div>
              <div className="h-[min(620px,68dvh)] min-h-[420px] sm:min-h-[500px]">
                <ChatWidget size="large" />
              </div>
            </section>

            <section
              id="mindset-section"
              className="rounded-xl border border-border/30 bg-card p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight">Mindset & Journal</h2>
              </div>
              <div className="h-[min(780px,calc(100dvh-220px))] min-h-[420px] sm:min-h-[640px]">
                <MindsetWidget size="large" />
              </div>
            </section>
          </TabsContent>
      </Tabs>
      </div>
    </UnifiedPageShell>
  )
}
