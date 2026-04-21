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
      <div className="hidden sm:grid grid-cols-[1fr_150px_100px_100px_40px] gap-3 border-b border-border/70 px-5 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span>Assignment</span>
        <span className="text-center">Date</span>
        <span className="text-center">Grade</span>
        <span className="text-center">Weight</span>
        <span></span>
      </div>

      <div className="divide-y divide-border/60">
        {rows.map((row) => (
          <div key={row.id} className="px-5 py-3.5 transition-colors hover:bg-muted/12">
            <GradeRow
              row={row}
              onUpdate={onUpdateRow}
              onDelete={onDeleteRow}
              showDelete={rows.length > 1}
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddRow}
        className="w-full rounded-xl border-dashed border-border/75 bg-card/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add row
      </Button>
    </div>
  )
}
