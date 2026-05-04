import * as React from 'react'

import { cn } from '@/lib/utils'

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="table-container"
      className="relative w-full overflow-auto overscroll-x-contain rounded-[1.2rem] border border-border/7 bg-[linear-gradient(180deg,hsl(var(--card)_/_0.84)_0%,hsl(var(--card)_/_0.78)_100%)] shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.02),0_18px_34px_-28px_rgba(0,0,0,0.58)]"
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn('w-full caption-bottom type-body-sm', className)}
        {...props}
      />
    </div>
  ),
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn(
      'sticky top-0 border-b border-border/6 bg-[hsl(var(--card)_/_0.76)] [&_tr]:border-b [&_tr]:border-border/6',
      className,
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      'border-t border-border/8 bg-[hsl(var(--card)_/_0.74)] font-medium last:[&>tr]:border-b-0',
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        'border-b border-border/5 transition-colors hover:bg-[hsl(var(--card)_/_0.62)] data-[state=selected]:bg-[hsl(var(--foreground)_/_0.05)]',
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
      className={cn(
        'type-label h-10 px-3.5 text-left align-middle text-muted-foreground sm:h-11 sm:px-4 [&:has([role=checkbox])]:pr-0',
        className,
      )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
      className={cn(
        'border-b border-border/60 p-3.5 align-middle type-body-sm leading-[1.5] sm:p-4 [&:has([role=checkbox])]:pr-0',
      'border-border/6',
      className,
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn('type-body-sm mt-4 text-muted-foreground', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
