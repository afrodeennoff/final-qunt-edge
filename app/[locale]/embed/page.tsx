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
import { MotionSection, MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'


// Removed ThemeProvider import - using simple theme implementation

// Mock trade data enriched with typical fields
const instruments = ['ES', 'NQ', 'CL', 'GC'] as const
const sides = ['long', 'short'] as const
const now = Date.now()
const dayMs = 24 * 60 * 60 * 1000
const mockTrades = Array.from({ length: 60 }, (_, i) => {
  const entry = new Date(now - Math.floor(Math.random() * 30) * dayMs - Math.floor(Math.random() * 24) * 3600 * 1000)
  const qty = Math.ceil(Math.random() * 3)
  const pnl = Math.round(((Math.random() - 0.4) * 500) * 100) / 100
  const timeInPosition = Math.floor(Math.random() * 3600)
  return {
    pnl,
    timeInPosition,
    entryDate: entry.toISOString(),
    side: sides[Math.floor(Math.random() * sides.length)],
    quantity: qty,
    commission: Math.round(qty * (1 + Math.random() * 3) * 100) / 100,
    instrument: instruments[Math.floor(Math.random() * instruments.length)],
  }
})

// Function to generate random trade data
function generateRandomTrade() {
  const qty = Math.ceil(Math.random() * 3)
  const pnl = (Math.random() - 0.4) * 500
  const timeInPosition = Math.random() * 3600
  const entry = new Date(Date.now() - Math.floor(Math.random() * 20) * dayMs)
  return {
    pnl: Math.round(pnl * 100) / 100,
    timeInPosition: Math.round(timeInPosition),
    entryDate: entry.toISOString(),
    side: sides[Math.floor(Math.random() * sides.length)],
    quantity: qty,
    commission: Math.round(qty * (1 + Math.random() * 3) * 100) / 100,
    instrument: instruments[Math.floor(Math.random() * instruments.length)],
  }
}

// Function to generate multiple random trades
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
    const [trades, setTrades] = React.useState<Array<{ pnl: number; timeInPosition: number; entryDate: string; side: string; quantity: number; commission: number; instrument: string }>>(mockTrades)

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
                        setTrades(prev => [...prev, ...newTrades])
                    } else {
                        toast.error('No trades provided', { description: `Generating ${count} random trades` })
                        // Generate random trades
                        const randomTrades = generateRandomTrades(count)
                        setTrades(prev => [...prev, ...randomTrades])
                    }
                } else if (data.type === 'RESET_TRADES') {
                    // Reset to original mock data
                    setTrades(mockTrades)
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
                toast.error('Error processing message', { description: error instanceof Error ? error.message : 'Unknown error' })
            }
        }

        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

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
          .filter(Boolean)
      )
      return set.size ? set : null
    }, [chartParam])

    const chartDefinitions = React.useMemo(() => (
      [
        { key: 'time-range-performance', render: () => <TimeRangePerformanceChart trades={trades} /> },
        { key: 'daily-pnl', render: () => <DailyPnLChartEmbed trades={trades} /> },
        { key: 'time-of-day', render: () => <TimeOfDayPerformanceChart trades={trades} /> },
        { key: 'time-in-position', render: () => <TimeInPositionByHourChart trades={trades} /> },
        { key: 'pnl-by-side', render: () => <PnLBySideChartEmbed trades={trades} /> },
        { key: 'trade-distribution', render: () => <TradeDistributionChartEmbed trades={trades} /> },
        { key: 'weekday-pnl', render: () => <WeekdayPnLChartEmbed trades={trades} /> },
        { key: 'pnl-per-contract', render: () => <PnLPerContractChartEmbed trades={trades} /> },
        { key: 'pnl-per-contract-daily', render: () => <PnLPerContractDailyChartEmbed trades={trades} instrument={selectedInstrument} /> },
        { key: 'tick-distribution', render: () => <TickDistributionChartEmbed trades={trades} /> },
        { key: 'commissions-pnl', render: () => <CommissionsPnLEmbed trades={trades} /> },
        { key: 'contract-quantity', render: () => <ContractQuantityChartEmbed trades={trades} /> },
      ]
    ), [trades, selectedInstrument])

    // Function to send chart click message to parent
    const sendChartClickMessage = React.useCallback((chartKey: string, chartName: string) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'CHART_CLICKED',
          chartKey,
          chartName
        }, '*')
      }
    }, [])

    const chartsToRender = React.useMemo(() => {
      const filtered = chartDefinitions.filter((c) => !selectedCharts || selectedCharts.has(c.key))
      // If selection was provided but no keys matched, fall back to all
      return (selectedCharts && filtered.length === 0 ? chartDefinitions : filtered).map((component) => (
        <div 
          key={component.key}
          className="group relative cursor-pointer rounded-[2rem] transition-transform duration-200 hover:-translate-y-1"
          onClick={() => {
            sendChartClickMessage(component.key, formatChartName(component.key))
          }}
          title={`Click to add "${formatChartName(component.key)}" to selection`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.04] transition-colors duration-200 group-hover:border-white/[0.12] group-hover:shadow-[0_26px_48px_-36px_rgba(16,185,129,0.35)]" />
          <div className="relative">{component.render()}</div>
        </div>
      ))
    }, [chartDefinitions, selectedCharts, sendChartClickMessage])

    return (
      <I18nProviderClient locale={lang}>
        <div className="qe-v2-app-shell relative min-h-screen w-full pb-20">
          <BackgroundGlow variant="accent" />
          {/*Dismiss cookie consent banner*/}
          <Script id="embed-autoconsent" strategy="beforeInteractive">
          {`try {
            if (!window.localStorage.getItem('cookieConsent')) {
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
          } catch (e) {}`
          }
          </Script>

          <Toaster />
          <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-4 px-4 pt-4 lg:gap-5 lg:px-6 lg:pt-6">
            <MotionSection delay={0.03}>
              <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-black/70 px-5 py-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_24px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:px-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                  <div className="rounded-[1.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
                    <div className="inline-flex w-fit rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/34">
                      Embed Library
                    </div>
                    <div className="pt-4">
                      <h1 className="text-xl font-[350] tracking-[-0.04em] text-foreground lg:text-2xl">
                        Qunt Edge chart modules
                      </h1>
                      <p className="max-w-3xl pt-2 text-sm leading-[1.75] text-foreground/56">
                        Production-ready embed cards with preserved query-param theming, selection, and postMessage contracts.
                      </p>
                    </div>
                  </div>
                  <MotionStagger className="grid gap-2 text-xs text-foreground/50 sm:grid-cols-2 lg:grid-cols-1">
                    <MotionStaggerItem>
                      <div className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Preset</span>
                        <span className="block pt-1 text-sm font-medium text-foreground">{preset ?? 'Default'}</span>
                      </div>
                    </MotionStaggerItem>
                    <MotionStaggerItem>
                      <div className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Charts</span>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
                {chartsToRender}
              </div>
            </MotionSection>
          </div>
        </div>
      </I18nProviderClient>
    )
}
