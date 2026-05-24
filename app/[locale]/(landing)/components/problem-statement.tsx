'use client'
import React from 'react'
import { motion } from 'motion/react'

export default function ProblemStatement() {
 return (
 <section id="problem" className="py-24 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border relative">
 <div className="mx-6 overflow-hidden rounded-[2.2rem] border border-border bg-muted/20 p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_70px_-42px_rgba(0,0,0,0.96)]">
 <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8 }}
 className="sticky top-20 rounded-2xl border border-border bg-muted/20 p-6 lg:top-32"
 >
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/20 mb-6 sm:mb-8">
 <div className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse"></div>
 <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-fg-secondary">System Failure Detected</span>
 </div>
 <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[350] mb-6 sm:mb-8 tracking-[-0.05em] leading-[0.92] text-foreground">
 PnL is a <br/>
 <span className="text-foreground">Lagging Indicator.</span>
 </h2>
 <div className="max-w-lg space-y-6 text-foreground/60 text-base leading-[1.8] font-light sm:space-y-8 sm:text-lg">
 <p>
 Your bank account tells you <em>what</em> happened. It doesn&apos;t tell you <em>why</em>.
 Legacy journals are static graveyards of data that fail to capture the most critical variable in trading: <strong className="text-foreground font-medium">State of Mind.</strong>
 </p>
 <p>
 Profit masks incompetence. You can violate every rule in your system, get lucky, and book a win. This reinforcement loop is the silent killer of careers.
 </p>
 <div className="mt-8 border-t border-border pt-6 sm:mt-10 sm:pt-8">
 <p className="text-foreground font-bold uppercase tracking-widest text-[10px] sm:text-xs mono mb-2">The Paradigm Shift</p>
 <p className="text-foreground font-medium text-lg sm:text-xl tracking-tight">
 Stop auditing the money. Audit the execution.
 </p>
 </div>
 </div>
 </motion.div>

 <div className="grid gap-4 sm:gap-6">
 {[
 {
 title:"Dopamine Addiction",
 desc:"The market is a random reinforcement machine. It rewards bad behavior just often enough to keep you hooked. We break the neural link between 'bad trade' and 'made money'.",
 code:"ERR_REWARD_MISMATCH"
 },
 {
 title:"Tilt Cascades",
 desc:"90% of account blowups happen in 10% of sessions. We identify the micro-fractures in your discipline—heavy breathing, revenge entries—before the dam breaks.",
 code:"ERR_EMOTIONAL_DRIFT"
 },
 {
 title:"Recency Bias",
 desc:"You trade based on your last 3 outcomes, not your 3-year edge. We force you to zoom out via hard data constraints, effectively acting as an algorithmic risk manager.",
 code:"ERR_SAMPLE_SIZE_LOW"
 }
 ].map((item, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 8 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: i * 0.1 }}
 className="group relative rounded-xl border border-border bg-muted/20 p-6 transition-[transform,opacity,background-color,border-color,box-shadow] duration-500 hover:border-border"
 >
 <div className="relative h-full overflow-hidden rounded-xl border border-border bg-background/25 p-4 transition-colors group-hover:border-border sm:p-6">
 <div className="absolute right-3 top-3 text-[8px] font-mono text-foreground/80 transition-colors group-hover:text-fg-primary sm:right-4 sm:top-4 sm:text-[9px]">
 {item.code}
 </div>
 <div className="flex items-start gap-4 sm:gap-6">
 <div className="mt-1 font-mono text-xl font-bold text-foreground/80 transition-colors group-hover:text-foreground sm:text-2xl">0{i+1}</div>
 <div>
 <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-foreground sm:mb-3 sm:text-xl">{item.title}</h3>
 <p className="text-xs leading-relaxed text-foreground/80 sm:text-sm">{item.desc}</p>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 </section>
 );
}
