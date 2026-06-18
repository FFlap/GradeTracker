import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LETTER_TO_GPA,
  buildCourseRowsForCalc,
  calculateCoursePercent,
  calculateCumulativeSemesterStats,
  calculateTermGpa,
  getCourseCredits,
  getCourseGradeSortValue,
  getCourseLetter,
  getCurrentSemester,
  groupCoursesBySemesterId,
  groupGradesByCourseId,
  sortSemesterCourses,
  sortSemestersForDisplay,
  updateSemesterCourseSorts,
} from './semester-helpers'
import type { Course, Grade, Semester } from '@/components/calculator/types'

function course(
  id: string,
  overrides: Partial<Course> = {}
): Course {
  return {
    _id: id as Course['_id'],
    userId: 'user',
    name: id,
    createdAt: 0,
    ...overrides,
  }
}

function grade(
  id: string,
  courseId: string | undefined,
  gradeInput: string,
  weightInput: string,
  overrides: Partial<Grade> = {}
): Grade {
  return {
    _id: id as Grade['_id'],
    userId: 'user',
    courseId: courseId as Grade['courseId'],
    gradeInput,
    weightInput,
    grade: Number.parseFloat(gradeInput) || 0,
    weight: Number.parseFloat(weightInput) || 0,
    createdAt: 0,
    ...overrides,
  }
}

function semester(
  id: string,
  overrides: Partial<Semester> = {}
): Semester {
  return {
    _id: id as Semester['_id'],
    userId: 'user',
    name: id,
    status: 'in_progress',
    isCurrent: false,
    createdAt: 0,
    ...overrides,
  }
}

describe('semester grouping and sorting', () => {
  it('groups grades by course id and skips grades without a course id', () => {
    const grouped = groupGradesByCourseId([
      grade('g1', 'c1', '90', '50'),
      grade('orphan', undefined, '80', '50'),
      grade('g2', 'c1', '100', '50'),
      grade('g3', 'c2', '75', '100'),
    ])

    expect([...grouped.keys()]).toEqual(['c1', 'c2'])
    expect(grouped.get('c1')?.map((item) => item._id)).toEqual(['g1', 'g2'])
    expect(grouped.get('c2')?.map((item) => item._id)).toEqual(['g3'])
  })

  it('groups courses by semester id, places missing semester courses into unassigned, and sorts newest first', () => {
    const grouped = groupCoursesBySemesterId([
      course('older', { semesterId: 'fall' as Course['semesterId'], createdAt: 1 }),
      course('newer', { semesterId: 'fall' as Course['semesterId'], createdAt: 10 }),
      course('loose', { createdAt: 5 }),
    ])

    expect(grouped.get('fall')?.map((item) => item._id)).toEqual(['newer', 'older'])
    expect(grouped.get('unassigned')?.map((item) => item._id)).toEqual(['loose'])
  })

  it('sorts current semester first, then remaining semesters newest first', () => {
    const sorted = sortSemestersForDisplay([
      semester('old', { createdAt: 1 }),
      semester('current', { isCurrent: true, createdAt: 2 }),
      semester('new', { createdAt: 10 }),
    ])

    expect(sorted.map((item) => item._id)).toEqual(['current', 'new', 'old'])
  })

  it('returns the current semester or null when none is marked current', () => {
    expect(
      getCurrentSemester([
        semester('old'),
        semester('current', { isCurrent: true }),
      ])?._id
    ).toBe('current')
    expect(getCurrentSemester([semester('old')])).toBeNull()
  })
})

