'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { ChartSurface } from '@/components/ui/chart-surface'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>

export const EquityChart = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/equity-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

export const PnLBarChart = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/pnl-bar-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

export const WeekdayPnL = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/weekday-pnl'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

export const TimeRangePerformance = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/time-range-performance'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

export const TradeDistribution = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/trade-distribution'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

export const PnLBySide = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/pnl-by-side'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as AnyComponent

function ChartSkeleton() {
  return (
    <ChartSurface state="loading" className="h-[300px]" />
  )
}
