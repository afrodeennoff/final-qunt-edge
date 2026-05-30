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
  const renderWidget = (widget: Widget) => {
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
    const widgetElement = getWidgetComponent(widget.type, effectiveSize)

    // Return inner widget directly (it provides its own WidgetShell + title)
    // to avoid double-wrapping and since Widget type has no title/icon
    return widgetElement
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

  const responsiveLayouts = useMemo(
    () => generateResponsiveLayouts(transformedLayout),
    [transformedLayout]
  )

  // Check if any accounts are selected
  const hasSelectedAccounts = accountNumbers.length > 0

  if (!hasSelectedAccounts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border/20 bg-muted/30 p-8">
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
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border/20 bg-muted/30">
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
        layouts={responsiveLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={isMobile ? 80 : 60}
        isResizable={false}
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
              "rounded-xl bg-card border border-border/10 transition-all duration-300",
              "hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15",
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