import React from 'react'
import dynamic from 'next/dynamic'
import { WidgetType, WidgetSize } from '../types/dashboard'
import { Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import { translateWeekday } from '@/lib/translation-utils'
import { Skeleton } from '@/components/ui/skeleton'

const widgetFallback = <div className="h-full w-full rounded-xl bg-background/0.08" />

// All widgets use dynamic imports for code splitting — they are only loaded when rendered.
// DO NOT reference these in getPreview() — use skeleton previews instead to avoid eager loading.
const SmartInsightsWidget = dynamic(
  () => import('../components/widgets/smart-insights-widget').then((m) => m.SmartInsightsWidget),
  { loading: () => widgetFallback }
)
const EquityChart = dynamic(() => import('../components/charts/client/equity-chart'), { loading: () => widgetFallback })
const TickDistributionChart = dynamic(() => import('../components/charts/client/tick-distribution'), { loading: () => widgetFallback })
const PNLChart = dynamic(() => import('../components/charts/client/pnl-bar-chart'), { loading: () => widgetFallback })
const TimeOfDayTradeChart = dynamic(
  () => import('../components/charts/client/pnl-time-bar-chart'),
  { loading: () => widgetFallback }
)
const TimeInPositionChart = dynamic(() => import('../components/charts/client/time-in-position'), { loading: () => widgetFallback })
const TimeRangePerformanceChart = dynamic(
  () => import('../components/charts/client/time-range-performance'),
  { loading: () => widgetFallback }
)
const WeekdayPNLChart = dynamic(() => import('../components/charts/client/weekday-pnl'), { loading: () => widgetFallback })
const PnLBySideChart = dynamic(() => import('../components/charts/client/pnl-by-side'), { loading: () => widgetFallback })
const PnLPerContractChart = dynamic(
  () => import('../components/charts/client/pnl-per-contract'),
  { loading: () => widgetFallback }
)
const PnLPerContractDailyChart = dynamic(
  () => import('../components/charts/client/pnl-per-contract-daily'),
  { loading: () => widgetFallback }
)
const ContractQuantityChart = dynamic(
  () => import('../components/charts/client/contract-quantity'),
  { loading: () => widgetFallback }
)
const AveragePositionTimeCard = dynamic(
  () => import('../components/statistics/average-position-time-card'),
  { loading: () => widgetFallback }
)
const CumulativePnlCard = dynamic(
  () => import('../components/statistics/cumulative-pnl-card'),
  { loading: () => widgetFallback }
)
const LongShortPerformanceCard = dynamic(
  () => import('../components/statistics/long-short-card'),
  { loading: () => widgetFallback }
)
const TradePerformanceCard = dynamic(
  () => import('../components/statistics/trade-performance-card'),
  { loading: () => widgetFallback }
)
const WinningStreakCard = dynamic(
  () => import('../components/statistics/winning-streak-card'),
  { loading: () => widgetFallback }
)
const RiskRewardRatioCard = dynamic(
  () => import('../components/statistics/risk-reward-ratio-card'),
  { loading: () => widgetFallback }
)
const CalendarPnl = dynamic(() => import('../components/calendar/calendar-widget'), { loading: () => widgetFallback })
const CommissionsPnLChart = dynamic(
  () => import('../components/charts/client/commissions-pnl'),
  { loading: () => widgetFallback }
)
const StatisticsWidget = dynamic(
  () => import('../components/statistics/statistics-widget'),
  { loading: () => widgetFallback }
)
const TradeTableReview = dynamic(
  () => import('../components/tables/trade-table-review').then((m) => m.TradeTableReview),
  { loading: () => widgetFallback }
)
const MoodSelector = dynamic(
  () => import('../components/calendar/mood-selector').then((m) => m.MoodSelector),
  { loading: () => widgetFallback }
)
const TradeDistributionChart = dynamic(
  () => import('../components/charts/client/trade-distribution'),
  { loading: () => widgetFallback }
)
const AccountsOverview = dynamic(
  () => import('../components/accounts/accounts-overview').then((m) => m.AccountsOverview),
  { loading: () => widgetFallback }
)
const TagWidget = dynamic(
  () => import('../components/filters/tag-widget').then((m) => m.TagWidget),
  { loading: () => widgetFallback }
)
const ProfitFactorCard = dynamic(
  () => import('../components/statistics/profit-factor-card'),
  { loading: () => widgetFallback }
)
const DailyTickTargetChart = dynamic(
  () => import('../components/charts/client/daily-tick-target'),
  { loading: () => widgetFallback }
)
const MindsetWidget = dynamic(
  () => import('../components/mindset/mindset-widget').then((m) => m.MindsetWidget),
  { loading: () => widgetFallback }
)
const ChatWidget = dynamic(() => import('../components/chat/chat'), { loading: () => widgetFallback })
const TradingScoreWidget = dynamic(
  () => import('../components/widgets/trading-score-widget'),
  { loading: () => widgetFallback }
)
const ExpectancyWidget = dynamic(
  () => import('../components/widgets/expectancy-widget'),
  { loading: () => widgetFallback }
)
const RiskMetricsWidget = dynamic(
  () => import('../components/widgets/risk-metrics-widget'),
  { loading: () => widgetFallback }
)
const PropfirmCatalogueWidget = dynamic(
  () => import('../components/widgets/propfirm-catalogue-widget'),
  { loading: () => widgetFallback }
)

// Lightweight chart preview skeleton — no dynamic imports, pure CSS
function ChartPreviewSkeleton({ title }: { title: string }) {
  return (
    <Card data-chart-surface="modern" className="h-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex flex-col gap-3">
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex-1 rounded-t bg-muted" style={{ height: `${30 + ((i * 11) % 70)}%` }} />
          ))}
        </div>
        <div className="h-3 w-3/4 bg-muted rounded" />
      </CardContent>
    </Card>
  )
}

