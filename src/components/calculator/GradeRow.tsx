import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarDays, X } from 'lucide-react'
import { useRef } from 'react'
import {
  sanitizeGradeInput,
  sanitizeNumberInput,
  type GradeRow as GradeRowType,
} from './types'

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

  return (
    <div className="group grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_150px_100px_100px_40px] sm:gap-3.5">
      <Input
        type="text"
        placeholder="e.g. Homework"
        value={row.assignment}
        onChange={(e) => onUpdate(row.id, 'assignment', e.target.value)}
        className="h-9 rounded-lg border-transparent bg-transparent px-2.5 shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const el = dateInputRef.current
            if (!el) return
            // Prefer native date picker when available (Chrome/Safari).
            const anyEl = el as any
            if (typeof anyEl.showPicker === 'function') {
              anyEl.showPicker()
            } else {
              el.focus()
              el.click()
            }
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-accent/45 transition-colors"
          aria-label="Pick date"
          title="Pick date"
        >
          <CalendarDays className="h-4 w-4 mx-auto text-primary" />
        </button>
        <Input
          ref={dateInputRef}
          type="date"
          value={row.date}
          onChange={(e) => onUpdate(row.id, 'date', e.target.value)}
          className="h-9 rounded-lg border-transparent bg-transparent pl-9 pr-9 text-sm shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
        />
        {row.date.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onUpdate(row.id, 'date', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/45 transition-colors"
            aria-label="Clear date"
            title="Clear date"
          >
            <X className="h-4 w-4 mx-auto" />
          </button>
        )}
      </div>
      <Input
        type="text"
        value={row.grade}
        onChange={(e) =>
          onUpdate(row.id, 'grade', sanitizeGradeInput(e.target.value))
        }
        className="h-9 rounded-lg border-transparent bg-transparent text-center shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
      />
      <Input
        type="text"
        inputMode="decimal"
        value={row.weight}
        onChange={(e) =>
          onUpdate(row.id, 'weight', sanitizeNumberInput(e.target.value))
        }
        className="h-9 rounded-lg border-transparent bg-transparent text-center shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.id)}
        className={`h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity ${
          showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        disabled={!showDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
