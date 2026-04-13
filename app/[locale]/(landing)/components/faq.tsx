"use client";

import { useI18n } from "@/locales/client";

export default function FAQ() {
 const t = useI18n();

 return (
 <section className="py-16">
 <div className="mx-6 overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_70px_-42px_rgba(0,0,0,0.96)]">
 <div className="container mx-auto px-4">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
 <div className="rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
 <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/34">
 FAQ
 </p>
 <h2 className="mt-5 text-3xl font-[350] tracking-[-0.05em] text-foreground/95 sm:text-4xl">
 {t("faq.heading")}
 </h2>
 <p className="mt-4 max-w-lg text-sm leading-[1.8] text-foreground/60">
 The essentials traders ask before they connect accounts, switch workflows, or evaluate the platform for team use.
 </p>
 </div>
 <div className="rounded-[1.9rem] border border-white/[0.08] bg-black/20 p-5">
 <div className="space-y-4">
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question1")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer1")}
 </p>
 </details>
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question2")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer2")}
 </p>
 </details>
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question3")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer3")}
 </p>
 </details>
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question4")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer4")}
 </p>
 </details>
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question5")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer5")}
 </p>
 </details>
 <details className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] p-4">
 <summary className="cursor-pointer font-semibold text-foreground/95">
 {t("faq.question6")}
 </summary>
 <p className="mt-3 text-sm leading-[1.75] text-foreground/68">
 {t("faq.answer6")}
 </p>
 </details>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}
