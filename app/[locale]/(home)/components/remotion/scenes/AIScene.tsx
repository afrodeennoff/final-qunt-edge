import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
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
} from '../colors';

const AI_MESSAGES = [
  { role: 'user' as const, text: 'What patterns do you see in my recent ES trades?' },
  {
    role: 'ai' as const,
    text: 'I detected a recurring impulse entry pattern between 9:30-10:15 AM. Your win rate drops 23% when entering during the first 15 minutes vs waiting for the 9:45 confirmation candle.',
  },
];

const INSIGHTS = [
  { label: 'Pattern Detected', value: 'Impulse Entry', color: PRIMARY },
  { label: 'Risk Score', value: '7.2/10', color: SUCCESS },
  { label: 'Win Rate Delta', value: '+12%', color: SUCCESS },
];

export const AIScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const userMsgOpacity = interpolate(frame, [20, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const userMsgX = interpolate(frame, [20, 38], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const aiTextProgress = interpolate(frame, [40, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const aiMsgOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const aiMsgX = interpolate(frame, [40, 55], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const visibleChars = Math.floor(aiTextProgress * AI_MESSAGES[1].text.length);
  const displayedAiText = AI_MESSAGES[1].text.slice(0, visibleChars);

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
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: TEXT_TERTIARY,
            margin: 0,
          }}
        >
          AI Trading Coach
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
          Behavioral Insights
        </p>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* User message */}
        <div
          style={{
            opacity: userMsgOpacity,
            transform: `translateX(${userMsgX}px)`,
            alignSelf: 'flex-end',
            maxWidth: '75%',
            backgroundColor: PRIMARY_SUBTLE,
            border: `1px solid oklch(0.6083 0.2172 297.1153 / 0.25)`,
            borderRadius: 16,
            borderBottomRightRadius: 4,
            padding: '14px 20px',
          }}
        >
          <p style={{ fontSize: 14, color: TEXT_STRONG, margin: 0, lineHeight: 1.5 }}>
            {AI_MESSAGES[0].text}
          </p>
        </div>

        {/* AI response */}
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
            padding: '16px 20px',
            boxShadow: `0 0 20px ${PRIMARY_GLOW}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                backgroundColor: PRIMARY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>AI</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_TERTIARY }}>QUNT AI</span>
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
                  animation: 'blink 0.6s infinite',
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
          marginTop: 20,
        }}
      >
        {INSIGHTS.map((insight, i) => {
          const cardStart = 90 + i * 10;
          const cardOpacity = interpolate(frame, [cardStart, cardStart + 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardY = interpolate(frame, [cardStart, cardStart + 16], [10, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });

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
          );
        })}
      </div>
    </div>
  );
};

export default AIScene;
