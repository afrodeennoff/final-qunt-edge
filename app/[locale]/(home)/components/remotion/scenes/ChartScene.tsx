import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import {
  PRIMARY,
  SUCCESS,
  ERROR,
  BG_BASE,
  BG_CARD,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors'

// Equity curve data — simulated cumulative PnL points
const EQUITY_POINTS = [
  0, 120, 280, 190, 420, 380, 550, 610, 520, 700, 830, 780, 920, 1050, 980, 1120, 1200, 1350, 1280,
  1420, 1560, 1500, 1680, 1750, 1620, 1800, 1920, 2050, 1980, 2150,
]

// 8 daily PnL bars
const DAILY_PNL = [320, -150, 480, 210, -90, 350, 120, 280]

function generateSmoothPath(
  points: number[],
  width: number,
  height: number,
  padding: number,
): string {
  const maxVal = Math.max(...points)
  const minVal = Math.min(...points, 0)
  const range = maxVal - minVal || 1

  const coords = points.map((p, i) => ({
    x: padding + (i / (points.length - 1)) * (width - padding * 2),
    y: padding + (1 - (p - minVal) / range) * (height - padding * 2),
  }))

  let path = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return path
}

export const ChartScene: React.FC = () => {
  const frame = useCurrentFrame()

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  })
  const titleY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // Equity curve draw-in animation
  const chartWidth = 1100
  const chartHeight = 320
  const chartPadding = 20

  const equityPath = generateSmoothPath(EQUITY_POINTS, chartWidth, chartHeight, chartPadding)

  const pathLength = chartWidth * 1.8
  const drawProgress = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
  const strokeDashoffset = pathLength * (1 - drawProgress)

  // Area fill opacity
  const areaOpacity = interpolate(frame, [50, 90], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Grid lines fade
  const gridOpacity = interpolate(frame, [10, 30], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Daily PnL bar stagger
  const barStartFrame = 40

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: BG_BASE,
        display: 'flex',
        flexDirection: 'column',
        padding: 48,
        fontFamily: 'var(--font-ui-native, system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: TEXT_TERTIARY,
            margin: 0,
          }}
        >
          Step 02 &mdash; Review session
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: TEXT_STRONG,
            margin: '8px 0 0 0',
            letterSpacing: '-0.02em',
          }}
        >
          Review Performance
        </p>
      </div>

      {/* Main equity curve SVG in dark card */}
      <div
        style={{
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 16,
          padding: 20,
          flex: 1,
          position: 'relative',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={chartPadding}
              y1={chartHeight * ratio}
              x2={chartWidth - chartPadding}
              y2={chartHeight * ratio}
              stroke={TEXT_TERTIARY}
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          ))}

          {/* Gradient fill under curve — PRIMARY cobalt */}
          <defs>
            <linearGradient id="equityAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Filled area */}
          <path
            d={`${equityPath} L ${chartWidth - chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${chartHeight - chartPadding} Z`}
            fill="url(#equityAreaGrad)"
            opacity={areaOpacity}
          />

          {/* Equity line — PRIMARY cobalt */}
          <path
            d={equityPath}
            fill="none"
            stroke={PRIMARY}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
          />

          {/* End dot */}
          {drawProgress > 0.9 && (
            <circle
              cx={chartWidth - chartPadding}
              cy={
                chartPadding +
                (1 - EQUITY_POINTS[EQUITY_POINTS.length - 1]! / Math.max(...EQUITY_POINTS)) *
                  (chartHeight - chartPadding * 2)
              }
              r={5}
              fill={PRIMARY}
              opacity={interpolate(frame, [85, 95], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          )}
        </svg>
      </div>

      {/* Daily PnL bar chart — 8 bars */}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
          height: 56,
          paddingLeft: 4,
        }}
      >
        {DAILY_PNL.map((pnl, i) => {
          const barFrame = barStartFrame + i * 4
          const barHeight = interpolate(
            frame,
            [barFrame, barFrame + 14],
            [0, Math.abs(pnl) / 550],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            },
          )
          const barOpacity = interpolate(frame, [barFrame, barFrame + 10], [0, 0.85], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: `${barHeight * 100}%`,
                  minHeight: pnl !== 0 ? 2 : 0,
                  backgroundColor: pnl >= 0 ? PRIMARY : ERROR,
                  opacity: barOpacity,
                  borderRadius: 4,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Daily PnL summary bar */}
      <div
        style={{
          marginTop: 12,
          opacity: interpolate(frame, [70, 90], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(frame, [70, 90], [6, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: SUCCESS,
            }}
          />
          <span style={{ fontSize: 13, color: SUCCESS, fontWeight: 600 }}>+$2,150 today</span>
        </div>
      </div>
    </div>
  )
}

export default ChartScene
