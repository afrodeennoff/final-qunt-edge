'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

interface MarketChartProps {
  data: { time: string; value: number }[]
  height?: number
}

export function MarketChart({ data, height = 300 }: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255,255,255,0.4)',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.1)', width: 1 },
        horzLine: { color: 'rgba(255,255,255,0.1)', width: 1 },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.05)' },
    })

    const areaSeries = chart.addAreaSeries({
      lineColor: 'oklch(0.65 0.22 260)',
      topColor: 'oklch(0.65 0.22 260 / 0.3)',
      bottomColor: 'oklch(0.65 0.22 260 / 0.01)',
    })

    areaSeries.setData(data)

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth ?? 400 })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height])

  return <div ref={chartContainerRef} className="w-full" />
}
