'use client'

import { useState } from 'react'
import { Pencil, RefreshCw, Sparkles, CloudUpload, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ImportButton from './import/import-button'
import { useKeyboardShortcuts } from '../../../../hooks/use-keyboard-shortcuts'
import { ActiveFilterTags } from './filters/active-filter-tags'
import { AnimatePresence, motion } from 'motion/react'
import { FilterCommandMenu } from './filters/filter-command-menu'
import { useCurrentLocale } from '@/locales/client'
import { useDashboard } from '../dashboard-context'
import { AddWidgetSheet } from './add-widget-sheet'
import { ShareButton } from './share-button'
import { useDataActions } from '@/context/providers/data-actions-provider'
import { useDataIsLoading } from '@/context/providers/data-state-provider'
import { cn } from '@/lib/utils'
import { DailySummaryModal } from './daily-summary-modal'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PnLSummary } from './pnl-summary'

export default function Navbar() {
  const locale = useCurrentLocale()
  const {
    isCustomizing,
    toggleCustomizing,
    addWidget,
    layouts,
    autoSaveStatus,
    flushPendingSaves,
  } = useDashboard()
  const { refreshAllData, isPlusUser } = useDataActions()
  const isLoading = useDataIsLoading()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshAllData({ force: true })
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  const currentLayout = layouts || { desktop: [], mobile: [] }

  return (
    <div className="sticky top-0 z-40 w-full pointer-events-none">
      <motion.nav
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center h-14 w-full px-3 gap-0 bg-card border-b border-border"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left Side: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-8 w-8 rounded-[7px] text-muted-foreground/55 border border-transparent hover:border-border/30 hover:bg-muted/40 hover:text-foreground/80" />
            <div className="mx-1 hidden h-5 w-px bg-border/50 sm:block" />
          </div>

          {/* Center: PnL Metrics (Desktop Only) */}
          <div className="hidden md:flex flex-1 max-w-2xl px-4">
            <PnLSummary />
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3">
            {/* Config Group */}
            <div className="flex items-center gap-1.5 rounded-xl border-0 bg-primary/6 p-1">
              <Button
                id="customize-mode"
                variant="ghost"
                size="sm"
                onClick={toggleCustomizing}
                className={cn(
                  'h-9 w-auto px-3 sm:px-4 gap-2 rounded-xl transition-[opacity,background-color,border-color] duration-500',
                  isCustomizing
                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.45)] font-semibold'
                    : 'text-muted-foreground/70 hover:bg-primary/8 hover:text-foreground',
                )}
              >
                <Pencil className={cn('w-3.5 h-3.5', isCustomizing && 'animate-pulse')} />
                <span className="inline text-[10px] font-bold uppercase tracking-[0.14em]">
                  {isCustomizing ? 'Lock Grid' : 'Edit Layout'}
                </span>
              </Button>

              {isCustomizing && autoSaveStatus.hasPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={flushPendingSaves}
                  className="hidden sm:flex h-9 gap-2 rounded-xl border-0 px-3 text-foreground transition-[opacity,background-color,border-color] hover:border-primary/18 hover:bg-primary/8"
                >
                  <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Save Now</span>
                </Button>
              )}

              {!autoSaveStatus.hasPending && isCustomizing && (
                <div className="hidden sm:flex items-center gap-2 px-3 text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                </div>
              )}

              <AddWidgetSheet
                onAddWidget={addWidget}
                isCustomizing={isCustomizing}
                showLabelOnMobile
              />

              <div className="mx-1 hidden h-5 w-px bg-border/50 sm:block" />

              <ShareButton currentLayout={currentLayout} />
            </div>

            {/* Performance & Search Group */}
            <div className="flex items-center gap-2">
              <FilterCommandMenu variant="navbar" />

              <div className="hidden sm:flex items-center gap-2">
                <ImportButton />

                {!isPlusUser() && (
                  <Link href={`/${locale}/dashboard/billing`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-2 rounded-xl border border-primary/18 bg-primary/8 px-5 text-[10px] font-black uppercase tracking-[0.12em] text-foreground shadow-none transition-[opacity,background-color,border-color] duration-500 hover:border-primary/26 hover:bg-primary/12"
                      aria-label="Upgrade to Elite plan"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                      <span>Elite</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mx-1 hidden h-5 w-px bg-border/50 sm:block" />

              {/* Real-time Actions */}
              <div className="flex items-center gap-2 rounded-xl border-0 bg-background/55 p-1.5 shadow-inner">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/10 transition-[opacity,background-color,border-color] active:scale-90"
                  aria-label="Refresh dashboard data"
                >
                  <RefreshCw
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-1000',
                      (isRefreshing || isLoading) && 'animate-spin',
                    )}
                  />
                </Button>
                <DailySummaryModal />
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <PnLSummary className="w-full" />
        </div>

        {/* Dynamic Filters Bar */}
        <AnimatePresence>
          <div className="px-8 pb-3 flex flex-wrap gap-2">
            <ActiveFilterTags showAccountNumbers={true} />
          </div>
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}
