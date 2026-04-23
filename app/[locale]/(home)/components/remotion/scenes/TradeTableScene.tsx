import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import {
  PRIMARY,
  PRIMARY_SUBTLE,
  SUCCESS,
  ERROR,
  BG_BASE,
  BG_CARD,
  BG_ELEVATED,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors';

interface TradeRow {
  instrument: string;
  side: 'Long' | 'Short';
  pnl: number;
  duration: string;
}

const TRADES: TradeRow[] = [
  { instrument: 'ES', side: 'Long', pnl: 450, duration: '34m' },
  { instrument: 'NQ', side: 'Short', pnl: -180, duration: '12m' },
  { instrument: 'CL', side: 'Long', pnl: 320, duration: '1h 5m' },
  { instrument: 'GC', side: 'Short', pnl: 210, duration: '22m' },
  { instrument: 'YM', side: 'Long', pnl: -95, duration: '8m' },
  { instrument: 'ES', side: 'Short', pnl: 580, duration: '45m' },
  { instrument: 'NQ', side: 'Long', pnl: 150, duration: '18m' },
];

function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(value).toLocaleString()}`;
}

const COLUMNS = ['Instrument', 'Side', 'PnL', 'Duration'];

export const TradeTableScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Header animation
  const headerOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const headerY = interpolate(frame, [0, 18], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Table header row animation
  const tableHeaderOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: BG_BASE,
        display: 'flex',
        flexDirection: 'column',
        padding: 48,
        fontFamily:
          'var(--font-ui-native, system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* Section header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: TEXT_TERTIARY,
            margin: 0,
          }}
        >
          Trade Journal
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
          Recent Trade History
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
            gridTemplateColumns: '1fr 1fr 1.2fr 1fr',
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
                fontSize: 10,
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
            const rowStart = 22 + i * 7;
            const rowOpacity = interpolate(frame, [rowStart, rowStart + 14], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const rowX = interpolate(frame, [rowStart, rowStart + 14], [20, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            });

            const isPositive = trade.pnl >= 0;

            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.2fr 1fr',
                  padding: '16px 24px',
                  borderBottom:
                    i < TRADES.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                  opacity: rowOpacity,
                  transform: `translateX(${rowX}px)`,
                  backgroundColor:
                    i % 2 === 0 ? 'transparent' : 'oklch(0.02 0 0)',
                }}
              >
                {/* Instrument */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: PRIMARY_SUBTLE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
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

                {/* Side */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      padding: '4px 10px',
                      borderRadius: 6,
                      backgroundColor: isPositive ? 'oklch(0.82 0.185 155 / 0.10)' : 'oklch(0.64 0.255 22 / 0.10)',
                      color: isPositive ? SUCCESS : ERROR,
                    }}
                  >
                    {trade.side}
                  </span>
                </div>

                {/* PnL */}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isPositive ? SUCCESS : ERROR,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {formatPnl(trade.pnl)}
                </span>

                {/* Duration */}
                <span
                  style={{
                    fontSize: 13,
                    color: TEXT_SECONDARY,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {trade.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TradeTableScene;
