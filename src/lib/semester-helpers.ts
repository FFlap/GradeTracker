import {
  calculateWeightedAverage,
  LETTER_GRADE_THRESHOLDS,
  percentageToLetter,
  type Course,
  type Grade,
  type GradeRow,
  type LetterGradeThreshold,
  type Semester,
} from '@/components/calculator/types'

export const DEFAULT_LETTER_TO_GPA: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
}

export function groupGradesByCourseId(grades: Grade[]) {
  const map = new Map<string, Grade[]>()
  for (const grade of grades) {
    if (!grade.courseId) continue
    const key = String(grade.courseId)
    const list = map.get(key)
    if (list) list.push(grade)
    else map.set(key, [grade])
  }
  return map
}

export function sortSemestersForDisplay(semesters: Semester[]) {
  const copy = [...semesters]
  copy.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
    return (b.createdAt ?? 0) - (a.createdAt ?? 0)
  })
  return copy
}

export function getCurrentSemester(semesters: Semester[]) {
  return semesters.find((semester) => semester.isCurrent) ?? null
}

export function groupCoursesBySemesterId(courses: Course[]) {
  const map = new Map<string, Course[]>()
  for (const course of courses) {
    const key = course.semesterId ? String(course.semesterId) : 'unassigned'
    const list = map.get(key)
    if (list) list.push(course)
    else map.set(key, [course])
  }
  for (const [key, list] of map) {
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    map.set(key, list)
  }
  return map
}

export function getCourseCredits(course: Course) {
  const parsed = typeof course.credits === 'number' ? course.credits : 3
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3
}

export function buildCourseRowsForCalc(courseGrades: Grade[]): GradeRow[] {
  return courseGrades.map((grade) => ({
    id: String(grade.clientRowId ?? grade._id),
    assignment: grade.assignmentName ?? '',
    date: grade.dueDate ?? '',
    grade: grade.gradeInput ?? String(grade.grade ?? ''),
    weight: grade.weightInput ?? String(grade.weight ?? ''),
  }))
}

export function calculateCoursePercent(
  course: Course,
  gradesByCourseId: Map<string, Grade[]>
) {
  const courseGrades = gradesByCourseId.get(String(course._id)) ?? []
  const rows = buildCourseRowsForCalc(courseGrades)
  const calc = calculateWeightedAverage(rows)
  return calc?.average ?? null
}

export function getCourseLetter(
  course: Course,
  percent: number,
  fallbackThresholds: LetterGradeThreshold[] = LETTER_GRADE_THRESHOLDS
) {
  const thresholds = course.letterGradeThresholds ?? fallbackThresholds
  return percentageToLetter(percent, thresholds)
}

export function calculateTermGpa(
  semesterId: string,
  coursesBySemesterId: Map<string, Course[]>,
  gradesByCourseId: Map<string, Grade[]>,
  letterToGpa: Record<string, number> = DEFAULT_LETTER_TO_GPA
) {
  const termCourses = coursesBySemesterId.get(semesterId) ?? []
  let totalPoints = 0
  let totalCredits = 0

  for (const course of termCourses) {
    const percent = calculateCoursePercent(course, gradesByCourseId)
    if (percent === null) continue
    const letter = getCourseLetter(course, percent)
    const points = letterToGpa[letter]
    if (points === undefined) continue
    const credits = getCourseCredits(course)
    totalPoints += points * credits
    totalCredits += credits
  }

  if (totalCredits === 0) return null
  return totalPoints / totalCredits
}

export function calculateCumulativeSemesterStats(
  courses: Course[],
  semesters: Semester[],
  gradesByCourseId: Map<string, Grade[]>,
  letterToGpa: Record<string, number> = DEFAULT_LETTER_TO_GPA
) {
  let totalPoints = 0
  let totalCredits = 0
  let creditsSum = 0

  for (const course of courses) {
    const credits = getCourseCredits(course)
    creditsSum += credits
    const percent = calculateCoursePercent(course, gradesByCourseId)
    if (percent === null) continue
    const letter = getCourseLetter(course, percent)
    const points = letterToGpa[letter]
    if (points === undefined) continue
    totalPoints += points * credits
    totalCredits += credits
  }

  return {
    gpa: totalCredits > 0 ? totalPoints / totalCredits : null,
    credits: creditsSum,
    semestersCompleted: semesters.filter((semester) => semester.status === 'completed')
      .length,
  }
}
