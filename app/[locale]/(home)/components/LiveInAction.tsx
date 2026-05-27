'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function LiveInAction() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-20 border-t border-border/10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-mono tracking-[3px] text-primary">
          LIVE IN ACTION
        </div>
        <h2 className="text-balance text-4xl font-light tracking-tight sm:text-5xl">
          See it work on real trades.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
          One prop trader. 847 trades. 60 seconds. Zero noise.
        </p>
      </div>

      {/* Cinematic video surface */}
      <div className="group relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[inset_0_0_40px_-20px] shadow-primary/10">
        <div className="aspect-video w-full bg-[linear-gradient(180deg,var(--background)_0%,var(--background)_100%)] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-40" />

          <button
            onClick={() => setOpen(true)}
            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/15 active:scale-[0.985] animate-[pulse-ring_2s_ease-in-out_infinite]"
            aria-label="Play demo video"
          >
            <Play className="h-7 w-7 text-white/90 ml-0.5" />
          </button>

          <div className="absolute bottom-5 right-5 rounded bg-background/60 px-2.5 py-0.5 text-[10px] font-mono tracking-[2px] text-white/50">
            2:14 • REAL SESSION
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md text-center text-sm text-muted-foreground/80">
        Watch how instant broker sync + AI edge detection actually looks in a live prop firm workflow.
      </div>

      {/* Working Video Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-primary/20 bg-background">
          <DialogTitle className="sr-only">Product Demo Video</DialogTitle>
          <div className="relative aspect-video w-full bg-black">
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
              className="absolute right-4 top-4 z-50 rounded-full bg-background/60 p-2 text-white/80 hover:bg-background/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
