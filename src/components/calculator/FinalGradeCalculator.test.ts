import { describe, expect, it } from 'vitest'

import {
  FINAL_EXAM_ROWS,
  sortFinalExamRows,
} from './FinalGradeCalculator'

describe('FinalGradeCalculator row sorting', () => {
  it('sorts metric labels alphabetically without changing the source order', () => {
    const sorted = sortFinalExamRows(FINAL_EXAM_ROWS, {
      column: 'metric',
      direction: 'asc',
    })

    expect(sorted.map((row) => row.label)).toEqual([
      'Current grade',
      'Final exam weight',
      'Target grade',
    ])
    expect(FINAL_EXAM_ROWS.map((row) => row.key)).toEqual([
      'currentGrade',
      'finalWeight',
      'targetGrade',
    ])
  })

  it('sorts strict numeric values and keeps empty or invalid values last', () => {
    const rows = FINAL_EXAM_ROWS.map((row) => ({
      ...row,
      value:
        row.key === 'currentGrade'
          ? '88'
          : row.key === 'finalWeight'
            ? '40'
            : '90abc',
    }))

    expect(
      sortFinalExamRows(rows, {
        column: 'value',
        direction: 'asc',
      }).map((row) => row.key)
    ).toEqual(['finalWeight', 'currentGrade', 'targetGrade'])

    expect(
      sortFinalExamRows(rows, {
        column: 'value',
        direction: 'desc',
      }).map((row) => row.key)
    ).toEqual(['currentGrade', 'finalWeight', 'targetGrade'])
  })
})
