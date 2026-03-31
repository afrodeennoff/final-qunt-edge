'use client'

export default function LiveStatsStrip() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[oklch(0.07_0_0/0.6)] backdrop-blur-md border-y border-[oklch(0.14_0_0/0.3)] py-6"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground/60 [font-family:var(--home-copy)]">
          Trusted by traders tracking their performance with Qunt Edge
        </p>
      </div>
    </section>
  )
}
