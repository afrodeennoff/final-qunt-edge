import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'
import ProofStrip from './ProofStrip'

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative overflow-x-hidden bg-background selection:bg-[hsl(var(--primary)/0.3)] selection:text-primary-foreground [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)] [--home-mono:var(--font-geist)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_480px_at_50%_-10%,hsl(var(--foreground)/0.06),transparent_68%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.3)_36%,hsl(var(--background))_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.15] sm:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_340px_at_10%_20%,hsl(var(--foreground)/0.04),transparent_70%),radial-gradient(700px_320px_at_92%_6%,hsl(var(--foreground)/0.03),transparent_70%)]" />
      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <Hero locale={locale} />
        <ProofStrip />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
