import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { Logo } from '@/components/logo'
import { BackgroundGlow } from '@/components/ui/background-glow'
import { Button } from '@/components/ui/button'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedStatePanelClassName,
  unifiedBodyCopyClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

interface RouteStateShellProps {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  contentClassName?: string
  fullScreen?: boolean
  compact?: boolean
}

function RouteStateShell({
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
  fullScreen = true,
  compact = false,
}: RouteStateShellProps) {
  return (
    <section
      className={cn(
        'qe-v2-app-shell relative isolate overflow-hidden px-4 py-6 text-foreground sm:px-6 lg:px-8',
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]',
        className,
      )}
    >
      <BackgroundGlow variant="accent" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-32 rounded-b-[2rem] border-0 bg-primary/[0.02]" />

      <div
        className={cn(
          'relative z-10 mx-auto flex w-full items-center justify-center',
          fullScreen ? 'min-h-[calc(100vh-3rem)]' : 'min-h-[inherit]',
        )}
      >
        <div
          className={cn(
            unifiedStatePanelClassName,
            'w-full max-w-[min(40rem,100%)] px-6 py-6 sm:px-8 sm:py-8',
            compact && 'max-w-[min(32rem,100%)] px-5 py-6',
            contentClassName,
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/15 to-transparent" />
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-0 bg-background/40 text-muted-foreground">
              <Logo className="size-5 fill-current" />
            </div>
            <span className={unifiedChipClassName}>{eyebrow}</span>
            <h1 className="mt-4 text-balance text-3xl font-medium tracking-[-0.05em] text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className={cn(unifiedBodyCopyClassName, 'mt-4 max-w-xl text-center')}>{description}</p>
            {children ? <div className="mt-6 w-full">{children}</div> : null}
            {actions ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

interface RouteLoadingScreenProps {
  eyebrow?: string
  title?: string
  description?: string
  fullScreen?: boolean
  compact?: boolean
}

function RouteLoadingScreen({
  eyebrow = 'Loading',
  title = 'Preparing this surface',
  description = 'Applying the current workspace shell and bringing content into focus.',
  fullScreen = true,
  compact = false,
}: RouteLoadingScreenProps) {
  return (
    <RouteStateShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      fullScreen={fullScreen}
      compact={compact}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-0 bg-background/40 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
        <div className="w-full max-w-sm space-y-2">
          <div className="h-2 rounded-full bg-muted/60" />
          <div className="mx-auto h-2 w-4/5 rounded-full bg-muted/40" />
          <div className="mx-auto h-2 w-3/5 rounded-full bg-muted/30" />
        </div>
      </div>
    </RouteStateShell>
  )
}

interface RouteErrorScreenProps {
  eyebrow?: string
  title: string
  description: string
  onRetry?: () => void
  retryLabel?: string
  secondaryLabel?: string
  onSecondary?: () => void
  fullScreen?: boolean
  compact?: boolean
}

function RouteErrorScreen({
  eyebrow = 'Unable to load',
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
  secondaryLabel,
  onSecondary,
  fullScreen = true,
  compact = false,
}: RouteErrorScreenProps) {
  return (
    <RouteStateShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      fullScreen={fullScreen}
      compact={compact}
      actions={
        <>
          {onRetry ? (
            <Button type="button" onClick={onRetry} className="rounded-full px-5">
              {retryLabel}
            </Button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button type="button" onClick={onSecondary} className={cn(unifiedGhostActionClassName, 'px-5')}>
              {secondaryLabel}
            </button>
          ) : null}
        </>
      }
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-destructive/15 bg-destructive/8 text-destructive">
        <AlertTriangle className="size-4" />
      </div>
    </RouteStateShell>
  )
}

export { RouteErrorScreen, RouteLoadingScreen, RouteStateShell }
