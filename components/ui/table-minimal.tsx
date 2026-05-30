import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: 'compact' | 'normal'
  striped?: boolean
  hoverable?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density = 'normal', striped = false, hoverable = false, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          'w-full text-sm',
          density === 'compact' ? 'space-y-1' : 'space-y-2',
          className
        )}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('sticky top-0 z-10 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-md [&_tr]:border-b-0', className)} {...props} />
  )
)
TableHeader.displayName = 'TableHeader'

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
)
TableBody.displayName = 'TableBody'

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium', className)} {...props} />
  )
)
TableFooter.displayName = 'TableFooter'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean
  selected?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b-0 transition-all duration-200 hover:bg-primary/[0.02] data-[state=selected]:bg-primary/[0.03]',
        hover && 'hover:bg-muted/50',
        selected && 'bg-muted/50',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 whitespace-nowrap align-middle [&:has([role=checkbox])]:pr-0',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

export interface TableHeadCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
}

const TableHeadCell = React.forwardRef<HTMLTableCellElement, TableHeadCellProps>(
  ({ className, align = 'left', ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left font-medium text-muted-foreground first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  )
)
TableHeadCell.displayName = 'TableHeadCell'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableHeadCell,
  TableHeadCell as Th,
  TableCell as Td,
  TableRow as Tr,
}