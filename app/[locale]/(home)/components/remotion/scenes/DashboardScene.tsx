import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import {
  PRIMARY,
  SUCCESS,
  SUCCESS_SUBTLE,
  BG_BASE,
  BG_CARD,
  BG_ELEVATED,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors'

const METRICS = [
  { label: 'Broker Sync', value: 'Live', hasLiveDot: true },
  { label: 'Imported Trades', value: '142' },
  { label: 'Accounts', value: '4' },
  { label: 'Rejected', value: '0' },
  { label: 'Journal Notes', value: '18' },
  { label: 'Ready', value: '100%' },
]

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame()

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  })
  const titleY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
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
      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 32,
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
          Step 01 &mdash; Connect data
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
          Connect Your Broker
        </p>
      </div>

      {/* 3x2 Metric tiles grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 14,
          flex: 1,
        }}
      >
        {METRICS.map((metric, i) => {
          const stagger = 15 + i * 6
          const tileOpacity = interpolate(frame, [stagger, stagger + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const tileY = interpolate(frame, [stagger, stagger + 18], [14, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })
          const tileScale = interpolate(frame, [stagger, stagger + 18], [0.97, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })

          const isLive = metric.hasLiveDot
          const valueColor = isLive ? SUCCESS : TEXT_STRONG

          return (
            <div
              key={metric.label}
              style={{
                opacity: tileOpacity,
                transform: `translateY(${tileY}px) scale(${tileScale})`,
                backgroundColor: BG_CARD,
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)',
              }}
            >
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase' as const,
                  color: TEXT_TERTIARY,
                  margin: 0,
                }}
              >
                {metric.label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: valueColor,
                  margin: '8px 0 0 0',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {isLive && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: SUCCESS,
                      boxShadow: `0 0 6px ${SUCCESS}`,
                    }}
                  />
                )}
                {metric.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Bottom status bar */}
      <div
        style={{
          marginTop: 20,
          opacity: interpolate(frame, [48, 68], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            backgroundColor: BG_ELEVATED,
            border: `1px solid ${BORDER_SUBTLE}`,
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: SUCCESS,
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: TEXT_SECONDARY,
              margin: 0,
            }}
          >
            Tradovate, Rithmic, IBKR, and CSV imports normalized into one workspace
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardScene
