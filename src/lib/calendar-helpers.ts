export type ScheduleAssessment = {
  _id: unknown
  dueDate: string
  courseName: string
  assignmentName?: string
  gradeInput?: string
  weight?: number
  createdAt?: number
}

export type CalendarMonthCursor = {
  year: number
  month: number
}

function getMonthParts(monthCursor: Date | CalendarMonthCursor) {
  return monthCursor instanceof Date
    ? { year: monthCursor.getFullYear(), month: monthCursor.getMonth() }
    : monthCursor
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const shortMonthDayFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function isSameISODate(a: string, b: string) {
  return a === b
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map((v) => Number(v))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null
  const dt = new Date(y, m - 1, d)
  if (Number.isNaN(dt.getTime())) return null
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
    return null
  return dt
}

export function normalizeToISODate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const strict = parseISODate(trimmed)
  if (strict) return toISODate(strict)

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return toISODate(
    new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  )
}

export function formatMonthLabel(monthCursor: Date | CalendarMonthCursor) {
  const { year, month } = getMonthParts(monthCursor)
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatDayLabel(iso: string) {
  const dt = parseISODate(iso)
  if (!dt) return iso
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRangeLabel(startISO: string, endISO: string) {
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  if (!start || !end) return `${startISO}–${endISO}`

  const sameYear = start.getFullYear() === end.getFullYear()
  const startLabel = sameYear
    ? shortMonthDayFormatter.format(start)
    : shortDateFormatter.format(start)
  return `${startLabel} – ${shortDateFormatter.format(end)}`
}

export function getDatePlusDaysISO(
  startISO: string,
  days: number,
  fallback = new Date()
) {
  const start = parseISODate(startISO) ?? fallback
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  end.setDate(end.getDate() + days)
  return toISODate(end)
}

export function isCompletedAssessment(a: ScheduleAssessment) {
  const weight = typeof a.weight === 'number' ? a.weight : 0
  const hasGrade = (a.gradeInput ?? '').trim().length > 0
  return weight > 0 && hasGrade
}

export function groupAssessmentsByDate<T extends ScheduleAssessment>(items: T[]) {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = normalizeToISODate(item.dueDate)
    if (!key) continue
    const normalized = { ...item, dueDate: key }
    const list = map.get(key)
    if (list) list.push(normalized)
    else map.set(key, [normalized])
  }
  for (const [key, list] of map) {
    list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
    map.set(key, list)
  }
  return map
}

export function buildUpcomingAssessments<T extends ScheduleAssessment>(
  items: T[],
  todayISO: string,
  upcomingEndISO = getDatePlusDaysISO(todayISO, 30)
) {
  const upcoming: T[] = []
  for (const item of items) {
    const iso = normalizeToISODate(item.dueDate)
    if (!iso) continue

    const normalized = { ...item, dueDate: iso }
    if (normalized.dueDate < todayISO) continue
    if (normalized.dueDate > upcomingEndISO) continue
    if (isCompletedAssessment(normalized)) continue

    upcoming.push(normalized)
  }

  return upcoming.sort((a, b) => {
    const byDue = String(a.dueDate).localeCompare(String(b.dueDate))
    if (byDue !== 0) return byDue
    return (a.createdAt ?? 0) - (b.createdAt ?? 0)
  })
}

export function countDueBetween<T extends ScheduleAssessment>(
  items: T[],
  startISO: string,
  endISO: string
) {
  return items.filter((item) => item.dueDate >= startISO && item.dueDate <= endISO)
    .length
}

export function countAssessmentsInMonth<T extends ScheduleAssessment>(
  items: T[],
  monthCursor: Date | CalendarMonthCursor
) {
  const { year, month } = getMonthParts(monthCursor)
  const monthPrefix = `${year}-${pad2(month + 1)}`
  return items.reduce((count, item) => {
    const iso = normalizeToISODate(item.dueDate)
    return iso?.startsWith(monthPrefix) ? count + 1 : count
  }, 0)
}

export function buildCalendarGrid(monthCursor: Date | CalendarMonthCursor) {
  const { year, month } = getMonthParts(monthCursor)

  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ key: string; iso: string | null; day: number | null }> = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `leading-${year}-${month}-${i}`, iso: null, day: null })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day)
    const iso = toISODate(dt)
    cells.push({ key: iso, iso, day })
  }
  while (cells.length % 7 !== 0) {
    cells.push({
      key: `trailing-${year}-${month}-${cells.length}`,
      iso: null,
      day: null,
    })
  }
  return cells
}
