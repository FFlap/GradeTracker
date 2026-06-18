export type SortDirection = 'asc' | 'desc'

export type SortState<Column extends string> = {
  column: Column
  direction: SortDirection
} | null

export function cycleSort<Column extends string>(
  current: SortState<Column>,
  column: Column
): SortState<Column> {
  if (!current || current.column !== column) {
    return { column, direction: 'asc' }
  }

  if (current.direction === 'asc') {
    return { column, direction: 'desc' }
  }

  return null
}

function isEmpty(value: unknown) {
  if (value === null || value === undefined) return true
  if (typeof value === 'number') return !Number.isFinite(value)
  return typeof value === 'string' && value.trim() === ''
}

export function compareText(a: unknown, b: unknown) {
  return String(a).localeCompare(String(b), undefined, {
    sensitivity: 'base',
  })
}

export function compareNumbers(a: number, b: number) {
  return a - b
}

export function compareDates(a: number, b: number) {
  return a - b
}

export function toFiniteNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null
  }

  const parsed = typeof value === 'number' ? value : Number(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

export function toTimestamp(value: unknown) {
  if (typeof value !== 'string') return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const parsed = new Date(timestamp)

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }

  return timestamp
}

export function stableSort<Row, Value>(
  rows: readonly Row[],
  direction: SortDirection,
  getValue: (row: Row) => Value,
  compare: (a: NonNullable<Value>, b: NonNullable<Value>) => number
) {
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((a, b) => {
      const aEmpty = isEmpty(a.value)
      const bEmpty = isEmpty(b.value)

      if (aEmpty !== bEmpty) return aEmpty ? 1 : -1
      if (aEmpty && bEmpty) return a.index - b.index

      const result = compare(
        a.value as NonNullable<Value>,
        b.value as NonNullable<Value>
      )
      if (!Number.isFinite(result) || result === 0) return a.index - b.index

      return direction === 'asc' ? result : -result
    })
    .map(({ row }) => row)
}
