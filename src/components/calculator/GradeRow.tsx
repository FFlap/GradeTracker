import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarDays, X } from 'lucide-react'
import { useRef } from 'react'
import {
  sanitizeGradeInput,
  sanitizeNumberInput,
  type GradeRow as GradeRowType,
} from './types'

function formatReadableDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return ''

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

interface GradeRowProps {
  row: GradeRowType
  onUpdate: (id: string, field: keyof GradeRowType, value: string) => void
  onDelete: (id: string) => void
  showDelete: boolean
}

export function GradeRow({
  row,
  onUpdate,
  onDelete,
  showDelete,
}: GradeRowProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null)
  const readableDate = formatReadableDate(row.date)

  return (
    <div className="group grid grid-cols-[minmax(8rem,1fr)_9rem_4.5rem_4.5rem_2rem] items-center gap-2 lg:grid-cols-[1fr_170px_100px_100px_40px] lg:gap-3.5">
      <label>
        <span className="sr-only">
          Assignment
        </span>
        <Input
          type="text"
          placeholder="e.g. Homework"
          value={row.assignment}
          onChange={(e) => onUpdate(row.id, 'assignment', e.target.value)}
          className="h-8 rounded-md border-transparent bg-transparent px-2 text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:px-2.5 lg:text-sm"
        />
      </label>
      <div>
        <span className="sr-only">
          Date
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const el = dateInputRef.current
              if (!el) return
              // Prefer native date picker when available (Chrome/Safari).
              if (typeof el.showPicker === 'function') {
                try {
                  el.showPicker()
                } catch {
                  el.focus()
                  el.click()
                }
              } else {
                el.focus()
                el.click()
              }
            }}
            className="flex h-8 w-full items-center rounded-md border border-transparent bg-transparent pl-7 pr-7 text-left text-xs shadow-none transition-colors hover:border-border/70 hover:bg-input/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-9 lg:rounded-lg lg:pl-9 lg:pr-9 lg:text-sm"
            aria-label="Pick date"
            title="Pick date"
          >
            <span className={readableDate ? 'truncate text-foreground' : 'truncate text-muted-foreground'}>
              {readableDate || 'Pick date'}
            </span>
          </button>
          <CalendarDays className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-primary lg:left-3 lg:size-4" />
          <Input
            ref={dateInputRef}
            type="date"
            value={row.date}
            onChange={(e) => onUpdate(row.id, 'date', e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0"
          />
          {row.date.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onUpdate(row.id, 'date', '')}
              className="absolute right-1 top-1/2 size-6 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:bg-accent/45 hover:text-foreground lg:right-2 lg:size-7 lg:rounded-lg"
              aria-label="Clear date"
              title="Clear date"
            >
              <X className="mx-auto size-3.5 lg:size-4" />
            </button>
          )}
        </div>
      </div>
      <label>
        <span className="sr-only">
          Grade
        </span>
        <Input
          type="text"
          value={row.grade}
          onChange={(e) =>
            onUpdate(row.id, 'grade', sanitizeGradeInput(e.target.value))
          }
          className="h-8 rounded-md border-transparent bg-transparent px-1 text-center text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:text-sm"
        />
      </label>
      <label>
        <span className="sr-only">
          Weight
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={row.weight}
          onChange={(e) =>
            onUpdate(row.id, 'weight', sanitizeNumberInput(e.target.value))
          }
          className="h-8 rounded-md border-transparent bg-transparent px-1 text-center text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:text-sm"
        />
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.id)}
        className={`size-7 rounded-md text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive lg:size-8 lg:rounded-lg ${
          showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        disabled={!showDelete}
      >
        <X className="size-3.5 lg:size-4" />
      </Button>
    </div>
  )
}
