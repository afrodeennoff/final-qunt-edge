'use client'
import Image from 'next/image'
import { useI18n } from '@/locales/client'

export default function Partners() {
 const t = useI18n()

 return (
 <section className="py-16 sm:py-20 lg:py-24 px-6">
 <div className="mx-auto max-w-6xl space-y-6">
 <div className="flex flex-col items-center gap-6 text-center">
 <div className="gap-4">
 <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground/95">
 {t('landing.partners.title')}
 </h2>
 <p className="mx-auto max-w-[700px] leading-relaxed text-foreground/65 text-lg">
 {t('landing.partners.description')}
 </p>
 </div>
 <div className="h-px w-full max-w-[700px] bg-border" />
 <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
 <a className="relative w-full h-20 flex items-center justify-center touch-optimized grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" href="https://ninjatraderdomesticvendor.sjv.io/e1VQMz" target="_blank" rel="noopener noreferrer">
 <Image
 src="/logos/ninjatrader-ob.svg"
 alt="NinjaTrader"
 fill
 sizes="(max-width: 767px) 100vw, 50vw"
 className="object-contain"
 priority
 />
 </a>
 <a className="relative w-full h-20 flex items-center justify-center touch-optimized grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100">
 <Image
 src="/logos/rithmic-logo-black.png"
 alt="Rithmic"
 fill
 sizes="(max-width: 767px) 100vw, 50vw"
 className="object-contain"
 priority
 />
 </a>
 </div>
 </div>
 </div>
 </section>
 )
}
