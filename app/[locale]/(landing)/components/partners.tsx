'use client'
import Image from 'next/image'
import { useI18n } from '@/locales/client'

export default function Partners() {
    const t = useI18n()

    return (
        <section className="py-fluid-xl bg-[#fafafa]">
            <div className="container-fluid">
                <div className="flex flex-col items-center gap-fluid-sm text-center">
                    <div className="gap-fluid-xs">
                        <h2 className="text-fluid-3xl md:text-fluid-5xl font-bold tracking-tighter text-foreground">
                            {t('landing.partners.title')}
                        </h2>
                        <p className="mx-auto max-w-[700px] leading-relaxed text-foreground/65 md:text-fluid-lg">
                            {t('landing.partners.description')}
                        </p>
                    </div>
                    <div className="h-px w-full max-w-[700px] bg-[#f2f3f5]" />
                    <div className="grid grid-fluid gap-fluid-xl items-center justify-items-center w-full mt-fluid-lg">
                        <a className="relative w-full h-20 flex items-center justify-center touch-optimized" href="https://ninjatraderdomesticvendor.sjv.io/e1VQMz" target="_blank" rel="noopener noreferrer">
                            <Image
                                src="/logos/ninjatrader-ob.svg"
                                alt="NinjaTrader"
                                fill
                                sizes="(max-width: 767px) 100vw, 50vw"
                                className="object-contain"
                                priority
                            />
                        </a>
                        <a className="relative w-full h-20 flex items-center justify-center touch-optimized">
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
