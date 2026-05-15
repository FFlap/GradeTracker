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
    <div className="group grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_150px_100px_100px_40px] sm:gap-3.5">
      <label className="space-y-1.5 sm:space-y-0">
        <span className="text-xs font-medium text-muted-foreground sm:sr-only">
          Assignment
        </span>
        <Input
          type="text"
          placeholder="e.g. Homework"
          value={row.assignment}
          onChange={(e) => onUpdate(row.id, 'assignment', e.target.value)}
          className="h-10 rounded-lg border-border/70 bg-input/70 px-2.5 shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input sm:h-9 sm:border-transparent sm:bg-transparent"
        />
      </label>
      <div>
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground sm:sr-only">
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
            className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-lg transition-colors hover:bg-accent/45"
            aria-label="Pick date"
            title="Pick date"
          >
            <CalendarDays className="size-4 mx-auto text-primary" />
          </button>
          <Input
            ref={dateInputRef}
            type="date"
            value={row.date}
            onChange={(e) => onUpdate(row.id, 'date', e.target.value)}
            className="h-10 rounded-lg border-border/70 bg-input/70 pl-9 pr-9 text-sm shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input sm:h-9 sm:border-transparent sm:bg-transparent"
          />
          {row.date.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onUpdate(row.id, 'date', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-lg text-muted-foreground transition-colors hover:bg-accent/45 hover:text-foreground"
              aria-label="Clear date"
              title="Clear date"
            >
              <X className="size-4 mx-auto" />
            </button>
          )}
        </div>
      </div>
      <label className="space-y-1.5 sm:space-y-0">
        <span className="text-xs font-medium text-muted-foreground sm:sr-only">
          Grade
        </span>
        <Input
          type="text"
          value={row.grade}
          onChange={(e) =>
            onUpdate(row.id, 'grade', sanitizeGradeInput(e.target.value))
          }
          className="h-10 rounded-lg border-border/70 bg-input/70 shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input sm:h-9 sm:border-transparent sm:bg-transparent sm:text-center"
        />
      </label>
      <label className="space-y-1.5 sm:space-y-0">
        <span className="text-xs font-medium text-muted-foreground sm:sr-only">
          Weight
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={row.weight}
          onChange={(e) =>
            onUpdate(row.id, 'weight', sanitizeNumberInput(e.target.value))
          }
          className="h-10 rounded-lg border-border/70 bg-input/70 shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input sm:h-9 sm:border-transparent sm:bg-transparent sm:text-center"
        />
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row.id)}
        className={`h-10 w-full rounded-lg text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive sm:size-8 ${
          showDelete ? 'opacity-100' : 'hidden sm:inline-flex sm:opacity-0 sm:group-hover:opacity-100'
        }`}
        disabled={!showDelete}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
