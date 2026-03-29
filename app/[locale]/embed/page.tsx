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


// Removed ThemeProvider import - using simple theme implementation

const instruments = ['ES', 'NQ', 'CL', 'GC'] as const

type EmbedTrade = {
  pnl: number
  timeInPosition: number
  quantity: number
  commission: number
  entryDate: string | Date
  side?: 'long' | 'short' | string
  instrument?: string
}

function isEmbedTrade(value: unknown): value is EmbedTrade {
  if (!value || typeof value !== 'object') {
    return false
  }

  const trade = value as Record<string, unknown>
  return (
    typeof trade.pnl === 'number' &&
    Number.isFinite(trade.pnl) &&
    typeof trade.timeInPosition === 'number' &&
    Number.isFinite(trade.timeInPosition) &&
    typeof trade.quantity === 'number' &&
    Number.isFinite(trade.quantity) &&
    typeof trade.commission === 'number' &&
    Number.isFinite(trade.commission) &&
    (typeof trade.entryDate === 'string' || trade.entryDate instanceof Date)
  )
}

export default function EmbedPage() {
    const searchParams = useSearchParams()
    const preset = searchParams.get('preset') || undefined
    const lang = searchParams.get('lang') || 'en'
    const [trades, setTrades] = React.useState<EmbedTrade[]>([])

    // Dark-only theme with optional presets/overrides.
    React.useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
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
                    const { trades: newTrades } = data

                    if (newTrades && Array.isArray(newTrades)) {
                        const validTrades = newTrades.filter(isEmbedTrade)
                        if (validTrades.length === 0) {
                          toast.error('No valid trades provided', { description: 'ADD_TRADES requires trades with pnl and timeInPosition.' })
                          return
                        }
                        setTrades(prev => [...prev, ...validTrades])
                    } else {
                        toast.error('No trades provided', { description: 'ADD_TRADES requires a trades array.' })
                    }
                } else if (data.type === 'RESET_TRADES') {
                    // Reset to empty live dataset
                    setTrades([])
                } else if (data.type === 'CLEAR_TRADES') {
                    // Clear all trades
                    setTrades([])
                } else if (data.type === 'SET_THEME') {
                    const root = document.documentElement
                    const { preset: p, vars } = data
                    root.classList.remove('light', 'dark')
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
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            const chartName = component.key.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
            sendChartClickMessage(component.key, chartName)
          }}
          title={`Click to add "${component.key.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}" to selection`}
        >
          {component.render()}
        </div>
      ))
    }, [chartDefinitions, selectedCharts, sendChartClickMessage])

    return (
      <I18nProviderClient locale={lang}>
        <div className="w-full h-full min-h-[400px] mb-20">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {chartsToRender}
          </div>
        </div>
      </I18nProviderClient>
    )
}
