import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import {
  PRIMARY,
  PRIMARY_SUBTLE,
  SUCCESS,
  SUCCESS_SUBTLE,
  ERROR,
  ERROR_SUBTLE,
  BG_BASE,
  BG_CARD,
  TEXT_STRONG,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
} from '../colors';

// Equity curve data — simulated cumulative PnL points
const EQUITY_POINTS = [
  0, 120, 280, 190, 420, 380, 550, 610, 520, 700, 830, 780, 920, 1050, 980,
  1120, 1200, 1350, 1280, 1420, 1560, 1500, 1680, 1750, 1620, 1800, 1920,
  2050, 1980, 2150,
];

// Bar chart data — daily PnL
const DAILY_PNL = [
  320, -150, 480, 210, -90, 350, 120, -200, 410, 180, -60, 290, 150,
];

function generateSmoothPath(
  points: number[],
  width: number,
  height: number,
  padding: number
): string {
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;

  const coords = points.map((p, i) => ({
    x: padding + (i / (points.length - 1)) * (width - padding * 2),
    y: padding + (1 - (p - minVal) / range) * (height - padding * 2),
  }));

  // Build smooth path with cubic bezier
  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

export const ChartScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Equity curve draw-in animation
  const chartWidth = 1100;
  const chartHeight = 340;
  const chartPadding = 20;

  const equityPath = generateSmoothPath(
    EQUITY_POINTS,
    chartWidth,
    chartHeight,
    chartPadding
  );

  // Calculate approximate path length for stroke animation
  const pathLength = chartWidth * 1.8; // approximate
  const drawProgress = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const strokeDashoffset = pathLength * (1 - drawProgress);

  // Area fill opacity
  const areaOpacity = interpolate(frame, [50, 90], [0, 0.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Grid lines fade
  const gridOpacity = interpolate(frame, [10, 30], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Bar chart stagger
  const barStartFrame = 40;

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
      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
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
            Equity Curve
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
            Cumulative Performance
          </p>
        </div>
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
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: SUCCESS,
            }}
          />
          <span style={{ fontSize: 14, color: SUCCESS, fontWeight: 600 }}>
            +$2,150 today
          </span>
        </div>
      </div>

      {/* Main equity curve SVG */}
      <div
        style={{
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 16,
          padding: 24,
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

          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SUCCESS} stopOpacity={0.4} />
              <stop offset="100%" stopColor={SUCCESS} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Filled area */}
          <path
            d={`${equityPath} L ${chartWidth - chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${chartHeight - chartPadding} Z`}
            fill="url(#areaGradient)"
            opacity={areaOpacity}
          />

          {/* Equity line */}
          <path
            d={equityPath}
            fill="none"
            stroke={SUCCESS}
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
                (1 -
                  (EQUITY_POINTS[EQUITY_POINTS.length - 1]! /
                    Math.max(...EQUITY_POINTS))) *
                  (chartHeight - chartPadding * 2)
              }
              r={5}
              fill={SUCCESS}
              opacity={interpolate(frame, [85, 95], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          )}
        </svg>
      </div>

      {/* Daily PnL bar chart */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 6,
          alignItems: 'flex-end',
          height: 60,
          paddingLeft: 4,
        }}
      >
        {DAILY_PNL.map((pnl, i) => {
          const barFrame = barStartFrame + i * 3;
          const barHeight = interpolate(
            frame,
            [barFrame, barFrame + 12],
            [0, Math.abs(pnl) / 500],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            }
          );
          const barOpacity = interpolate(frame, [barFrame, barFrame + 10], [0, 0.8], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

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
                  maxWidth: 32,
                  height: `${barHeight * 100}%`,
                  minHeight: pnl !== 0 ? 2 : 0,
                  backgroundColor: pnl >= 0 ? SUCCESS : ERROR,
                  opacity: barOpacity,
                  borderRadius: 4,
                  transition: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartScene;
