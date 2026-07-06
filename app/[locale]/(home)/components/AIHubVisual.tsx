'use client'

import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return mobile
}

export default function AIHubVisual() {
  const reduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const simple = reduceMotion || isMobile

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px]">
      {/* Background subtle rings */}
      <div className="absolute inset-[3%] rounded-full border border-[rgba(0,255,159,0.05)]" />
      <div className="absolute inset-[10%] rounded-full border border-[rgba(0,255,159,0.06)]" />

      {/* Rotating SVG Layers - Radar / Hub Style */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 480 480"
        fill="none"
      >
        {/* Slow outer segmented ring (radar style) */}
        <motion.g
          animate={simple ? undefined : { rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="240" r="172" stroke="rgba(0,255,159,0.15)" strokeWidth="1" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <line
              key={i}
              x1="240" y1="68" x2="240" y2="88"
              stroke="rgba(0,255,159,0.3)"
              strokeWidth="1.5"
              transform={`rotate(${deg} 240 240)`}
            />
          ))}
        </motion.g>

        {/* Medium rotating dashed ring */}
        <motion.g
          animate={simple ? undefined : { rotate: -360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        >
          <circle 
            cx="240" cy="240" r="132" 
            stroke="rgba(0,255,159,0.28)" 
            strokeWidth="1.5" 
            strokeDasharray="8 14" 
          />
        </motion.g>

        {/* Fast inner ring */}
        <motion.g
          animate={simple ? undefined : { rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="240" r="92" stroke="rgba(0,255,159,0.4)" strokeWidth="1" />
        </motion.g>

        {/* Orbiting dots - different speeds */}
        <motion.g
          animate={simple ? undefined : { rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="68" r="3.5" fill="#00ff9f" />
        </motion.g>
        <motion.g
          animate={simple ? undefined : { rotate: -360 }}
          transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="68" r="2.5" fill="#00ff9f" opacity="0.6" transform="translate(0 56)" />
        </motion.g>
      </svg>

      {/* CENTER ORB */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Outer soft glow - reduced blur on mobile for perf */}
        <div className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,255,159,0.07)]',
          simple ? 'h-[120px] w-[120px] blur-[20px]' : 'h-[158px] w-[158px] blur-[50px]'
        )} />

        {/* Rotating ring around center */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,255,159,0.35)]"
          animate={simple ? undefined : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main glowing orb */}
        <div className="relative flex h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] items-center justify-center rounded-full border border-[rgba(0,255,159,0.75)] bg-[#0a0c0a] shadow-[0_0_70px rgba(0,255,159,0.3)]">
          <div className="absolute h-[44px] w-[44px] sm:h-[54px] sm:w-[54px] rounded-full border border-[rgba(0,255,159,0.45)]" />
          
          <div className="relative z-10 text-center">
            <div className="text-[12px] sm:text-[14px] font-semibold tracking-[0.13em] text-[#00ff9f]">QUNT</div>
            <div className="text-[9px] sm:text-[10px] font-medium tracking-[0.08em] text-white/70 -mt-px">AI</div>
          </div>
        </div>
      </div>

      {/* 4 Glowing Nodes - slightly smaller on mobile */}
      <Node label="PULSE"     style={{ left: '50%', top: simple ? '8%' : '10%', transform: 'translateX(-50%)' }} delay={0} simple={simple} />
      <Node label="DEBRIEF"   style={{ left: '50%', bottom: simple ? '8%' : '10%', transform: 'translateX(-50%)' }} delay={0.7} simple={simple} />
      <Node label="SENTINEL"  style={{ left: simple ? '5%' : '10%', top: '50%', transform: 'translateY(-50%)' }} delay={1.4} simple={simple} />
      <Node label="EDGE"      style={{ right: simple ? '5%' : '10%', top: '50%', transform: 'translateY(-50%)' }} delay={0.35} simple={simple} />
    </div>
  )
}

function Node({ label, style, delay, simple }: { label: string; style: React.CSSProperties; delay: number; simple: boolean }) {
  return (
    <motion.div
      className={cn(
        'absolute z-20 flex items-center justify-center rounded-full border border-[rgba(0,255,159,0.7)] bg-[#0a0c0a] font-semibold tracking-[0.05em] text-[#e4e8e3] shadow-[0_0_28px_rgba(0,255,159,0.4)]',
        simple
          ? 'h-[52px] w-[52px] text-[11px]'
          : 'h-[60px] w-[60px] sm:h-[66px] sm:w-[66px] text-[12px] sm:text-[13px]'
      )}
      style={style}
      animate={simple ? undefined : {
        boxShadow: [
          '0 0 20px rgba(0,255,159,0.3)',
          '0 0 42px rgba(0,255,159,0.55)',
          '0 0 20px rgba(0,255,159,0.3)',
        ],
      }}
      transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {label}
    </motion.div>
  )
}
