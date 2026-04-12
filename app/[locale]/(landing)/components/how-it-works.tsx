'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
 const steps = [
 { name:"Raw Ingestion", desc:"Zero manual input. We hook directly into your broker's API to pull raw execution logs." },
 { name:"Intent Locking", desc:"You define the setup before the session. If you take a trade outside these parameters, we flag it." },
 { name:"Clinical Audit", desc:"Our engine separates outcome (luck) from process (skill). Did you follow the plan?" },
 { name:"Loop Detection", desc:"AI identifies the exact moment your psychology shifted (e.g., after 2 consecutive losses)." },
 { name:"Forced Adaptation", desc:"The system locks you out or mandates size reduction until stability is restored." }
 ];

return (
 <section id="how-it-works" className="classes "">
 <div className="mx-6 overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_70px_-42px_rgba(0,0,0,0.96)]">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6"
 >
 <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/34">
 Optimization Pipeline
 </p>
 <motion.h2
 initial={{ opacity: 0, y: 8 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="mt-5 text-3xl font-[350] tracking-[-0.05em] text-foreground/95 sm:text-4xl lg:text-5xl"
 >
 A closed loop built to turn trading behavior into something measurable.
 </motion.h2>
 <motion.p
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ delay: 0.2 }}
 className="mt-5 max-w-lg text-base leading-[1.8] text-foreground/62"
 >
 The product captures intent, audits execution, and forces review into a repeatable rhythm instead of leaving performance buried in screenshots and hindsight.
 </motion.p>
 </motion.div>

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 relative">
 <div className="hidden lg:block absolute top-8 left-[8%] w-[84%] h-px z-0 bg-white/[0.08]" />
 <motion.div
 initial={{ width: 0 }}
 whileInView={{ width: '84%' }}
 viewport={{ once: true }}
 transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
 className="hidden lg:block absolute top-8 left-[8%] h-px z-0 bg-gradient-to-r from-white/[0.08] via-primary/40 to-white/[0.08]"
 />

 {steps.map((step, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: i * 0.15 }}
 className="relative z-10 rounded-[1.6rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4"
 >
 <div className="mb-6 flex items-center justify-between gap-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/[0.10] bg-black/50">
 <span className="font-mono text-xs font-bold text-foreground/85 sm:text-sm">0{i+1}</span>
 </div>
 <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/28">
 Step {i + 1}
 </span>
 </div>

 <div className="px-1">
 <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/72">{step.name}</h3>
 <p className="text-sm leading-[1.8] text-foreground/62">{step.desc}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 </section>
 )
}
