import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GPA_SCALE,
  calculateGPAResult,
  createValidatedGPAScale,
  sortGpaCoursesByGrade,
  type CourseEntry,
  type GPAScaleDraftEntry,
} from './GPACalculator'

function course(grade: string, credits = ''): CourseEntry {
  return {
    id: `${grade}-${credits}`,
    name: '',
    grade,
    credits,
  }
}

describe('GPA calculator math', () => {
  it('returns null when no courses or valid grade rows exist', () => {
    expect(calculateGPAResult([], DEFAULT_GPA_SCALE)).toBeNull()
    expect(
      calculateGPAResult(
        [course('', ''), course('A', '0'), course('Not a grade', '3')],
        DEFAULT_GPA_SCALE
      )
    ).toBeNull()
  })

  it('calculates GPA from letter grades and credit hours', () => {
    expect(
      calculateGPAResult(
        [course('A', '3'), course('B', '4'), course('C', '2')],
        DEFAULT_GPA_SCALE
      )
    ).toEqual({
      gpa: 3.111111111111111,
      totalCredits: 9,
      totalPoints: 28,
    })
  })

  it('defaults blank credits to 3 like the placeholder', () => {
    expect(calculateGPAResult([course('A', '')], DEFAULT_GPA_SCALE)).toEqual({
      gpa: 4,
      totalCredits: 3,
      totalPoints: 12,
    })
  })

  it('mixes explicit credits and blank default credits correctly', () => {
    expect(
      calculateGPAResult([course('A', ''), course('B', '4')], DEFAULT_GPA_SCALE)
    ).toEqual({
      gpa: 3.4285714285714284,
      totalCredits: 7,
      totalPoints: 24,
    })
  })

  it('ignores rows with invalid credits or missing grades while using valid rows', () => {
    expect(
      calculateGPAResult(
        [course('A', '-3'), course('B', 'abc'), course('', '3'), course('C', '3')],
        DEFAULT_GPA_SCALE
      )
    ).toEqual({
      gpa: 2,
      totalCredits: 3,
      totalPoints: 6,
    })
  })

  it('supports decimal credit hours', () => {
    expect(
      calculateGPAResult([course('A-', '1.5'), course('B+', '2.5')], DEFAULT_GPA_SCALE)
    ).toEqual({
      gpa: 3.45,
      totalCredits: 4,
      totalPoints: 13.8,
    })
  })

  it('uses a custom GPA scale for sample calculations', () => {
    const customScale = [
      { letter: 'A', points: 5 },
      { letter: 'B', points: 4 },
      { letter: 'C', points: 3 },
    ]

    expect(calculateGPAResult([course('A', '3'), course('B', '3')], customScale)).toEqual({
      gpa: 4.5,
      totalCredits: 6,
      totalPoints: 27,
    })
  })
})

describe('GPA scale validation', () => {
  it('converts draft scale rows into numeric scale rows', () => {
    const draft: GPAScaleDraftEntry[] = [
      { letter: 'A', points: '4.3' },
      { letter: 'B', points: '3.1' },
    ]

    expect(createValidatedGPAScale(draft)).toEqual([
      { letter: 'A', points: 4.3 },
      { letter: 'B', points: 3.1 },
    ])
  })

  it('clamps custom scale points between 0 and 5 and turns invalid input into 0', () => {
    const draft: GPAScaleDraftEntry[] = [
      { letter: 'A', points: '7' },
      { letter: 'B', points: '-2' },
      { letter: 'C', points: 'abc' },
    ]

    expect(createValidatedGPAScale(draft)).toEqual([
      { letter: 'A', points: 5 },
      { letter: 'B', points: 0 },
      { letter: 'C', points: 0 },
    ])
  })
})

describe('GPA course grade sorting', () => {
  const courses: CourseEntry[] = [
    { id: 'empty', name: 'Empty', grade: '', credits: '3' },
    { id: 'b', name: 'B course', grade: 'B', credits: '3' },
    { id: 'a', name: 'A course', grade: 'A', credits: '3' },
    { id: 'a-plus', name: 'A+ course', grade: 'A+', credits: '3' },
    { id: 'f', name: 'F course', grade: 'F', credits: '3' },
  ]

  it('sorts by GPA points and uses the displayed letter for equal points', () => {
    expect(
      sortGpaCoursesByGrade(courses, 'asc', DEFAULT_GPA_SCALE).map(
        (entry) => entry.id
      )
    ).toEqual(['f', 'b', 'a', 'a-plus', 'empty'])
  })

  it('sorts descending while keeping empty grades last', () => {
    expect(
      sortGpaCoursesByGrade(courses, 'desc', DEFAULT_GPA_SCALE).map(
        (entry) => entry.id
      )
    ).toEqual(['a-plus', 'a', 'b', 'f', 'empty'])
  })

  it('does not mutate the source course order', () => {
    const sourceIds = courses.map((entry) => entry.id)

    sortGpaCoursesByGrade(courses, 'asc', DEFAULT_GPA_SCALE)

    expect(courses.map((entry) => entry.id)).toEqual(sourceIds)
  })

  it('uses the active GPA scale instead of the default scale', () => {
    const customScale = [
      { letter: 'A', points: 1 },
      { letter: 'B', points: 5 },
    ]
    const customCourses: CourseEntry[] = [
      { id: 'a', name: 'A course', grade: 'A', credits: '3' },
      { id: 'b', name: 'B course', grade: 'B', credits: '3' },
    ]

    expect(
      sortGpaCoursesByGrade(customCourses, 'asc', customScale).map(
        (entry) => entry.id
      )
    ).toEqual(['a', 'b'])
  })
})
