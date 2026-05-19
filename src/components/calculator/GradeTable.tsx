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
      <div className="overflow-x-auto">
        <div className="min-w-[28rem] lg:min-w-[36rem]">
          <div className="grid grid-cols-[minmax(8rem,1fr)_9rem_4.5rem_4.5rem_2rem] gap-2 border-b border-border/70 px-3 py-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground lg:grid-cols-[1fr_170px_100px_100px_40px] lg:gap-3 lg:px-5 lg:py-3.5 lg:text-[0.72rem] sm:tracking-[0.14em]">
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
        className="w-full rounded-xl border-dashed border-border/75 bg-card/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="size-4 mr-2" />
        Add row
      </Button>
    </div>
  )
}
