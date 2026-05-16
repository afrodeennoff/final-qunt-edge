'use client'

import { useMemo } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { getWidgetComponent } from '@/app/[locale]/dashboard/config/widget-registry'
import { Widget } from '@/app/[locale]/dashboard/types/dashboard'
import { useData } from '@/context/data-provider'
import { defaultLayouts } from '@/lib/default-layouts'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import {
  coerceWidgetForLayout,
  generateResponsiveLayouts,
  getEffectiveWidgetSize,
  isRegisteredWidgetType,
} from '@/lib/widget-layout'
import { WidgetShell } from '@/components/ui/widget-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ResponsiveGridLayout = WidthProvider(Responsive)

export function SharedWidgetCanvas() {
  const { isMobile, sharedParams, accountNumbers } = useData()

  const activeLayout = isMobile ? 'mobile' : 'desktop'
  const layoutMode = isMobile ? 'mobile' : 'desktop'

  // Enhanced widget rendering with shared theme
  const renderWidget = (widget: any) => {
    if (!isRegisteredWidgetType(widget.type)) {
      return (
        <WidgetShell
          state="empty"
          title="Widget Not Available"
          description="This widget type is not supported in shared views."
        />
      )
    }

    const effectiveSize = getEffectiveWidgetSize(widget.type, widget.size, isMobile)
    const WidgetComponent: any = getWidgetComponent(widget.type, effectiveSize)

    return (
      <WidgetShell
        key={widget.i}
        className="widget-enter-smooth"
        contentClassName="h-full"
        state="ready"
        title={widget.title || 'Widget'}
        icon={widget.icon}
      >
        <div className="h-full w-full">
          <WidgetComponent size={effectiveSize} />
        </div>
      </WidgetShell>
    )
  }

  // Enhanced shared layout with empty state
  const transformedLayout = useMemo(() => {
    const sharedLayout = (
      activeLayout === 'desktop' ? sharedParams?.desktop : sharedParams?.mobile
    ) as Widget[] | undefined

    const fallbackLayout = (activeLayout === 'desktop'
      ? defaultLayouts.desktop
      : defaultLayouts.mobile) as unknown as Widget[]

    const layoutItems = (sharedLayout && sharedLayout.length > 0 ? sharedLayout : fallbackLayout)
      .filter((item): item is Widget => Boolean(item?.type))
      .map((item) => coerceWidgetForLayout(item, layoutMode))

    return layoutItems
  }, [activeLayout, layoutMode, sharedParams])

  // Check if any accounts are selected
  const hasSelectedAccounts = accountNumbers.length > 0

  if (!hasSelectedAccounts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-card/50 rounded-xl border border-dashed border-border/30 p-8">
        <EmptyState
          icon={<div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
          </div>}
          title="Select Accounts"
          description="Please select at least one trading account to view performance analytics."
          action={
            <Button variant="outline" size="sm">
              View Account Selection
            </Button>
          }
        />
      </div>
    )
  }

  if (transformedLayout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-card/50 rounded-xl border border-dashed border-border/30">
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          title="No Widgets Available"
          description="No trading widgets are available for this shared view."
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveGridLayout
        className="layout-enter-smooth"
        layouts={[[{i: '1', x: 0, y: 0, w: 6, h: 4}, {i: '2', x: 6, y: 0, w: 6, h: 4}]] as any}
        cols={isMobile ? 1 : 12 as any}
        rowHeight={isMobile ? 80 : 60 as any}
        width={1200 as any}
        isResizable={false as any}
        isDraggable={false}
        compactType={null}
        margin={[8, 8]}
        containerPadding={[8, 8]}
      >
        {transformedLayout.map((widget) => (
          <div
            key={widget.i}
            className={cn(
              "widget-enter-smooth",
              "bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
              widget.type.includes('pnl') && "hover:border-success/30",
              widget.type.includes('chart') && "hover:border-primary/30"
            )}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}