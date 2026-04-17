import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface WidgetShellServerProps {
  title: string
  icon?: ReactNode
  description?: string
  size?: 'tiny' | 'small' | 'small-long' | 'medium' | 'large' | 'extra-large'
  children: ReactNode
}

export function WidgetShellServer({ title, icon, description, children }: WidgetShellServerProps) {
  return (
    <Card variant="default" className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}
