import { describe, expect, it } from 'vitest'

import {
  buildFinalExamRows,
  FINAL_EXAM_ROWS,
  sortFinalExamRows,
} from './FinalGradeCalculator'

describe('FinalGradeCalculator row sorting', () => {
  it('defines the three exam inputs in their original display order', () => {
    expect(FINAL_EXAM_ROWS.map((row) => row.key)).toEqual([
      'currentGrade',
      'finalWeight',
      'targetGrade',
    ])
  })

  it('defines stable input, label, and description IDs for every row', () => {
    expect(
      FINAL_EXAM_ROWS.map(({ key, inputId, labelId, descriptionId }) => ({
        key,
        inputId,
        labelId,
        descriptionId,
      }))
    ).toEqual([
      {
        key: 'currentGrade',
        inputId: 'current-grade',
        labelId: 'current-grade-label',
        descriptionId: 'current-grade-description',
      },
      {
        key: 'finalWeight',
        inputId: 'final-weight',
        labelId: 'final-weight-label',
        descriptionId: 'final-weight-description',
      },
      {
        key: 'targetGrade',
        inputId: 'target-grade',
        labelId: 'target-grade-label',
        descriptionId: 'target-grade-description',
      },
    ])
  })

  it('maps controlled values to their stable rows before and after sorting', () => {
    const rows = buildFinalExamRows({
      currentGrade: '88',
      finalWeight: '40',
      targetGrade: '90',
    })

    expect(
      rows.map(({ key, value, inputId, labelId, descriptionId }) => ({
        key,
        value,
        inputId,
        labelId,
        descriptionId,
      }))
    ).toEqual([
      {
        key: 'currentGrade',
        value: '88',
        inputId: 'current-grade',
        labelId: 'current-grade-label',
        descriptionId: 'current-grade-description',
      },
      {
        key: 'finalWeight',
        value: '40',
        inputId: 'final-weight',
        labelId: 'final-weight-label',
        descriptionId: 'final-weight-description',
      },
      {
        key: 'targetGrade',
        value: '90',
        inputId: 'target-grade',
        labelId: 'target-grade-label',
        descriptionId: 'target-grade-description',
      },
    ])

    expect(
      sortFinalExamRows(rows, {
        column: 'value',
        direction: 'desc',
      }).map(({ key, value, labelId }) => ({ key, value, labelId }))
    ).toEqual([
      { key: 'targetGrade', value: '90', labelId: 'target-grade-label' },
      { key: 'currentGrade', value: '88', labelId: 'current-grade-label' },
      { key: 'finalWeight', value: '40', labelId: 'final-weight-label' },
    ])
  })

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
