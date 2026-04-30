'use client'

import React from 'react'
import {
  DailyPnLChartEmbed,
  TimeOfDayPerformanceChart,
  TimeInPositionByHourChart,
  PnLBySideChartEmbed,
  TradeDistributionChartEmbed,
  WeekdayPnLChartEmbed,
  PnLPerContractChartEmbed,
  PnLPerContractDailyChartEmbed,
  TickDistributionChartEmbed,
  CommissionsPnLEmbed,
  ContractQuantityChartEmbed,
  TimeRangePerformanceChart,
} from './index'
import { toast, Toaster } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { applyEmbedTheme, THEME_PRESETS, getOverridesFromSearchParams } from './theme'
import Script from 'next/script'
import { I18nProviderClient } from '@/locales/client'
import { BackgroundGlow } from '@/components/ui/background-glow'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import {
  unifiedChipClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'

// Removed ThemeProvider import - using simple theme implementation

const instruments = ['ES', 'NQ', 'CL', 'GC'] as const
const sides = ['long', 'short'] as const
const dayMs = 24 * 60 * 60 * 1000

type EmbedTrade = {
  pnl: number
  timeInPosition: number
  entryDate: string
  side: string
  quantity: number
  commission: number
  instrument: string
}

function createDemoTrades(): EmbedTrade[] {
  const base = Date.UTC(2026, 0, 30, 14, 30, 0)

  return Array.from({ length: 60 }, (_, i) => {
    const entry = new Date(base - (i % 30) * dayMs - (i % 7) * 45 * 60 * 1000)
    const qty = (i % 3) + 1
    const direction = i % 5 === 0 ? -1 : 1
    const pnl = Math.round((direction * (120 + (i % 9) * 37) - (i % 4) * 22) * 100) / 100
    const timeInPosition = 300 + (i % 11) * 210

    return {
      pnl,
      timeInPosition,
      entryDate: entry.toISOString(),
      side: sides[i % sides.length] ?? 'long',
      quantity: qty,
      commission: Math.round(qty * 2.14 * 100) / 100,
      instrument: instruments[i % instruments.length] ?? 'ES',
    }
  })
}

function generateRandomTrade(): EmbedTrade {
  const qty = Math.ceil(Math.random() * 3)

  return {
    pnl: Math.round(((Math.random() - 0.4) * 500) * 100) / 100,
    timeInPosition: Math.round(Math.random() * 3600),
    entryDate: new Date(Date.now() - Math.floor(Math.random() * 20) * dayMs).toISOString(),
    side: sides[Math.floor(Math.random() * sides.length)] ?? 'long',
    quantity: qty,
    commission: Math.round(qty * (1 + Math.random() * 3) * 100) / 100,
    instrument: instruments[Math.floor(Math.random() * instruments.length)] ?? 'ES',
  }
}

function generateRandomTrades(count: number = 1) {
  return Array.from({ length: count }, generateRandomTrade)
}

function formatChartName(chartKey: string) {
  return chartKey
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function EmbedPage() {
  const searchParams = useSearchParams()
  const preset = searchParams.get('preset') || undefined
  const lang = searchParams.get('lang') || 'en'
  const allowDemoData = searchParams.get('demo') === 'true' || process.env.NODE_ENV === 'development'
  const [trades, setTrades] = React.useState<EmbedTrade[]>(() =>
    allowDemoData ? createDemoTrades() : []
  )

  // Dark-only theme with optional presets/overrides.
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.add('dark')

    // Apply optional preset (ocean, sunset, etc.) on top of light/dark
    if (preset && THEME_PRESETS[preset as keyof typeof THEME_PRESETS]) {
      applyEmbedTheme(THEME_PRESETS[preset as keyof typeof THEME_PRESETS], root)
    }

    // Apply explicit overrides from query params last
    const overrides = getOverridesFromSearchParams(searchParams)
    if (Object.keys(overrides).length > 0) {
      applyEmbedTheme(overrides, root)
    }
  }, [preset, searchParams])

  // Message listener for iframe communication
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

        if (data.type === 'ADD_TRADES') {
          const { count = 1, trades: newTrades } = data

          if (newTrades && Array.isArray(newTrades)) {
            // Add provided trades
            setTrades((prev) => [...prev, ...newTrades])
          } else if (allowDemoData) {
            toast.error('No trades provided', { description: `Generating ${count} random trades` })
            // Generate random trades
            const randomTrades = generateRandomTrades(count)
            setTrades((prev) => [...prev, ...randomTrades])
          } else {
            toast.error('No trades provided', {
              description: 'Send trades with the ADD_TRADES message or open with ?demo=true.',
            })
          }
        } else if (data.type === 'RESET_TRADES') {
          setTrades(allowDemoData ? createDemoTrades() : [])
        } else if (data.type === 'CLEAR_TRADES') {
          // Clear all trades
          setTrades([])
        } else if (data.type === 'SET_THEME') {
          const root = document.documentElement
          const { preset: p, vars } = data
          root.classList.add('dark')
          if (p && THEME_PRESETS[p as keyof typeof THEME_PRESETS]) {
            applyEmbedTheme(THEME_PRESETS[p as keyof typeof THEME_PRESETS], root)
          }
          if (vars && typeof vars === 'object') {
            applyEmbedTheme(vars, root)
          }
        }
      } catch (error) {
        toast.error('Error processing message', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [allowDemoData])

  const selectedInstrument = React.useMemo(() => {
    const counts: Record<string, number> = {}
    trades.forEach((t) => {
      if (!t.instrument) return
      counts[t.instrument] = (counts[t.instrument] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || instruments[0]
  }, [trades])

  // Parse chart selection via search params: `charts`
  const chartParam = searchParams.get('charts') || 'all'
  const selectedCharts = React.useMemo(() => {
    if (!chartParam || chartParam.toLowerCase() === 'all') return null
    const set = new Set(
      chartParam
        .split(',')
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean),
    )
    return set.size ? set : null
  }, [chartParam])

  const chartDefinitions = React.useMemo(
    () => [
      {
        key: 'time-range-performance',
        render: () => <TimeRangePerformanceChart trades={trades} />,
      },
      { key: 'daily-pnl', render: () => <DailyPnLChartEmbed trades={trades} /> },
      { key: 'time-of-day', render: () => <TimeOfDayPerformanceChart trades={trades} /> },
      { key: 'time-in-position', render: () => <TimeInPositionByHourChart trades={trades} /> },
      { key: 'pnl-by-side', render: () => <PnLBySideChartEmbed trades={trades} /> },
      { key: 'trade-distribution', render: () => <TradeDistributionChartEmbed trades={trades} /> },
      { key: 'weekday-pnl', render: () => <WeekdayPnLChartEmbed trades={trades} /> },
      { key: 'pnl-per-contract', render: () => <PnLPerContractChartEmbed trades={trades} /> },
      {
        key: 'pnl-per-contract-daily',
        render: () => (
          <PnLPerContractDailyChartEmbed trades={trades} instrument={selectedInstrument} />
        ),
      },
      { key: 'tick-distribution', render: () => <TickDistributionChartEmbed trades={trades} /> },
      { key: 'commissions-pnl', render: () => <CommissionsPnLEmbed trades={trades} /> },
      { key: 'contract-quantity', render: () => <ContractQuantityChartEmbed trades={trades} /> },
    ],
    [trades, selectedInstrument],
  )

  // Function to send chart click message to parent
  const sendChartClickMessage = React.useCallback((chartKey: string, chartName: string) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'CHART_CLICKED',
          chartKey,
          chartName,
        },
        '*',
      )
    }
  }, [])

  const chartsToRender = React.useMemo(() => {
    const filtered = chartDefinitions.filter((c) => !selectedCharts || selectedCharts.has(c.key))
    // If selection was provided but no keys matched, fall back to all
    return (selectedCharts && filtered.length === 0 ? chartDefinitions : filtered).map(
      (component) => (
        <div
          key={component.key}
          className="group relative cursor-pointer rounded-[1.4rem] border frost-border-5 frost-bg-ghost p-1 transition-transform duration-200 hover:-translate-y-0.5"
          onClick={() => {
            sendChartClickMessage(component.key, formatChartName(component.key))
          }}
          title={`Click to add "${formatChartName(component.key)}" to selection`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] border frost-border-5 transition-colors duration-200 group-hover:frost-border-7 group-hover:shadow-[0_14px_26px_-24px_rgba(0,0,0,0.62)]" />
          <div className="relative">{component.render()}</div>
        </div>
      ),
    )
  }, [chartDefinitions, selectedCharts, sendChartClickMessage])

  return (
    <I18nProviderClient locale={lang}>
      <div className="qe-v2-app-shell relative min-h-screen w-full pb-20">
        <BackgroundGlow variant="default" />
        {/*Dismiss cookie consent banner*/}
        <Script id="embed-autoconsent" strategy="beforeInteractive">
          {`try {
            if (typeof window !== 'undefined' && window.localStorage && !window.localStorage.getItem('cookieConsent')) {
              window.localStorage.setItem('cookieConsent', JSON.stringify({
                analytics_storage: false,
                ad_storage: false,
                ad_user_data: false,
                ad_personalization: false,
                functionality_storage: true,
                personalization_storage: false,
                security_storage: true
              }))
            }
          } catch (e) {}`}
        </Script>

        <Toaster />
        <div
          className={cn(
            'relative z-10 mx-auto flex flex-col gap-4 px-4 pt-4 lg:gap-6 lg:px-6 lg:pt-6',
            WORKSPACE_SHELL_WIDTH,
          )}
        >
          <MotionSection delay={0.03}>
            <section className={cn(unifiedHeroPanelClassName, 'px-5 py-5 lg:px-6')}>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className={cn(unifiedInsetPanelClassName, 'p-5')}>
                  <div className={unifiedChipClassName}>Embed Library</div>
                  <div className="pt-4">
                    <h1 className="text-xl font-[350] tracking-[-0.04em] text-foreground lg:text-2xl">
                      Qunt Edge chart modules
                    </h1>
                    <p className="max-w-3xl pt-2 text-sm leading-[1.75] text-muted-foreground">
                      Production-ready embed cards with preserved query-param theming, selection,
                      and postMessage contracts.
                    </p>
                  </div>
                </div>
                <MotionStagger className="grid gap-2 text-xs text-muted-foreground/80 sm:grid-cols-2 lg:grid-cols-1">
                  <MotionStaggerItem>
                    <div className={cn(unifiedMetricPanelClassName, 'px-3 py-2.5')}>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Preset
                      </span>
                      <span className="block pt-1 text-sm font-medium text-foreground">
                        {preset ?? 'Default'}
                      </span>
                    </div>
                  </MotionStaggerItem>
                  <MotionStaggerItem>
                    <div className={cn(unifiedMetricPanelClassName, 'px-3 py-2.5')}>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Charts
                      </span>
                      <span className="block pt-1 text-sm font-medium text-foreground">
                        {selectedCharts ? Array.from(selectedCharts).length : 'All'}
                      </span>
                    </div>
                  </MotionStaggerItem>
                </MotionStagger>
              </div>
            </section>
          </MotionSection>

          <MotionSection delay={0.08}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">{chartsToRender}</div>
          </MotionSection>
        </div>
      </div>
    </I18nProviderClient>
  )
}
