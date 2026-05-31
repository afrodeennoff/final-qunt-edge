'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function AIHubVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px] md:max-w-[420px] lg:max-w-[460px]">
      {/* Outer faint radar ring */}
      <div className="absolute inset-[6%] rounded-full border border-[rgba(0,255,159,0.08)]" />

      {/* Main SVG connections + X marks + energy flows */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 440 440"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(0,255,159,0.15)" />
            <stop offset="50%" stopColor="rgba(0,255,159,0.35)" />
            <stop offset="100%" stopColor="rgba(0,255,159,0.15)" />
          </linearGradient>
        </defs>

        {/* Outer faint ring */}
        <circle cx="220" cy="220" r="138" stroke="rgba(0,255,159,0.12)" strokeWidth="1" />
        {/* Inner ring */}
        <circle cx="220" cy="220" r="102" stroke="rgba(0,255,159,0.18)" strokeWidth="1" />

        {/* X marks */}
        <line x1="120" y1="120" x2="148" y2="148" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
        <line x1="292" y1="120" x2="264" y2="148" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
        <line x1="120" y1="320" x2="148" y2="292" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />
        <line x1="292" y1="320" x2="264" y2="292" stroke="rgba(0,255,159,0.25)" strokeWidth="1" />

        {/* Cardinal lines */}
        <line x1="220" y1="82" x2="220" y2="135" stroke="url(#lineGlow)" strokeWidth="1.5" />
        <line x1="220" y1="358" x2="220" y2="305" stroke="url(#lineGlow)" strokeWidth="1.5" />
        <line x1="82" y1="220" x2="135" y2="220" stroke="url(#lineGlow)" strokeWidth="1.5" />
        <line x1="358" y1="220" x2="305" y2="220" stroke="url(#lineGlow)" strokeWidth="1.5" />

        {/* Moving energy dots */}
        <g>
          <circle r="2.5" fill="#00ff9f" opacity="0.75">
            <animate attributeName="cy" values="82;135;82" dur="2.7s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <circle r="2.5" fill="#00ff9f" opacity="0.75">
            <animate attributeName="cy" values="358;305;358" dur="3.2s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <circle r="2.5" fill="#00ff9f" opacity="0.75">
            <animate attributeName="cx" values="82;135;82" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <circle r="2.5" fill="#00ff9f" opacity="0.75">
            <animate attributeName="cx" values="358;305;358" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      {/* CENTER ORB - Premium layered version */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Outer breathing glow */}
        <div className="absolute left-1/2 top-1/2 h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,255,159,0.065)] blur-[26px]" />

        {/* Slow rotating thin ring */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[106px] w-[106px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,255,159,0.22)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main glowing orb with strong breathing animation */}
        <motion.div
          className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[rgba(0,255,159,0.6)] bg-[#0a0c0a]"
          animate={{
            boxShadow: [
              '0 0 16px rgba(0,255,159,0.22), 0 0 36px rgba(0,255,159,0.11)',
              '0 0 30px rgba(0,255,159,0.36), 0 0 58px rgba(0,255,159,0.17)',
              '0 0 16px rgba(0,255,159,0.22), 0 0 36px rgba(0,255,159,0.11)',
            ],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Inner ring */}
          <div className="absolute h-[46px] w-[46px] rounded-full border border-[rgba(0,255,159,0.32)]" />

          <div className="relative z-10 text-center">
            <div className="text-[12px] font-semibold tracking-[0.11em] text-[#00ff9f]">QUNT</div>
            <div className="text-[9.5px] font-medium tracking-[0.07em] text-[rgba(255,255,255,0.65)] -mt-px">AI</div>
          </div>
        </motion.div>
      </div>

      {/* NODES - Larger with staggered breathing glow */}
      <Node label="PULSE" style={{ left: '50%', top: '18px', transform: 'translateX(-50%)' }} delay={0} />
      <Node label="DEBRIEF" style={{ left: '50%', bottom: '18px', transform: 'translateX(-50%)' }} delay={0.9} />
      <Node label="SENTINEL" style={{ left: '18px', top: '50%', transform: 'translateY(-50%)' }} delay={1.6} />
      <Node label="EDGE" style={{ right: '18px', top: '50%', transform: 'translateY(-50%)' }} delay={0.4} />
    </div>
  )
}

function Node({ label, style, delay }: { label: string; style: React.CSSProperties; delay: number }) {
  return (
    <motion.div
      className="absolute flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,255,159,0.65)] bg-[#111411] text-[12.5px] font-semibold tracking-[0.065em] text-[#e4e8e3] shadow-[0_0_12px_rgba(0,255,159,0.18)]"
      style={style}
      animate={{
        boxShadow: [
          '0 0 12px rgba(0,255,159,0.18)',
          '0 0 24px rgba(0,255,159,0.30)',
          '0 0 12px rgba(0,255,159,0.18)',
        ],
      }}
      transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {label}
    </motion.div>
  )
}
