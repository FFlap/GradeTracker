import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DatePicker } from './DatePicker'
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
  return (
    <div role="presentation" className="group grid grid-cols-[minmax(4.25rem,1fr)_3.8rem_2.5rem_2.625rem_1rem] items-center gap-1 min-[390px]:grid-cols-[minmax(5rem,1.35fr)_minmax(5.25rem,1.25fr)_minmax(3.2rem,0.95fr)_minmax(3.4rem,0.95fr)_1.5rem] min-[390px]:gap-1.5 xl:grid-cols-[minmax(12rem,1.35fr)_minmax(8.5rem,1.25fr)_minmax(5.25rem,0.95fr)_minmax(5.75rem,0.95fr)_2rem] xl:gap-2.5 2xl:gap-3.5">
      <div role="cell">
        <label>
          <span className="sr-only">
            Assignment
          </span>
          <Input
            type="text"
            placeholder="e.g. Homework"
            value={row.assignment}
            onChange={(e) => onUpdate(row.id, 'assignment', e.target.value)}
            className="h-8 rounded-sm border-transparent bg-transparent px-1.5 text-xs shadow-none placeholder:text-muted-foreground/70 hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:px-2.5 lg:text-sm"
          />
        </label>
      </div>
      <div role="cell">
        <span className="sr-only">
          Date
        </span>
        <DatePicker
          value={row.date}
          onChange={(value) => onUpdate(row.id, 'date', value)}
        />
      </div>
      <div role="cell">
        <label>
          <span className="sr-only">
            Grade
          </span>
          <Input
            type="text"
            placeholder="80"
            value={row.grade}
            onChange={(e) =>
              onUpdate(row.id, 'grade', sanitizeGradeInput(e.target.value))
            }
            className="h-8 rounded-sm border-transparent bg-transparent px-0.5 text-center text-xs shadow-none placeholder:text-muted-foreground/70 hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:text-sm"
          />
        </label>
      </div>
      <div role="cell">
        <label>
          <span className="sr-only">
            Weight
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="20"
            value={row.weight}
            onChange={(e) =>
              onUpdate(row.id, 'weight', sanitizeNumberInput(e.target.value))
            }
            className="h-8 rounded-sm border-transparent bg-transparent px-0.5 text-center text-xs shadow-none placeholder:text-muted-foreground/70 hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:text-sm"
          />
        </label>
      </div>
      <div role="cell">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.id)}
          className={`size-6 rounded-sm text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive lg:size-8 ${
            showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          disabled={!showDelete}
        >
          <X className="size-3 lg:size-4" />
        </Button>
      </div>
    </div>
  )
}
