'use client'
import React, { useRef } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import Link from "next/link";
import { useCurrentLocale } from '@/locales/client';

interface HeroProps {
  onStart?: () => void;
}

export default function Hero({  }: HeroProps) {
  const ref = useRef(null);
  const locale = useCurrentLocale();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 24, opacity: 0, filter: "blur(12px)" },
    show: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      }
    },
  };

  return (
    <section ref={ref} className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-white px-4 py-20 text-center md:py-24 lg:py-28 sm:px-6 lg:px-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ scale }}
        className="max-w-3xl mx-auto relative z-10 w-full"
      >
        <motion.div variants={item} className="mb-6 sm:mb-8">
           <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 animate-fade-in hover:border-gray-300 transition-colors duration-300">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-[#45515e]">Institutional Intelligence Layer</span>
           </div>
        </motion.div>

        <motion.h1
          variants={item}
          className="mb-6 text-[40px] font-medium leading-[1.10] tracking-[-0.038em] text-[#181e25] [font-family:var(--font-outfit),sans-serif] sm:text-[56px] md:text-[72px] lg:text-[80px]"
        >
          Qunt <span className="text-[#181e25]">Edge.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-base max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed font-normal px-2 text-[#45515e] [font-family:var(--font-dm-sans),sans-serif]"
        >
          Stop auditing the money. Audit the execution. <br className="hidden sm:block" />
          The clinical intelligence layer for professional discretionary traders.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
        >
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center rounded-lg bg-[#181e25] px-8 text-center text-sm font-medium text-white transition-all hover:bg-[#2a3240] sm:w-auto overflow-hidden"
          >
            <span className="relative z-10">Start Free Audit</span>
          </Link>

          <Link
            href={`/${locale}/updates`}
            className="touch-target group relative inline-flex h-12 w-full min-w-[220px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-8 text-center text-sm font-medium text-[#45515e] transition-all hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
          >
             View Product Updates
             <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-16 border-t border-gray-200 px-4 pt-8 opacity-60 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0 sm:mt-20 sm:pt-10"
        >
           <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-20">
              <span className="text-sm font-black tracking-tighter text-gray-400 transition-all duration-300 hover:text-[#181e25] hover:scale-105 sm:text-base md:text-xl cursor-default">TRADOVATE</span>
              <span className="text-sm font-black tracking-tighter text-gray-400 transition-all duration-300 hover:text-[#181e25] hover:scale-105 sm:text-base md:text-xl cursor-default">RITHMIC</span>
              <span className="text-sm font-black tracking-tighter text-gray-400 transition-all duration-300 hover:text-[#181e25] hover:scale-105 sm:text-base md:text-xl cursor-default">IBKR</span>
              <span className="text-sm font-black tracking-tighter text-gray-400 transition-all duration-300 hover:text-[#181e25] hover:scale-105 sm:text-base md:text-xl cursor-default">CQG</span>
           </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
