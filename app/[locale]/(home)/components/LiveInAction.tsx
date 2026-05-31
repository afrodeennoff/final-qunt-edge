'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function LiveInAction() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-24 border-t-0">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-mono tracking-[3px] text-primary">
          <Play className="h-3 w-3 fill-primary" />
          LIVE IN ACTION
        </div>
        <h2 className="text-balance text-4xl font-light tracking-tight sm:text-5xl">
          See it work on real trades.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] text-muted-foreground/70 leading-relaxed">
          One prop trader. 847 trades. 60 seconds. Zero noise.
        </p>
      </div>

      <div className="group relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border-0 bg-card/50 shadow-[inset_0_0_50px_-25px] shadow-primary/5">
        <div className="aspect-video w-full bg-gradient-to-b from-background via-background to-background/90 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-30" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/5 blur-xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150" />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition-all duration-300 hover:border-primary/60 hover:bg-primary/20 hover:scale-105 active:scale-[0.98] shadow-lg shadow-primary/10 animate-[pulse-ring_2.5s_ease-in-out_infinite]"
            aria-label="Play demo video"
          >
            <Play className="h-7 w-7 text-[var(--qe-ref-text)]/90 ml-0.5" />
          </button>

          <div className="absolute bottom-5 right-5 rounded-full bg-background/60 px-3 py-1 text-[10px] font-mono tracking-[2px] text-[var(--qe-ref-text-muted)]/50 backdrop-blur-sm">
            2:14 &bull; REAL SESSION
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-lg text-center text-[13px] text-muted-foreground/60 leading-relaxed">
        Watch how instant broker sync + AI edge detection actually looks in a live prop firm workflow.
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-transparent bg-background">
          <DialogTitle className="sr-only">Product Demo Video</DialogTitle>
          <div className="relative aspect-video w-full bg-[var(--qe-ref-surface)]">
            <video
              controls
              autoPlay
              className="absolute inset-0 h-full w-full object-contain"
              src="/videos/thor-tutorial.mp4"
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-background/60 p-2 text-[var(--qe-ref-text-muted)]/80 hover:bg-background/80 hover:text-[var(--qe-ref-text)] backdrop-blur-sm transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