function StatPreviewSkeleton({ height = 100 }: { height?: number }) {
  return (
    <div className="h-[300px] rounded-xl border border-border/20 bg-gradient-to-br from-muted/50 to-muted/20 ring-1 ring-inset ring-white/[0.02] p-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-2 w-full rounded" />
      </div>
    </div>
  )
}
// import MarketChart from '../components/market/market-chart'

export interface WidgetConfig {
  type: WidgetType
  defaultSize: WidgetSize
  allowedSizes: WidgetSize[]
  category: 'charts' | 'statistics' | 'tables' | 'other'
  requiresFullWidth?: boolean
  minWidth?: number
  minHeight?: number
  previewHeight?: number
  getComponent: (props: { size: WidgetSize }) => React.JSX.Element
  getPreview: () => React.JSX.Element
}

// Helper function to create table preview
function createTablePreview(type: 'tradeTableReview' | 'consistencyTable') {
  return (
    <Card data-chart-surface="modern" className="h-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {type === 'tradeTableReview' ? 'Trade Review' : 'Consistency Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-2 bg-background/25 rounded-md border-border/30">
            {Array(type === 'tradeTableReview' ? 4 : 5).fill(0).map((_, i) => (
              <div key={i} className={cn(
                "h-4 bg-muted rounded",
                type === 'tradeTableReview'
                  ? i === 1 ? "flex-3" : "flex-2"
                  : i < 2 ? "flex-2" : "flex-1"
              )} />
            ))}
          </div>
          {[...Array(4)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-2 border border-border/30 rounded-md">
              {Array(type === 'tradeTableReview' ? 4 : 5).fill(0).map((_, i) => (
                <div key={i} className={cn(
                  "h-3 bg-muted rounded",
                  type === 'tradeTableReview'
                    ? i === 1 ? "flex-3" : "flex-2"
                    : i < 2 ? "flex-2" : "flex-1"
                )} />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function createPropfirmPreview() {
  // Sample data for the preview
  const data = [
    { name: '1', equity: 100, drawdown: 95 },
    { name: '2', equity: 120, drawdown: 110 },
    { name: '3', equity: 115, drawdown: 105 },
    { name: '4', equity: 130, drawdown: 120 },
    { name: '5', equity: 140, drawdown: 130 },
    { name: '6', equity: 150, drawdown: 140 },
  ]

  return (
    <Card data-chart-surface="modern" className="h-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Propfirm</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="w-full flex flex-col gap-3">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2 p-3 bg-background/25 rounded-md border-border/30">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="h-20 w-full">
                <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
                  <polyline
                    points="0,35 20,25 40,28 60,18 80,14 100,8"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                  />
                  <polyline
                    points="0,36 20,28 40,30 60,22 80,18 100,14"
                    fill="none"
                    stroke="hsl(var(--foreground) / 0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function createMindsetPreview() {
  const t = useI18n()
  return (
    <Card className="h-[300px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{t('mindset.title')}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-background/25" />
              <div className="h-1.5 w-1.5 rounded-full bg-background/25" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-row">
        {/* Timeline mock */}
        <div className="w-16 border-r p-2 flex flex-col gap-1">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                index === 2 ? "bg-foreground border-foreground" : "border-muted-foreground/20"
              )}>
                <div className="h-1 w-1 rounded-full bg-primary/[0.03]" />
              </div>
              {index < 6 && <div className="h-4 w-px bg-muted" />}
            </div>
          ))}
        </div>

        {/* Content area mock */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-background/25 rounded-full" />
              <div className="h-6 w-20 bg-background/25 rounded-full" />
              <div className="h-6 w-18 bg-background/25 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-16 w-full bg-background/25 rounded border-border/30" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-background/25 rounded-full" />
              <div className="h-2 flex-1 bg-muted rounded-full">
                <div className="h-2 w-1/2 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateCalendarPreview() {
  const t = useI18n()
  const weekdays = [
    'calendar.weekdays.sun',
    'calendar.weekdays.mon',
    'calendar.weekdays.tue',
    'calendar.weekdays.wed',
    'calendar.weekdays.thu',
    'calendar.weekdays.fri',
    'calendar.weekdays.sat'
  ] as const

  return (
    <Card data-chart-surface="modern" className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
              {translateWeekday(t, day)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 h-[calc(100%-40px)]">
          {/* Calendar days - just empty boxes showing the structure */}
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-1 rounded border border-border/30 hover:bg-background/0.08 transition-colors cursor-pointer"
            >
              <div className="h-4 w-full bg-muted rounded mb-0.5" />
              <div className="h-2 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CreateChatPreview() {
  const t = useI18n()

  return (
    <Card className="h-[300px] flex flex-col bg-background relative">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
          <Button  variant="ghost" size="sm" className="h-6 px-2 text-xs">
            Reset
          </Button>
        </div>
      </CardHeader>

      {/* Chat area */}
      <CardContent className="flex-1 flex flex-col min-h-0 p-0 relative">
        <div className="flex-1 min-h-0 w-full overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Bot message */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="bg-background/25 rounded-lg p-2 max-w-[80%]">
                <div className="h-3 w-32 bg-muted rounded mb-1" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>

            {/* User message */}
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-primary rounded-lg p-2 max-w-[80%]">
                <div className="h-3 w-20 bg-primary-foreground/40 rounded" />
              </div>
              <div className="w-6 h-6 rounded-full bg-background/25 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-background/25-foreground" />
              </div>
            </div>

            {/* Bot message */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="bg-background/25 rounded-lg p-2 max-w-[80%]">
                <div className="h-3 w-40 bg-muted rounded mb-1" />
                <div className="h-3 w-28 bg-muted rounded mb-1" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 bg-background/25 rounded-md border-border/30 flex items-center px-3">
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <Button size="sm" className="h-9 px-3">
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function createSmartInsightsPreview() {
  return (
    <Card className="h-[300px] flex flex-col relative overflow-hidden bg-popover/40 border-border/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-semantic-info-bg/5 rounded-full blur-3xl -z-10" />
      <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2 px-4 pt-4">
        <div className="space-y-1">
          <div className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-semantic-info" />
            Smart Insights
          </div>
          <div className="text-xs text-muted-foreground">
            AI-driven analysis & opportunities
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 gap-3">
        <div className="flex items-start gap-3 rounded-lg border border-border/5 bg-background/0.08 p-3">
          <div className="h-8 w-8 rounded-full bg-semantic-info-bg/10 border border-semantic-info-border/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-semantic-info" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-background/0.01 rounded" />
            <div className="h-3 w-full bg-background/0.08 rounded" />
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border/5 bg-background/0.08 p-3 opacity-60">
          <div className="h-8 w-8 rounded-full bg-semantic-error-bg/10 border border-semantic-error-border/20 flex items-center justify-center">
            <div className="h-4 w-4 rounded-sm bg-semantic-error-bg/50" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-16 bg-background/0.01 rounded" />
            <div className="h-3 w-3/4 bg-background/0.08 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  smartInsights: {
    type: 'smartInsights',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    category: 'statistics',
    previewHeight: 300,
    getComponent: ({ size }) => <SmartInsightsWidget size={size} />,
    getPreview: () => createSmartInsightsPreview()
  },
  weekdayPnlChart: {
    type: 'weekdayPnlChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <WeekdayPNLChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Weekday P&L" />
  },
  pnlChart: {
    type: 'pnlChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <PNLChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="P&L Chart" />
  },
  timeOfDayChart: {
    type: 'timeOfDayChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <TimeOfDayTradeChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Time of Day" />
  },
  timeInPositionChart: {
    type: 'timeInPositionChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <TimeInPositionChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Time in Position" />
  },
  equityChart: {
    type: 'equityChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <EquityChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Equity Curve" />
  },
  pnlBySideChart: {
    type: 'pnlBySideChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <PnLBySideChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Long vs Short" />
  },
  pnlPerContractChart: {
    type: 'pnlPerContractChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <PnLPerContractChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="P&L Per Contract" />
  },
  pnlPerContractDailyChart: {
    type: 'pnlPerContractDailyChart',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <PnLPerContractDailyChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Daily P&L/Contract" />
  },
  tickDistribution: {
    type: 'tickDistribution',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <TickDistributionChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Tick Distribution" />
  },
  commissionsPnl: {
    type: 'commissionsPnl',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <CommissionsPnLChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Commissions" />
  },
  tradeDistribution: {
    type: 'tradeDistribution',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <TradeDistributionChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Trade Distribution" />
  },
  averagePositionTime: {
    type: 'averagePositionTime',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <AveragePositionTimeCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  cumulativePnl: {
    type: 'cumulativePnl',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <CumulativePnlCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  longShortPerformance: {
    type: 'longShortPerformance',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <LongShortPerformanceCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  tradePerformance: {
    type: 'tradePerformance',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <TradePerformanceCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  winningStreak: {
    type: 'winningStreak',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <WinningStreakCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  profitFactor: {
    type: 'profitFactor',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <ProfitFactorCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  dailyTickTarget: {
    type: 'dailyTickTarget',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <DailyTickTargetChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Daily Tick Target" />
  },
  statisticsWidget: {
    type: 'statisticsWidget',
    defaultSize: 'medium',
    allowedSizes: ['medium'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <StatisticsWidget size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  chatWidget: {
    type: 'chatWidget',
    defaultSize: 'large',
    allowedSizes: ['large'],
    category: 'other',
    previewHeight: 300,
    getComponent: ({ size }) => <ChatWidget size={size} />,
    getPreview: () => <CreateChatPreview />
  },
  calendarWidget: {
    type: 'calendarWidget',
    defaultSize: 'large',
    allowedSizes: ['large', 'extra-large'],
    category: 'other',
    previewHeight: 500,
    getComponent: () => <CalendarPnl />,
    getPreview: () => <CreateCalendarPreview />
  },
  tradeTableReview: {
    type: 'tradeTableReview',
    defaultSize: 'extra-large',
    allowedSizes: ['large', 'extra-large'],
    category: 'tables',
    requiresFullWidth: true,
    previewHeight: 300,
    getComponent: () => <TradeTableReview />,
    getPreview: () => createTablePreview('tradeTableReview')
  },
  propFirm: {
    type: 'propFirm',
    defaultSize: 'extra-large',
    allowedSizes: ['medium', 'large', 'extra-large'],
    category: 'tables',
    previewHeight: 300,
    getComponent: ({ size }) => <AccountsOverview size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Accounts" />
  },
  propFirmCatalogue: {
    type: 'propFirmCatalogue',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large', 'extra-large'],
    category: 'statistics',
    previewHeight: 300,
    getComponent: ({ size }) => <PropfirmCatalogueWidget />,
    getPreview: () => createPropfirmPreview()
  },
  timeRangePerformance: {
    type: 'timeRangePerformance',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <TimeRangePerformanceChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Time Range" />
  },
  mindsetWidget: {
    type: 'mindsetWidget',
    defaultSize: 'large',
    allowedSizes: ['extra-large', 'large'],
    category: 'other',
    previewHeight: 300,
    getComponent: ({ size }) => <MindsetWidget size={size} />,
    getPreview: () => createMindsetPreview()
  },
  tagWidget: {
    type: 'tagWidget',
    defaultSize: 'small',
    allowedSizes: ['small', 'medium', 'large'],
    category: 'other',
    previewHeight: 300,
    getComponent: ({ size }) => <TagWidget />,
    getPreview: () => <StatPreviewSkeleton />
  },
  riskRewardRatio: {
    type: 'riskRewardRatio',
    defaultSize: 'tiny',
    allowedSizes: ['tiny'],
    category: 'statistics',
    previewHeight: 100,
    getComponent: ({ size }) => <RiskRewardRatioCard size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  tradingScore: {
    type: 'tradingScore',
    defaultSize: 'small',
    allowedSizes: ['small', 'small-long', 'medium'],
    category: 'statistics',
    previewHeight: 300,
    getComponent: ({ size }) => <TradingScoreWidget size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  expectancy: {
    type: 'expectancy',
    defaultSize: 'small',
    allowedSizes: ['small', 'small-long', 'medium'],
    category: 'statistics',
    previewHeight: 300,
    getComponent: ({ size }) => <ExpectancyWidget size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  riskMetrics: {
    type: 'riskMetrics',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'statistics',
    previewHeight: 300,
    getComponent: ({ size }) => <RiskMetricsWidget size={size} />,
    getPreview: () => <StatPreviewSkeleton />
  },
  contractQuantity: {
    type: 'contractQuantity',
    defaultSize: 'medium',
    allowedSizes: ['small', 'small-long', 'medium', 'large'],
    category: 'charts',
    previewHeight: 300,
    getComponent: ({ size }) => <ContractQuantityChart size={size} />,
    getPreview: () => <ChartPreviewSkeleton title="Contract Quantity" />
  },

}

export function getWidgetsByCategory(category: WidgetConfig['category']) {
  return Object.values(WIDGET_REGISTRY).filter(widget => widget.category === category)
}

export function isValidWidgetSize(type: WidgetType, size: WidgetSize): boolean {
  return WIDGET_REGISTRY[type].allowedSizes.includes(size)
}

export function getDefaultWidgetSize(type: WidgetType): WidgetSize {
  return WIDGET_REGISTRY[type].defaultSize
}

export function requiresFullWidth(type: WidgetType): boolean {
  return WIDGET_REGISTRY[type].requiresFullWidth ?? false
}

export function getWidgetComponent(type: WidgetType, size: WidgetSize): React.JSX.Element {
  return WIDGET_REGISTRY[type].getComponent({ size })
}

export function getWidgetPreview(type: WidgetType): React.JSX.Element {
  return WIDGET_REGISTRY[type].getPreview()
} 
