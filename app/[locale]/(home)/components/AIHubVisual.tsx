'use client'

import React from 'react'
import { motion } from 'motion/react'

export default function AIHubVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px] md:max-w-[480px]">
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
          animate={{ rotate: 360 }}
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
          animate={{ rotate: -360 }}
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
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="240" r="92" stroke="rgba(0,255,159,0.4)" strokeWidth="1" />
        </motion.g>

        {/* Orbiting dots - different speeds */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="68" r="3.5" fill="#00ff9f" />
        </motion.g>
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="240" cy="68" r="2.5" fill="#00ff9f" opacity="0.6" transform="translate(0 56)" />
        </motion.g>
      </svg>

      {/* CENTER ORB */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Outer soft glow */}
        <div className="absolute left-1/2 top-1/2 h-[158px] w-[158px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,255,159,0.07)] blur-[50px]" />

        {/* Rotating ring around center */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,255,159,0.35)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main glowing orb */}
        <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[rgba(0,255,159,0.75)] bg-[#0a0c0a] shadow-[0 0 70px rgba(0,255,159,0.3)]">
          <div className="absolute h-[54px] w-[54px] rounded-full border border-[rgba(0,255,159,0.45)]" />
          
          <div className="relative z-10 text-center">
            <div className="text-[14px] font-semibold tracking-[0.13em] text-[#00ff9f]">QUNT</div>
            <div className="text-[10px] font-medium tracking-[0.08em] text-white/70 -mt-px">AI</div>
          </div>
        </div>
      </div>

      {/* 4 Glowing Nodes */}
      <Node label="PULSE"     style={{ left: '50%', top: '10%', transform: 'translateX(-50%)' }} delay={0} />
      <Node label="DEBRIEF"   style={{ left: '50%', bottom: '10%', transform: 'translateX(-50%)' }} delay={0.7} />
      <Node label="SENTINEL"  style={{ left: '10%', top: '50%', transform: 'translateY(-50%)' }} delay={1.4} />
      <Node label="EDGE"      style={{ right: '10%', top: '50%', transform: 'translateY(-50%)' }} delay={0.35} />
    </div>
  )
}

function Node({ label, style, delay }: { label: string; style: React.CSSProperties; delay: number }) {
  return (
    <motion.div
      className="absolute z-20 flex h-[66px] w-[66px] items-center justify-center rounded-full border border-[rgba(0,255,159,0.7)] bg-[#0a0c0a] text-[13px] font-semibold tracking-[0.05em] text-[#e4e8e3] shadow-[0_0_28px_rgba(0,255,159,0.4)]"
      style={style}
      animate={{
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
