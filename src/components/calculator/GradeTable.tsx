import { useMemo, useState } from 'react'

import { SortableHeader } from '@/components/SortableHeader'
import {
  compareDates,
  compareNumbers,
  compareText,
  cycleSort,
  stableSort,
  toFiniteNumber,
  toTimestamp,
  type SortState,
} from '@/lib/table-sorting'

import { GradeRow } from './GradeRow'
import { parseGradeInput, type GradeRow as GradeRowType } from './types'

type GradeTableSortColumn = 'assignment' | 'date' | 'grade' | 'weight'

interface GradeTableProps {
  rows: GradeRowType[]
  onUpdateRow: (id: string, field: keyof GradeRowType, value: string) => void
  onDeleteRow: (id: string) => void
}

export function GradeTable({
  rows,
  onUpdateRow,
  onDeleteRow,
}: GradeTableProps) {
  const [sort, setSort] = useState<SortState<GradeTableSortColumn>>(null)
  const sortedRows = useMemo(() => {
    if (!sort) return rows

    switch (sort.column) {
      case 'assignment':
        return stableSort(
          rows,
          sort.direction,
          (row) => row.assignment,
          compareText
        )
      case 'date':
        return stableSort(
          rows,
          sort.direction,
          (row) => toTimestamp(row.date),
          compareDates
        )
      case 'grade':
        return stableSort(
          rows,
          sort.direction,
          (row) => parseGradeInput(row.grade),
          compareNumbers
        )
      case 'weight':
        return stableSort(
          rows,
          sort.direction,
          (row) => toFiniteNumber(row.weight),
          compareNumbers
        )
    }
  }, [rows, sort])

  const getDirection = (column: GradeTableSortColumn) =>
    sort?.column === column ? sort.direction : null

  return (
    <div>
      <div>
        <div role="table" aria-label="Assignments" className="w-full">
          <div role="row" className="grid grid-cols-[minmax(4.25rem,1fr)_3.8rem_2.5rem_2.625rem_1rem] gap-1 border-b border-border/70 px-2 py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.05em] text-muted-foreground min-[390px]:grid-cols-[minmax(5rem,1.35fr)_minmax(5.25rem,1.25fr)_minmax(3.2rem,0.95fr)_minmax(3.4rem,0.95fr)_1.5rem] min-[390px]:gap-1.5 sm:px-3 sm:text-[0.64rem] sm:tracking-[0.08em] xl:grid-cols-[minmax(12rem,1.35fr)_minmax(8.5rem,1.25fr)_minmax(5.25rem,0.95fr)_minmax(5.75rem,0.95fr)_2rem] xl:gap-2.5 xl:px-5 xl:py-3.5 xl:text-[0.72rem] xl:tracking-[0.12em] 2xl:gap-3 2xl:tracking-[0.14em]">
            <SortableHeader
              label="Assignment"
              direction={getDirection('assignment')}
              className="pl-1.5 lg:pl-2.5"
              onClick={() => setSort((current) => cycleSort(current, 'assignment'))}
            />
            <SortableHeader
              label="Date"
              direction={getDirection('date')}
              align="center"
              onClick={() => setSort((current) => cycleSort(current, 'date'))}
            />
            <SortableHeader
              label="Grade"
              direction={getDirection('grade')}
              align="center"
              onClick={() => setSort((current) => cycleSort(current, 'grade'))}
            />
            <SortableHeader
              label="Weight"
              direction={getDirection('weight')}
              align="center"
              onClick={() => setSort((current) => cycleSort(current, 'weight'))}
            />
            <span role="columnheader" aria-label="Actions"></span>
          </div>

          <div role="rowgroup" className="divide-y divide-border/60">
            {sortedRows.map((row) => (
              <div
                key={row.id}
                role="row"
                className="px-3 py-2.5 transition-colors hover:bg-muted/45 lg:px-5 lg:py-3.5"
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
    </div>
  )
}
