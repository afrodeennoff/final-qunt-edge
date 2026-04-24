import React from 'react'
import { Sequence } from 'remotion'
import { DashboardScene } from './scenes/DashboardScene'
import { ChartScene } from './scenes/ChartScene'
import { TradeTableScene } from './scenes/TradeTableScene'
import { AIScene } from './scenes/AIScene'
import { BG_BASE, BG_ELEVATED, BORDER_SUBTLE, PRIMARY, TEXT_SECONDARY, TEXT_STRONG } from './colors'

// 540 frames at 30fps = 18 seconds total
const FPS = 30
const DASHBOARD_DURATION = 5 * FPS // 0-5s
const CHART_DURATION = 5 * FPS // 5-10s
const TABLE_DURATION = 4 * FPS // 10-14s
const AI_DURATION = 4 * FPS // 14-18s

export const QuntEdgeDemo: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: BG_BASE,
        padding: 42,
        fontFamily: 'var(--font-ui-native, system-ui, -apple-system, sans-serif)',
      }}
    >
      <div
        style={{
          height: '100%',
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 26,
          overflow: 'hidden',
          backgroundColor: BG_ELEVATED,
          boxShadow: 'inset 0 1px 0 oklch(0.65 0.22 260 / 0.08), 0 28px 60px -36px rgba(0,0,0,0.9)',
        }}
      >
        <div
          style={{
            height: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER_SUBTLE}`,
            padding: '0 18px',
            backgroundColor: 'oklch(0.052 0.01 260 / 0.92)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['oklch(0.68 0.23 28)', 'oklch(0.85 0.17 87)', 'oklch(0.76 0.2 145)'].map((color) => (
              <span
                key={color}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
          <div
            style={{
              border: `1px solid ${BORDER_SUBTLE}`,
              borderRadius: 999,
              padding: '6px 14px',
              color: TEXT_SECONDARY,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            Product walkthrough
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT_STRONG }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PRIMARY }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>Live audit</span>
          </div>
        </div>
        <div style={{ position: 'relative', height: 'calc(100% - 54px)' }}>
          <Sequence durationInFrames={DASHBOARD_DURATION}>
            <DashboardScene />
          </Sequence>
          <Sequence from={DASHBOARD_DURATION} durationInFrames={CHART_DURATION}>
            <ChartScene />
          </Sequence>
          <Sequence from={DASHBOARD_DURATION + CHART_DURATION} durationInFrames={TABLE_DURATION}>
            <TradeTableScene />
          </Sequence>
          <Sequence
            from={DASHBOARD_DURATION + CHART_DURATION + TABLE_DURATION}
            durationInFrames={AI_DURATION}
          >
            <AIScene />
          </Sequence>
        </div>
      </div>
    </div>
  )
}

export default QuntEdgeDemo
