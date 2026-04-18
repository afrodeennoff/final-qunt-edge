'use client'
import React from 'react';
import { motion } from 'framer-motion';

export default function Qualification() {
 return (
 <section className="border-t border-border/30 bg-background px-6 py-16 sm:py-20 lg:py-24">
 <div className="mx-6 rounded-xl p-6 bg-[oklch(0.65_0.22_260/0.03)] shadow-card">
 <div className="max-w-6xl mx-auto">
 <div className="grid md:grid-cols-2 gap-2 bg-background/0.01 border border-border/30 p-2 rounded-sm overflow-hidden">
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 className="p-16 bg-[oklch(0.65_0.22_260/0.03)]"
 >
 <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/95 mb-10 mono">Ideal Candidate</h3>
 <ul className="space-y-6">
 {["Discretionary traders seeking institutional structure","Prop firm applicants targeting 100% consistency","Funded traders protecting existing capital edges","Traders tired of self-deception and PnL noise"
 ].map((item, i) => (
 <li key={i} className="flex items-start gap-4 text-foreground/85">
 <span className="text-foreground/95 mt-1">✓</span>
 <span className="text-sm font-medium leading-relaxed tracking-tight">{item}</span>
 </li>
 ))}
 </ul>
 </motion.div>
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 className="p-16 bg-background/0.14"
 >
 <h3 className="mb-10 text-xs font-bold uppercase tracking-[0.3em] text-foreground/85 mono">Hard Refusals</h3>
 <ul className="space-y-6">
 {["Signal seekers or copy-trading accounts","Social traders chasing dopamine and clout","Casual dabblers trading for excitement","Motivation chasers seeking 'mindset' coaches"
 ].map((item, i) => (
 <li key={i} className="flex items-start gap-4 text-foreground/85">
 <span className="mt-1 text-foreground/80">✕</span>
 <span className="text-sm italic font-light leading-relaxed tracking-tight">{item}</span>
 </li>
 ))}
 </ul>
 </motion.div>
 </div>
 </div>
 </div>
 </section>
 );
}
