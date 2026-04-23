import React from 'react';
import { Sequence } from 'remotion';
import { DashboardScene } from './scenes/DashboardScene';
import { ChartScene } from './scenes/ChartScene';
import { TradeTableScene } from './scenes/TradeTableScene';
import { AIScene } from './scenes/AIScene';

// 540 frames at 30fps = 18 seconds total
const FPS = 30;
const DASHBOARD_DURATION = 5 * FPS; // 0-5s
const CHART_DURATION = 5 * FPS; // 5-10s
const TABLE_DURATION = 4 * FPS; // 10-14s
const AI_DURATION = 4 * FPS; // 14-18s

export const QuntEdgeDemo: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default QuntEdgeDemo;
