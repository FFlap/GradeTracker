import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react'

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
            ? 'inline-flex justify-center gap-0.5 text-center'
            : 'inline-flex gap-1 text-left'
        )}
      >
        <span
          className="min-w-0"
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className="flex size-3 shrink-0 items-center justify-center"
        >
          {direction === 'asc' ? (
            <ArrowUp className="size-3" />
          ) : direction === 'desc' ? (
            <ArrowDown className="size-3" />
          ) : (
            <MoveVertical className="size-3 opacity-60" />
          )}
        </span>
      </button>
    </div>
  )
}
