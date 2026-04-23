'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { QuntEdgeDemo } from './remotion/QuntEdgeDemo';

const TOTAL_FRAMES = 540;
const FPS = 30;

export default function ProductDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 lg:py-28" ref={containerRef}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Product Demo
        </p>
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          See Qunt Edge in Action
        </h2>

        {isVisible && (
          <div className="overflow-hidden rounded-2xl border border-border/35 bg-background/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <Player
              component={QuntEdgeDemo}
              durationInFrames={TOTAL_FRAMES}
              compositionWidth={1280}
              compositionHeight={720}
              fps={FPS}
              autoPlay
              loop
              style={{ width: '100%', aspectRatio: '16/9' }}
              controls
            />
          </div>
        )}
      </div>
    </section>
  );
}
