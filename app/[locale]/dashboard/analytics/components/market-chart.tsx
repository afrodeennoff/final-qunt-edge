'use client'

import { useMemo } from 'react'

interface MarketChartProps {
  data: { time: string; value: number }[]
  height?: number
}

export function MarketChart({ data, height = 300 }: MarketChartProps) {
  const svgPath = useMemo(() => {
    if (!data.length) return ''
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const w = 800
    const h = 400
    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((d.value - min) / range) * h * 0.9 - h * 0.05
        return `${x},${y}`
      })
      .join(' ')
  }, [data])

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 800 400"
        className="h-full w-full"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.22 260 / 0.15)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 260 / 0.01)" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="oklch(0.65 0.22 260)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          points={svgPath}
        />
        <polygon
          fill="url(#areaGrad)"
          points={`0,400 ${svgPath} 800,400`}
        />
      </svg>
    </div>
  )
}
