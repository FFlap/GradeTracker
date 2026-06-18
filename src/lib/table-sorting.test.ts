import { describe, expect, it } from 'vitest'
import {
  compareDates,
  compareNumbers,
  compareText,
  cycleSort,
  stableSort,
  toFiniteNumber,
  toTimestamp,
  type SortState,
} from './table-sorting'

describe('cycleSort', () => {
  it('cycles unsorted, ascending, descending, unsorted', () => {
    expect(cycleSort(null, 'name')).toEqual({
      column: 'name',
      direction: 'asc',
    })
    expect(cycleSort({ column: 'name', direction: 'asc' }, 'name')).toEqual({
      column: 'name',
      direction: 'desc',
    })
    expect(cycleSort({ column: 'name', direction: 'desc' }, 'name')).toBeNull()
  })

  it('starts a different column ascending', () => {
    const state: SortState<'name' | 'date'> = {
      column: 'name',
      direction: 'desc',
    }

    expect(cycleSort(state, 'date')).toEqual({
      column: 'date',
      direction: 'asc',
    })
  })
})

describe('stableSort', () => {
  const rows = [
    { id: 'a', value: 'Beta' },
    { id: 'b', value: '' },
    { id: 'c', value: 'alpha' },
    { id: 'd', value: 'Alpha' },
  ]

  it('sorts text case-insensitively and preserves equal-row order', () => {
    expect(
      stableSort(rows, 'asc', (row) => row.value, compareText).map(
        (row) => row.id
      )
    ).toEqual(['c', 'd', 'a', 'b'])
  })

  it('keeps empty values last when descending', () => {
    expect(
      stableSort(rows, 'desc', (row) => row.value, compareText).map(
        (row) => row.id
      )
    ).toEqual(['a', 'c', 'd', 'b'])
  })

  it('keeps invalid numeric values last in both directions', () => {
    const numericRows = [
      { id: 'invalid', value: toFiniteNumber('not-a-number') },
      { id: 'two', value: toFiniteNumber('2') },
      { id: 'ten', value: toFiniteNumber('10') },
    ]

    expect(
      stableSort(
        numericRows,
        'asc',
        (row) => row.value,
        compareNumbers
      ).map((row) => row.id)
    ).toEqual(['two', 'ten', 'invalid'])
    expect(
      stableSort(
        numericRows,
        'desc',
        (row) => row.value,
        compareNumbers
      ).map((row) => row.id)
    ).toEqual(['ten', 'two', 'invalid'])
  })

  it('does not mutate the source rows', () => {
    const originalOrder = rows.map((row) => row.id)

    const sorted = stableSort(rows, 'asc', (row) => row.value, compareText)

    expect(rows.map((row) => row.id)).toEqual(originalOrder)
    expect(sorted).not.toBe(rows)
  })
})

describe('comparators and normalizers', () => {
  it('compares text without case sensitivity', () => {
    expect(compareText('Alpha', 'alpha')).toBe(0)
    expect(compareText('alpha', 'Beta')).toBeLessThan(0)
  })

  it('sorts numeric strings numerically after normalization', () => {
    expect(
      compareNumbers(toFiniteNumber('10')!, toFiniteNumber('2')!)
    ).toBeGreaterThan(0)
  })

  it('sorts dates chronologically after normalization', () => {
    expect(
      compareDates(toTimestamp('2026-01-01')!, toTimestamp('2025-12-31')!)
    ).toBeGreaterThan(0)
  })

  it('normalizes invalid numeric and date values to null', () => {
    expect(toFiniteNumber('not-a-number')).toBeNull()
    expect(toFiniteNumber('80abc')).toBeNull()
    expect(toFiniteNumber('   ')).toBeNull()
    expect(toFiniteNumber(Number.POSITIVE_INFINITY)).toBeNull()
    expect(toFiniteNumber(Number.NEGATIVE_INFINITY)).toBeNull()
    expect(toFiniteNumber(Number.NaN)).toBeNull()
    expect(toTimestamp('not-a-date')).toBeNull()
    expect(toTimestamp(null)).toBeNull()
  })

  it('rejects malformed and impossible ISO calendar dates', () => {
    expect(toTimestamp('2026-02-30')).toBeNull()
    expect(toTimestamp('2026-13-01')).toBeNull()
    expect(toTimestamp('2026-01-01T00:00:00Z')).toBeNull()
    expect(toTimestamp('2026-01-01suffix')).toBeNull()
    expect(toTimestamp('2026-1-1')).toBeNull()
  })

  it('accepts valid ISO calendar dates including leap day', () => {
    expect(toTimestamp('2024-02-29')).toBe(Date.UTC(2024, 1, 29))
  })
})
