'use client'

import { Play } from 'lucide-react'

export function LiveInAction() {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-mono tracking-[3px] text-primary">
          LIVE IN ACTION
        </div>
        <h2 className="text-balance text-4xl font-light tracking-[-0.02em] sm:text-5xl">
          See it work on real trades.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
          One prop trader. 847 trades. 60 seconds. Zero noise.
        </p>
      </div>

      {/* Cinematic video surface */}
      <div className="group relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-2xl">
        <div className="aspect-video w-full bg-[linear-gradient(180deg,#0a0a0a_0%,#000_100%)] flex items-center justify-center relative">
          {/* Subtle grid overlay for premium feel */}
          <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-40" />

          {/* Play button */}
          <button
            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/10 active:scale-[0.985]"
            aria-label="Play demo video"
          >
            <Play className="h-7 w-7 text-white/90 ml-0.5" />
          </button>

          <div className="absolute bottom-5 right-5 rounded bg-black/60 px-2.5 py-0.5 text-[10px] font-mono tracking-[2px] text-white/50">
            2:14 • REAL SESSION
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md text-center text-sm text-muted-foreground/80">
        Watch how instant broker sync + AI edge detection actually looks in a live prop firm workflow.
      </div>
    </section>
  )
}
