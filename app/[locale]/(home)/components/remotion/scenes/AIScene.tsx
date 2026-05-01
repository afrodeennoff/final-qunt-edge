import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import {
  PRIMARY,
  PRIMARY_SUBTLE,
  PRIMARY_GLOW,
  SUCCESS,
  BG_BASE,
  BG_CARD,
  BG_ELEVATED,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors'

const AI_MESSAGES = [
  { role: 'user' as const, text: 'What should I change before the next session?' },
  {
    role: 'ai' as const,
    text: 'Reduce size after two losses, wait for the 9:45 confirmation candle, and review only A-grade setups until plan adherence is back above 85%.',
  },
]

const INSIGHTS = [
  { label: 'Pattern Detected', value: 'Impulse Entry', color: PRIMARY },
  { label: 'Risk Score', value: '7.2/10', color: SUCCESS },
  { label: 'Win Rate Delta', value: '+12%', color: SUCCESS },
]

export const AIScene: React.FC = () => {
  const frame = useCurrentFrame()

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // User message animation
  const userMsgOpacity = interpolate(frame, [20, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const userMsgX = interpolate(frame, [20, 38], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // AI message animation
  const aiTextProgress = interpolate(frame, [42, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
  const aiMsgOpacity = interpolate(frame, [42, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const aiMsgX = interpolate(frame, [42, 58], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  const visibleChars = Math.floor(aiTextProgress * AI_MESSAGES[1].text.length)
  const displayedAiText = AI_MESSAGES[1].text.slice(0, visibleChars)

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
          Step 04 &mdash; Act on drift
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
          AI-Powered Insights
        </p>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* User message — right-aligned, PRIMARY bg */}
        <div
          style={{
            opacity: userMsgOpacity,
            transform: `translateX(${userMsgX}px)`,
            alignSelf: 'flex-end',
            maxWidth: '70%',
            backgroundColor: PRIMARY,
            borderRadius: 16,
            borderBottomRightRadius: 4,
            padding: '12px 18px',
          }}
        >
          <p style={{ fontSize: 13, color: 'white', margin: 0, lineHeight: 1.5 }}>
            {AI_MESSAGES[0].text}
          </p>
        </div>

        {/* AI response — left-aligned, card bg */}
        <div
          style={{
            opacity: aiMsgOpacity,
            transform: `translateX(${aiMsgX}px)`,
            alignSelf: 'flex-start',
            maxWidth: '85%',
            backgroundColor: BG_CARD,
            border: `1px solid ${BORDER_SUBTLE}`,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: '14px 18px',
            boxShadow: `0 0 20px ${PRIMARY_GLOW}`,
          }}
        >
          {/* AI badge with sparkles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: PRIMARY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Sparkles icon (simplified SVG) */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" />
              </svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: TEXT_TERTIARY }}>
              QUNT AI
            </span>
          </div>
          <p style={{ fontSize: 13, color: TEXT_STRONG, margin: 0, lineHeight: 1.6 }}>
            {displayedAiText || ''}
            {aiTextProgress < 1 && aiTextProgress > 0 && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 14,
                  backgroundColor: PRIMARY,
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }}
              />
            )}
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 16,
        }}
      >
        {INSIGHTS.map((insight, i) => {
          const cardStart = 95 + i * 10
          const cardOpacity = interpolate(frame, [cardStart, cardStart + 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const cardY = interpolate(frame, [cardStart, cardStart + 16], [10, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })

          return (
            <div
              key={insight.label}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                backgroundColor: BG_ELEVATED,
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: TEXT_TERTIARY,
                  margin: 0,
                }}
              >
                {insight.label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: insight.color,
                  margin: '6px 0 0 0',
                }}
              >
                {insight.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AIScene
