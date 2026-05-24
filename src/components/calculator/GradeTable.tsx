import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { GradeRow } from './GradeRow'
import type { GradeRow as GradeRowType } from './types'

interface GradeTableProps {
  rows: GradeRowType[]
  onUpdateRow: (id: string, field: keyof GradeRowType, value: string) => void
  onDeleteRow: (id: string) => void
  onAddRow: () => void
}

export function GradeTable({
  rows,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
}: GradeTableProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="w-full">
          <div className="grid grid-cols-[minmax(4.25rem,1fr)_3.8rem_2.5rem_2.625rem_1rem] gap-1 border-b border-border/70 px-2 py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.05em] text-muted-foreground min-[390px]:grid-cols-[minmax(5rem,1.35fr)_minmax(5.25rem,1.25fr)_minmax(3.2rem,0.95fr)_minmax(3.4rem,0.95fr)_1.5rem] min-[390px]:gap-1.5 sm:px-3 sm:text-[0.64rem] sm:tracking-[0.08em] xl:grid-cols-[minmax(12rem,1.35fr)_minmax(8.5rem,1.25fr)_minmax(5.25rem,0.95fr)_minmax(5.75rem,0.95fr)_2rem] xl:gap-2.5 xl:px-5 xl:py-3.5 xl:text-[0.72rem] xl:tracking-[0.12em] 2xl:gap-3 2xl:tracking-[0.14em]">
            <span>Assignment</span>
            <span className="text-center">Date</span>
            <span className="text-center">Grade</span>
            <span className="text-center">Weight</span>
            <span></span>
          </div>

          <div className="divide-y divide-border/60">
            {rows.map((row) => (
              <div
                key={row.id}
                className="px-3 py-2.5 transition-colors hover:bg-muted/12 lg:px-5 lg:py-3.5"
              >
                <GradeRow
                  row={row}
                  onUpdate={onUpdateRow}
                  onDelete={onDeleteRow}
                  showDelete={rows.length > 1}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddRow}
        className="w-full rounded-xl border-dashed border-primary/25 bg-card/80 text-primary hover:border-primary/45 hover:bg-primary/5"
      >
        <Plus className="size-4 mr-2" />
        Add row
      </Button>
    </div>
  )
}
