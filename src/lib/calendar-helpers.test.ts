import { describe, expect, it } from 'vitest'
import {
  buildCalendarGrid,
  buildUpcomingAssessments,
  countAssessmentsInMonth,
  countDueBetween,
  formatRangeLabel,
  getDatePlusDaysISO,
  groupAssessmentsByDate,
  isCompletedAssessment,
  normalizeToISODate,
  parseISODate,
  toISODate,
  type ScheduleAssessment,
} from './calendar-helpers'

function assessment(
  id: string,
  dueDate: string,
  overrides: Partial<ScheduleAssessment> = {}
): ScheduleAssessment {
  return {
    _id: id,
    dueDate,
    courseName: 'CMPT 379',
    assignmentName: id,
    gradeInput: '',
    weight: 0,
    createdAt: 0,
    ...overrides,
  }
}

describe('schedule date helpers', () => {
  it('formats and parses ISO dates in local calendar time', () => {
    expect(toISODate(new Date(2026, 4, 8))).toBe('2026-05-08')
    expect(parseISODate('2026-05-08')).toEqual(new Date(2026, 4, 8))
    expect(parseISODate('bad-date')).toBeNull()
    expect(parseISODate('2026-13-40')).toBeNull()
  })

  it('normalizes strict ISO and parseable date strings while rejecting blanks and invalid dates', () => {
    expect(normalizeToISODate('2026-05-08')).toBe('2026-05-08')
    expect(normalizeToISODate(' May 8, 2026 ')).toBe('2026-05-08')
    expect(normalizeToISODate('')).toBeNull()
    expect(normalizeToISODate('not a date')).toBeNull()
  })

  it('adds days to an ISO date and falls back from invalid input', () => {
    expect(getDatePlusDaysISO('2026-05-08', 30)).toBe('2026-06-07')
    expect(getDatePlusDaysISO('2026-02-27', 2)).toBe('2026-03-01')
    expect(getDatePlusDaysISO('bad-date', 1, new Date(2026, 0, 1))).toBe(
      '2026-01-02'
    )
  })

  it('formats ranges, including ranges across years', () => {
    expect(formatRangeLabel('2026-05-08', '2026-05-15')).toBe(
      'May 8 – May 15, 2026'
    )
    expect(formatRangeLabel('2026-12-31', '2027-01-07')).toBe(
      'Dec 31, 2026 – Jan 7, 2027'
    )
    expect(formatRangeLabel('bad', '2027-01-07')).toBe('bad–2027-01-07')
  })
})

describe('schedule assessment grouping and completion', () => {
  it('marks assessments completed only when a positive weight and grade input exist', () => {
    expect(
      isCompletedAssessment(
        assessment('done', '2026-05-08', { weight: 10, gradeInput: '95' })
      )
    ).toBe(true)
    expect(
      isCompletedAssessment(
        assessment('no-grade', '2026-05-08', { weight: 10, gradeInput: '' })
      )
    ).toBe(false)
    expect(
      isCompletedAssessment(
        assessment('no-weight', '2026-05-08', { weight: 0, gradeInput: '95' })
      )
    ).toBe(false)
  })

  it('groups valid assessment dates and sorts same-day items by creation time', () => {
    const grouped = groupAssessmentsByDate([
      assessment('late', '2026-05-08', { createdAt: 20 }),
      assessment('invalid', 'not-a-date', { createdAt: 1 }),
      assessment('early', 'May 8, 2026', { createdAt: 10 }),
      assessment('other', '2026-05-09', { createdAt: 5 }),
    ])

    expect([...grouped.keys()]).toEqual(['2026-05-08', '2026-05-09'])
    expect(grouped.get('2026-05-08')?.map((item) => item._id)).toEqual([
      'early',
      'late',
    ])
    expect(grouped.get('2026-05-09')?.map((item) => item._id)).toEqual([
      'other',
    ])
  })
})

describe('schedule upcoming filters and counts', () => {
  it('includes unfinished assessments due today through 30 days out, sorted by due date then creation time', () => {
    const upcoming = buildUpcomingAssessments(
      [
        assessment('past', '2026-05-07'),
        assessment('today-late', '2026-05-08', { createdAt: 20 }),
        assessment('today-early', '2026-05-08', { createdAt: 10 }),
        assessment('day-30', '2026-06-07'),
        assessment('day-31', '2026-06-08'),
        assessment('completed', '2026-05-09', { weight: 10, gradeInput: '88' }),
        assessment('invalid', 'not-a-date'),
      ],
      '2026-05-08'
    )

    expect(upcoming.map((item) => item._id)).toEqual([
      'today-early',
      'today-late',
      'day-30',
    ])
  })

  it('counts due items between dates inclusively for the week summary', () => {
    const upcoming = [
      assessment('today', '2026-05-08'),
      assessment('week-end', '2026-05-15'),
      assessment('after-week', '2026-05-16'),
    ]

    expect(countDueBetween(upcoming, '2026-05-08', '2026-05-15')).toBe(2)
  })

  it('counts current-month items after normalizing parseable dates and ignoring invalid dates', () => {
    expect(
      countAssessmentsInMonth(
        [
          assessment('one', '2026-05-01'),
          assessment('two', 'May 31, 2026'),
          assessment('other-month', '2026-06-01'),
          assessment('invalid', 'bad'),
        ],
        new Date(2026, 4, 1)
      )
    ).toBe(2)
  })
})

describe('schedule calendar grid', () => {
  it('builds a padded month grid starting on Sunday', () => {
    const grid = buildCalendarGrid(new Date(2026, 4, 1))

    expect(grid).toHaveLength(42)
    expect(grid.slice(0, 5)).toEqual([
      { iso: null, day: null },
      { iso: null, day: null },
      { iso: null, day: null },
      { iso: null, day: null },
      { iso: null, day: null },
    ])
    expect(grid[5]).toEqual({ iso: '2026-05-01', day: 1 })
    expect(grid[35]).toEqual({ iso: '2026-05-31', day: 31 })
    expect(grid[41]).toEqual({ iso: null, day: null })
  })

  it('builds a 28-cell grid for February 2026 when the month fits exactly four weeks', () => {
    const grid = buildCalendarGrid(new Date(2026, 1, 1))

    expect(grid).toHaveLength(28)
    expect(grid[0]).toEqual({ iso: '2026-02-01', day: 1 })
    expect(grid[27]).toEqual({ iso: '2026-02-28', day: 28 })
  })
})
