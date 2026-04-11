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
    <div className="grid grid-cols-1 gap-2 items-center group sm:grid-cols-[1fr_150px_100px_100px_40px]">
      <Input
        type="text"
        placeholder="e.g. Homework"
        value={row.assignment}
        onChange={(e) => onUpdate(row.id, 'assignment', e.target.value)}
        className="bg-input border-border"
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
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-accent/40 transition-colors"
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
          className="bg-input border-border pl-9 pr-9 text-sm"
        />
        {row.date.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onUpdate(row.id, 'date', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
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
        className="bg-input border-border text-center"
      />
      <Input
        type="text"
        inputMode="decimal"
        value={row.weight}
        onChange={(e) =>
          onUpdate(row.id, 'weight', sanitizeNumberInput(e.target.value))
        }
        className="bg-input border-border text-center"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.id)}
        className={`h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity ${
          showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        disabled={!showDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
