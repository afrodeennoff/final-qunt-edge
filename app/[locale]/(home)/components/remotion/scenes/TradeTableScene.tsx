import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import {
  PRIMARY,
  SUCCESS,
  ERROR,
  BG_BASE,
  BG_CARD,
  BG_ELEVATED,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors'

interface TradeRow {
  instrument: string
  side: 'Long' | 'Short'
  entry: string
  exit: string
  pnl: number
}

const TRADES: TradeRow[] = [
  { instrument: 'ES', side: 'Long', entry: '4,521.50', exit: '4,538.25', pnl: 450 },
  { instrument: 'NQ', side: 'Short', entry: '15,842.00', exit: '15,780.75', pnl: -180 },
  { instrument: 'CL', side: 'Long', entry: '78.32', exit: '79.85', pnl: 320 },
  { instrument: 'GC', side: 'Short', entry: '2,048.60', exit: '2,034.10', pnl: 210 },
  { instrument: 'YM', side: 'Long', entry: '38,412', exit: '38,298', pnl: -95 },
  { instrument: 'ES', side: 'Short', entry: '4,540.00', exit: '4,462.50', pnl: 580 },
]

function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(value).toLocaleString()}`
}

const COLUMNS = ['Instrument', 'Side', 'Entry', 'Exit', 'PnL']

export const TradeTableScene: React.FC = () => {
  const frame = useCurrentFrame()

  // Header animation
  const headerOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  })
  const headerY = interpolate(frame, [0, 18], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // Table header row animation
  const tableHeaderOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

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
      {/* Section header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 28,
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
          Step 03 &mdash; Find drift
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
          Analyze Execution
        </p>
      </div>

      {/* Table container */}
      <div
        style={{
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 16,
          overflow: 'hidden',
          flex: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Table header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr',
            padding: '14px 24px',
            backgroundColor: BG_ELEVATED,
            borderBottom: `1px solid ${BORDER_SUBTLE}`,
            opacity: tableHeaderOpacity,
          }}
        >
          {COLUMNS.map((col) => (
            <p
              key={col}
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: TEXT_TERTIARY,
                margin: 0,
              }}
            >
              {col}
            </p>
          ))}
        </div>

        {/* Table rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {TRADES.map((trade, i) => {
            const rowStart = 22 + i * 7
            const rowOpacity = interpolate(frame, [rowStart, rowStart + 14], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
            const rowX = interpolate(frame, [rowStart, rowStart + 14], [20, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            })

            const isPositive = trade.pnl >= 0
            const isShort = trade.side === 'Short'

            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr',
                  padding: '14px 24px',
                  borderBottom: i < TRADES.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                  opacity: rowOpacity,
                  transform: `translateX(${rowX}px)`,
                  backgroundColor: i % 2 === 1 ? 'oklch(0.02 0 0)' : 'transparent',
                  alignItems: 'center',
                }}
              >
                {/* Instrument */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: 'hsl(263 85% 65% / 0.08)',
                      border: `1px solid ${BORDER_SUBTLE}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: PRIMARY,
                    }}
                  >
                    {trade.instrument.slice(0, 2)}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: TEXT_STRONG,
                    }}
                  >
                    {trade.instrument}
                  </span>
                </div>

                {/* Side badge */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      padding: '3px 10px',
                      borderRadius: 6,
                      backgroundColor: isShort
                        ? 'oklch(0.64 0.255 22 / 0.15)'
                        : 'hsl(263 85% 65% / 0.15)',
                      color: isShort ? ERROR : PRIMARY,
                    }}
                  >
                    {trade.side}
                  </span>
                </div>

                {/* Entry */}
                <span
                  style={{
                    fontSize: 13,
                    color: TEXT_SECONDARY,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {trade.entry}
                </span>

                {/* Exit */}
                <span
                  style={{
                    fontSize: 13,
                    color: TEXT_SECONDARY,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {trade.exit}
                </span>

                {/* PnL */}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isPositive ? SUCCESS : ERROR,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatPnl(trade.pnl)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TradeTableScene
