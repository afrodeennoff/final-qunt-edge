'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles, Workflow, Gauge, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { UserAuthForm } from "../components/user-auth-form"
import { useCurrentLocale, useI18n } from "@/locales/client"

export default function AuthenticationPageClient() {
 const t = useI18n()
 const locale = useCurrentLocale()

 const valuePoints = [
 {
 icon: ShieldCheck,
 title:"Secure by default",
 description:"Protected sessions, encrypted auth flow, and trusted providers.",
 },
 {
 icon: Workflow,
 title:"Fast account access",
 description:"Magic link and password flow with clean recovery paths.",
 },
 {
 icon: Gauge,
 title:"Built for daily use",
 description:"Low-friction sign-in designed for active trading routines.",
 },
 ]

 return (
 <main className="qe-v2-app-shell relative min-h-screen overflow-hidden bg-background text-foreground/95">
 <div className="pointer-events-none absolute inset-0">
 <div className="absolute -left-28 top-[-8rem] h-[40rem] w-[40rem] rounded-full bg-[oklch(0.65_0.22_260/0.18)] blur-[140px]" />
 <div className="absolute -right-36 bottom-[-10rem] h-[42rem] w-[42rem] rounded-full bg-[oklch(0.82_0.185_155/0.08)] blur-[140px]" />
 <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:36px_36px]" />
 </div>

 <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
 <div className="w-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,9,16,0.96),rgba(4,5,10,0.94))] shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_40px_100px_-48px_rgba(4,10,24,0.98),0_0_120px_-48px_oklch(0.65_0.22_260/0.18)]">
 <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(500px,620px)]">
 <section className="p-6 sm:p-8 lg:border-r lg:border-[hsl(var(--v2-border)/0.72)] lg:p-10">
 <div className="flex items-center justify-between">
 <Link
 href={`/${locale}`}
 className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/72 transition hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-foreground/95"
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 Back to website
 </Link>
 <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/36">
 Secure Access
 </span>
 </div>

 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
 className="my-10 max-w-xl lg:my-14"
 >
 <div className="mb-7 inline-flex items-center gap-3 rounded-[1.4rem] border border-white/[0.08] bg-white/[0.04] px-4 py-3 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06)]">
 <Logo className="h-5 w-5 text-foreground/95" />
 <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/72">Qunt Edge</span>
 </div>

 <h1 className="text-balance text-4xl font-[350] leading-[0.98] tracking-[-0.045em] text-foreground/95 sm:text-5xl lg:text-6xl">
 Welcome back to
 <br className="hidden sm:block" /> your trading command center.
 </h1>
 <p className="mt-5 max-w-lg text-sm leading-[1.75] tracking-[-0.01em] text-foreground/56 sm:text-[15px]">
 {t('authentication.description')}
 </p>

 <div className="mt-10 grid gap-3">
 {valuePoints.map((point) => (
 <div
 key={point.title}
 className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] px-4 py-4 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05),0_16px_40px_-30px_rgba(0,0,0,0.9)]"
 >
 <div className="flex items-start gap-3">
 <div className="mt-0.5 rounded-[1rem] border border-white/[0.08] bg-white/[0.04] p-2.5 shadow-[0_0_18px_oklch(0.65_0.22_260/0.14)]">
 <point.icon className="h-4 w-4 text-foreground/95" />
 </div>
 <div>
 <p className="text-sm font-semibold tracking-[-0.01em] text-foreground/95">{point.title}</p>
 <p className="mt-1.5 text-xs leading-[1.6] text-foreground/52">{point.description}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </motion.div>

 <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/34">
 <Sparkles className="h-3.5 w-3.5" />
 <span>{t('authentication.title')}</span>
 </div>
 </section>

 <section className="flex items-center justify-center border-t border-white/[0.06] p-6 sm:p-8 lg:border-t-0 lg:p-10">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
 className="w-full max-w-[560px] mx-auto"
 >
 <div className="mb-6 rounded-[1.6rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05),0_18px_40px_-28px_rgba(0,0,0,0.9)]">
 <div className="mb-3 flex items-center justify-between gap-3">
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Account Access</p>
 <div className="rounded-[1rem] border border-white/[0.08] bg-white/[0.04] p-2.5">
 <LockKeyhole className="h-4 w-4 text-foreground/95" />
 </div>
 </div>
 <h2 className="text-xl font-semibold tracking-[-0.025em] text-foreground/95">Sign in to continue</h2>
 <p className="mt-1 text-xs text-foreground/46">{t('authentication.testimonialAuthor')}</p>
 </div>

 <div className="mb-6 grid gap-2 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4">
 <div className="flex items-center gap-2 text-xs text-foreground/54">
 <CheckCircle2 className="h-3.5 w-3.5 text-foreground/95" />
 <span>Magic link and password sign-in</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-foreground/54">
 <CheckCircle2 className="h-3.5 w-3.5 text-foreground/95" />
 <span>Discord and Google authentication</span>
 </div>
 <div>
 <p className="pl-[1.35rem] text-xs text-foreground/46">Protected session handling for every login method.</p>
 </div>
 </div>

 <UserAuthForm />

 <p className="mt-7 text-center text-[11px] leading-relaxed text-foreground/42">
 {t('authentication.termsAndPrivacy.prefix')} {""}
 <Link href={`/${locale}/terms`} className="text-foreground/95 underline decoration-border/80 underline-offset-4 hover:text-foreground/95">
 {t('authentication.termsAndPrivacy.terms')}
 </Link>{""}
 {t('authentication.termsAndPrivacy.and')}{""}
 <Link href={`/${locale}/privacy`} className="text-foreground/95 underline decoration-border/80 underline-offset-4 hover:text-foreground/95">
 {t('authentication.termsAndPrivacy.privacy')}
 </Link>
 </p>
 </motion.div>
 </section>
 </div>
 </div>
 </div>
 </main>
 )
}