describe('semester course calculations', () => {
  it('defaults missing, zero, negative, or invalid credits to 3', () => {
    expect(getCourseCredits(course('missing'))).toBe(3)
    expect(getCourseCredits(course('valid', { credits: 4 }))).toBe(4)
    expect(getCourseCredits(course('zero', { credits: 0 }))).toBe(3)
    expect(getCourseCredits(course('negative', { credits: -1 }))).toBe(3)
    expect(getCourseCredits(course('nan', { credits: Number.NaN }))).toBe(3)
  })

  it('builds grade calculator rows from saved grades', () => {
    expect(
      buildCourseRowsForCalc([
        grade('g1', 'c1', '18/20', '50', {
          clientRowId: 'client-1',
          assignmentName: 'Quiz',
          dueDate: '2026-05-09',
        }),
      ])
    ).toEqual([
      {
        id: 'client-1',
        assignment: 'Quiz',
        date: '2026-05-09',
        grade: '18/20',
        weight: '50',
      },
    ])
  })

  it('calculates a course percent from weighted grade rows', () => {
    const grades = groupGradesByCourseId([
      grade('g1', 'c1', '90', '40'),
      grade('g2', 'c1', '80', '60'),
    ])

    expect(calculateCoursePercent(course('c1'), grades)).toBe(84)
    expect(calculateCoursePercent(course('no-grades'), grades)).toBeNull()
  })

  it('returns the calculated percentage for sorting graded courses', () => {
    const grades = groupGradesByCourseId([
      grade('g1', 'c1', '90', '40'),
      grade('g2', 'c1', '80', '60'),
    ])

    expect(getCourseGradeSortValue(course('c1'), grades)).toBe(84)
  })

  it('returns null for sorting courses without a calculable grade', () => {
    expect(
      getCourseGradeSortValue(course('ungraded'), groupGradesByCourseId([]))
    ).toBeNull()
  })

  it('uses custom course letter thresholds when present', () => {
    const custom = course('custom', {
      letterGradeThresholds: [
        { min: 80, letter: 'Pass' },
        { min: 0, letter: 'No Pass' },
      ],
    })

    expect(getCourseLetter(custom, 85)).toBe('Pass')
    expect(getCourseLetter(custom, 79)).toBe('No Pass')
  })
})

describe('semester course table sorting', () => {
  const courses = [
    course('biology', { name: 'Biology', credits: 4 }),
    course('algebra', { name: 'Algebra', credits: 3 }),
    course('chemistry', { name: 'chemistry', credits: 2 }),
    course('ungraded', { name: 'Art', credits: 1 }),
  ]
  const gradesByCourseId = groupGradesByCourseId([
    grade('biology-grade', 'biology', '80', '100'),
    grade('algebra-grade', 'algebra', '95', '100'),
    grade('chemistry-grade', 'chemistry', '70', '100'),
  ])

  const ids = (items: Course[]) => items.map((item) => item._id)

  it('returns courses in source order when unsorted', () => {
    expect(ids(sortSemesterCourses(courses, gradesByCourseId, null))).toEqual([
      'biology',
      'algebra',
      'chemistry',
      'ungraded',
    ])
  })

  it('sorts course names alphabetically in both directions', () => {
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'course',
          direction: 'asc',
        })
      )
    ).toEqual(['algebra', 'ungraded', 'biology', 'chemistry'])
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'course',
          direction: 'desc',
        })
      )
    ).toEqual(['chemistry', 'biology', 'ungraded', 'algebra'])
  })

  it('sorts credits numerically in both directions', () => {
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'credits',
          direction: 'asc',
        })
      )
    ).toEqual(['ungraded', 'chemistry', 'algebra', 'biology'])
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'credits',
          direction: 'desc',
        })
      )
    ).toEqual(['biology', 'algebra', 'chemistry', 'ungraded'])
  })

  it('sorts grade percentages in both directions with ungraded courses last', () => {
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'grade',
          direction: 'asc',
        })
      )
    ).toEqual(['chemistry', 'biology', 'algebra', 'ungraded'])
    expect(
      ids(
        sortSemesterCourses(courses, gradesByCourseId, {
          column: 'grade',
          direction: 'desc',
        })
      )
    ).toEqual(['algebra', 'biology', 'chemistry', 'ungraded'])
  })

  it('does not mutate the source and restores source order when sorting clears', () => {
    const sourceOrder = ids(courses)
    const sorted = sortSemesterCourses(courses, gradesByCourseId, {
      column: 'course',
      direction: 'asc',
    })

    expect(sorted).not.toBe(courses)
    expect(ids(courses)).toEqual(sourceOrder)
    expect(ids(sortSemesterCourses(courses, gradesByCourseId, null))).toEqual(
      sourceOrder
    )
  })

  it('produces independent results for separate table sort states', () => {
    const courseSorted = sortSemesterCourses(courses, gradesByCourseId, {
      column: 'course',
      direction: 'asc',
    })
    const gradeSorted = sortSemesterCourses(courses, gradesByCourseId, {
      column: 'grade',
      direction: 'desc',
    })

    expect(ids(courseSorted)).toEqual([
      'algebra',
      'ungraded',
      'biology',
      'chemistry',
    ])
    expect(ids(gradeSorted)).toEqual([
      'algebra',
      'biology',
      'chemistry',
      'ungraded',
    ])
  })

  it('persists keyed sort state through the three-state cycle', () => {
    const ascending = updateSemesterCourseSorts({}, 'fall', 'course')
    const descending = updateSemesterCourseSorts(
      ascending,
      'fall',
      'course'
    )
    const cleared = updateSemesterCourseSorts(descending, 'fall', 'course')

    expect(ascending.fall).toEqual({
      column: 'course',
      direction: 'asc',
    })
    expect(descending.fall).toEqual({
      column: 'course',
      direction: 'desc',
    })
    expect(cleared.fall).toBeUndefined()
  })

  it('updates one semester sort without changing another', () => {
    const initial = {
      fall: { column: 'course', direction: 'asc' } as const,
      winter: { column: 'grade', direction: 'desc' } as const,
    }
    const updated = updateSemesterCourseSorts(initial, 'fall', 'course')

    expect(updated.fall).toEqual({
      column: 'course',
      direction: 'desc',
    })
    expect(updated.winter).toEqual(initial.winter)
    expect(initial.fall.direction).toBe('asc')
  })
})

