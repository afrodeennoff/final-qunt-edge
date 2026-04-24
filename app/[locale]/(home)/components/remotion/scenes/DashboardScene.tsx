import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import {
  PRIMARY,
  SUCCESS,
  BG_BASE,
  BG_CARD,
  BG_ELEVATED,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors'

const METRICS = [
  { label: 'Broker Sync', value: 'Live', tone: SUCCESS },
  { label: 'Imported Trades', value: '142', tone: PRIMARY },
  { label: 'Accounts Linked', value: '4', tone: PRIMARY },
  { label: 'Rejected Rows', value: '0', tone: SUCCESS },
  { label: 'Journal Notes', value: '18', tone: PRIMARY },
  { label: 'Ready For Review', value: '100%', tone: SUCCESS },
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
          marginBottom: 36,
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
          Step 01 — Connect data
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
          Broker fills become one review timeline
        </p>
      </div>

      {/* Metric tiles grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          flex: 1,
        }}
      >
        {METRICS.map((metric, i) => {
          const stagger = 15 + i * 6
          const tileOpacity = interpolate(frame, [stagger, stagger + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const tileY = interpolate(frame, [stagger, stagger + 18], [16, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })
          const tileScale = interpolate(frame, [stagger, stagger + 18], [0.96, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })

          return (
            <div
              key={metric.label}
              style={{
                opacity: tileOpacity,
                transform: `translateY(${tileY}px) scale(${tileScale})`,
                backgroundColor: BG_CARD,
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: 16,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  color: TEXT_TERTIARY,
                  margin: 0,
                }}
              >
                {metric.label}
              </p>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: metric.tone,
                  margin: '10px 0 0 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {metric.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Bottom bar — mini equity curve hint */}
      <div
        style={{
          marginTop: 24,
          opacity: interpolate(frame, [50, 70], [0, 1], {
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
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: SUCCESS,
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: TEXT_SECONDARY,
              margin: 0,
            }}
          >
            Tradovate, Rithmic, IBKR, and CSV imports normalize into one workspace
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardScene
