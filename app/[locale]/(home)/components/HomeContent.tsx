import dynamic from 'next/dynamic'
import DeferredHomeSections from './DeferredHomeSections'

const PropFirmsExplorer = dynamic(() => import('./PropFirmsExplorer'), {
  loading: () => <div className="min-h-[60vh]" />,
})

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative overflow-x-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_36%,hsl(var(--background))_100%)] selection:bg-[hsl(var(--primary)/0.3)] selection:text-primary-foreground [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)] [--home-mono:var(--font-geist)]">
      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <PropFirmsExplorer locale={locale} />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