describe('semester GPA summaries', () => {
  it('returns null term GPA when a semester has no courses or no graded courses', () => {
    const coursesBySemesterId = groupCoursesBySemesterId([
      course('empty-grade', { semesterId: 'fall' as Course['semesterId'] }),
    ])
    const gradesByCourseId = groupGradesByCourseId([])

    expect(calculateTermGpa('missing', coursesBySemesterId, gradesByCourseId)).toBeNull()
    expect(calculateTermGpa('fall', coursesBySemesterId, gradesByCourseId)).toBeNull()
  })

  it('calculates weighted term GPA by course credits', () => {
    const coursesBySemesterId = groupCoursesBySemesterId([
      course('algorithms', { semesterId: 'fall' as Course['semesterId'], credits: 3 }),
      course('systems', { semesterId: 'fall' as Course['semesterId'], credits: 4 }),
    ])
    const gradesByCourseId = groupGradesByCourseId([
      grade('g1', 'algorithms', '93', '100'),
      grade('g2', 'systems', '83', '100'),
    ])

    expect(calculateTermGpa('fall', coursesBySemesterId, gradesByCourseId)).toBeCloseTo(
      3.4285714286
    )
  })

  it('skips courses whose custom letter scale does not map to GPA points', () => {
    const coursesBySemesterId = groupCoursesBySemesterId([
      course('pass-fail', {
        semesterId: 'fall' as Course['semesterId'],
        credits: 3,
        letterGradeThresholds: [
          { min: 80, letter: 'Pass' },
          { min: 0, letter: 'Fail' },
        ],
      }),
      course('normal', { semesterId: 'fall' as Course['semesterId'], credits: 3 }),
    ])
    const gradesByCourseId = groupGradesByCourseId([
      grade('g1', 'pass-fail', '90', '100'),
      grade('g2', 'normal', '93', '100'),
    ])

    expect(calculateTermGpa('fall', coursesBySemesterId, gradesByCourseId)).toBe(4)
  })

  it('calculates cumulative GPA, total credits, and completed semesters', () => {
    const courses = [
      course('a', { semesterId: 'fall' as Course['semesterId'], credits: 3 }),
      course('b', { semesterId: 'winter' as Course['semesterId'], credits: 4 }),
      course('ungraded', { semesterId: 'winter' as Course['semesterId'], credits: 2 }),
    ]
    const semesters = [
      semester('fall', { status: 'completed' }),
      semester('winter', { status: 'in_progress' }),
    ]
    const gradesByCourseId = groupGradesByCourseId([
      grade('g1', 'a', '93', '100'),
      grade('g2', 'b', '83', '100'),
    ])

    expect(calculateCumulativeSemesterStats(courses, semesters, gradesByCourseId)).toEqual({
      gpa: 3.4285714285714284,
      credits: 9,
      semestersCompleted: 1,
    })
  })

  it('returns null cumulative GPA when no courses have calculable grades while still summing credits', () => {
    expect(
      calculateCumulativeSemesterStats(
        [course('a', { credits: 4 }), course('b')],
        [semester('fall', { status: 'completed' })],
        groupGradesByCourseId([])
      )
    ).toEqual({
      gpa: null,
      credits: 7,
      semestersCompleted: 1,
    })
  })

  it('allows alternate GPA mappings for custom grading systems', () => {
    const coursesBySemesterId = groupCoursesBySemesterId([
      course('a', { semesterId: 'fall' as Course['semesterId'], credits: 3 }),
      course('b', { semesterId: 'fall' as Course['semesterId'], credits: 3 }),
    ])
    const gradesByCourseId = groupGradesByCourseId([
      grade('g1', 'a', '93', '100'),
      grade('g2', 'b', '83', '100'),
    ])
    const scale = { ...DEFAULT_LETTER_TO_GPA, A: 5, B: 4 }

    expect(calculateTermGpa('fall', coursesBySemesterId, gradesByCourseId, scale)).toBe(
      4.5
    )
  })
})
