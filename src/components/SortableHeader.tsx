import { ArrowDown, ArrowUp } from 'lucide-react'

import type { SortDirection } from '@/lib/table-sorting'
import { cn } from '@/lib/utils'

type SortableHeaderProps = {
  label: string
  direction: SortDirection | null
  align?: 'left' | 'center'
  className?: string
  onClick: () => void
}

export function SortableHeader({
  label,
  direction,
  align = 'left',
  className,
  onClick,
}: SortableHeaderProps) {
  const accessibleLabel =
    direction === null
      ? `${label}, not sorted. Sort ascending`
      : direction === 'asc'
        ? `${label}, sorted ascending. Sort descending`
        : `${label}, sorted descending. Clear sorting`

  return (
    <div
      role="columnheader"
      aria-sort={
        direction === null
          ? 'none'
          : direction === 'asc'
            ? 'ascending'
            : 'descending'
      }
      className={className}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={accessibleLabel}
        className={cn(
          'w-full cursor-pointer items-center rounded-sm bg-transparent [font:inherit] [letter-spacing:inherit] [text-transform:inherit] text-inherit transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          align === 'center'
            ? 'relative flex justify-center text-center'
            : 'inline-flex gap-1 text-left'
        )}
      >
        <span
          className={cn(
            'min-w-0',
            align === 'center' && 'w-full text-center'
          )}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center',
            align === 'center' ? 'absolute right-0.5 size-1.5' : 'size-2'
          )}
        >
          {direction === 'asc' ? (
            <ArrowUp
              className={align === 'center' ? 'size-1.5' : 'size-2'}
            />
          ) : direction === 'desc' ? (
            <ArrowDown
              className={align === 'center' ? 'size-1.5' : 'size-2'}
            />
          ) : null}
        </span>
      </button>
    </div>
  )
}
