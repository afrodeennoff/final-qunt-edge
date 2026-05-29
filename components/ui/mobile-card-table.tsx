'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CardField {
  key: string
  label: string
  render: (value: unknown) => React.ReactNode
  primary?: boolean
}

interface MobileCardTableProps {
  data: Record<string, unknown>[]
  fields: CardField[]
  expandable?: boolean
  expandContent?: (row: Record<string, unknown>) => React.ReactNode
  onRowTap?: (row: Record<string, unknown>) => void
}

export function MobileCardTable({
  data,
  fields,
  expandable = true,
  expandContent,
  onRowTap,
}: MobileCardTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const primaryFields = fields.filter((f) => f.primary).length > 0
    ? fields.filter((f) => f.primary)
    : fields.slice(0, 2)
  const secondaryFields = fields.filter((f) => !primaryFields.includes(f))

  return (
    <div className="space-y-2 px-2">
      {data.map((row, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/20 bg-gradient-to-br from-card/50 to-card/10 ring-1 ring-inset ring-white/[0.02] p-3 touch-target cursor-pointer"
          onClick={() => {
            if (expandable) setExpandedIndex(expandedIndex === i ? null : i)
            onRowTap?.(row)
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {primaryFields.map((field) => (
                <div key={field.key} className="truncate">
                  <span className="text-sm font-medium">
                    {field.render(row[field.key])}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              {secondaryFields.slice(0, 2).map((field) => (
                <span key={field.key}>{field.render(row[field.key])}</span>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-2 border-t border-border/20 space-y-1.5">
                  {secondaryFields.map((field) => (
                    <div key={field.key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{field.label}</span>
                      <span className="font-medium">{field.render(row[field.key])}</span>
                    </div>
                  ))}
                  {expandContent && expandContent(row)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
