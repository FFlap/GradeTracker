import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const LETTER_GRADES: Record<string, number> = {
  'A+': 97,
  A: 93,
  'A-': 90,
  'B+': 87,
  B: 83,
  'B-': 80,
  'C+': 77,
  C: 73,
  'C-': 70,
  'D+': 67,
  D: 63,
  'D-': 60,
  F: 50,
}

function parseGradeValue(input: string): number {
  const trimmed = input.trim()
  if (!trimmed) return 0

  const letterValue = LETTER_GRADES[trimmed.toUpperCase()]
  if (letterValue !== undefined) {
    return letterValue
  }

  const fractionMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/)
  if (fractionMatch) {
    const earned = Number.parseFloat(fractionMatch[1]!)
    const total = Number.parseFloat(fractionMatch[2]!)
    if (!Number.isFinite(earned) || !Number.isFinite(total) || total === 0) {
      return 0
    }
    return (earned / total) * 100
  }

  if (!/^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(trimmed)) {
    return 0
  }

  const n = Number.parseFloat(trimmed.replace(/%$/, ''))
  return Number.isFinite(n) ? n : 0
}

function parseWeightValue(input: string): number {
  const n = Number.parseFloat(input.trim().replace(/%$/, ''))
  return Number.isFinite(n) ? n : 0
}

// List grades for a specific course
export const listByCourse = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    const course = await ctx.db.get(args.courseId)
    if (!course || course.userId !== identity.subject) {
      return []
    }
    return await ctx.db
      .query('grades')
      .withIndex('by_user_course', (q) =>
        q.eq('userId', identity.subject).eq('courseId', args.courseId)
      )
      .order('desc')
      .collect()
  },
})

export const upsertRow = mutation({
  args: {
    courseId: v.id('courses'),
    clientRowId: v.string(),
    assignmentName: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    gradeInput: v.optional(v.string()),
    grade: v.optional(v.number()),
    weightInput: v.optional(v.string()),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const course = await ctx.db.get(args.courseId)
    if (!course || course.userId !== identity.subject) {
      throw new Error('Course not found')
    }

    const row = await ctx.db
      .query('grades')
      .withIndex('by_user_course_row', (q) =>
        q
          .eq('userId', identity.subject)
          .eq('courseId', args.courseId)
          .eq('clientRowId', args.clientRowId)
      )
      .unique()

    const nextDueDate =
      args.dueDate !== undefined ? args.dueDate.trim() : row?.dueDate

    const nextAssignmentName =
      args.assignmentName ?? (row ? row.assignmentName : undefined)
    const nextGradeInput = args.gradeInput ?? (row ? row.gradeInput : undefined) ?? ''
    const nextWeightInput = args.weightInput ?? (row ? row.weightInput : undefined) ?? ''

    const grade = args.grade ?? parseGradeValue(nextGradeInput)
    const weight = args.weight ?? parseWeightValue(nextWeightInput)

    if (row) {
      await ctx.db.patch(row._id, {
        assignmentName: nextAssignmentName,
        dueDate: nextDueDate,
        gradeInput: nextGradeInput,
        grade,
        weightInput: nextWeightInput,
        weight,
      })
      return row._id
    }

    return await ctx.db.insert('grades', {
      userId: identity.subject,
      courseId: args.courseId,
      clientRowId: args.clientRowId,
      assignmentName: nextAssignmentName,
      dueDate: nextDueDate,
      gradeInput: nextGradeInput,
      grade,
      weightInput: nextWeightInput,
      weight,
      createdAt: Date.now(),
    })
  },
})

export const listDated = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const courses = await ctx.db
      .query('courses')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect()
    const courseNameById = new Map(courses.map((c) => [String(c._id), c.name]))

    const grades = await ctx.db
      .query('grades')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect()

    const dated = grades
      .filter((g) => {
        const due = (g as any).dueDate as string | undefined
        return (
          g.courseId !== undefined &&
          typeof due === 'string' &&
          due.trim().length > 0
        )
      })
      .map((g) => ({
        ...g,
        dueDate: (g as any).dueDate as string,
        courseName: courseNameById.get(String(g.courseId)) ?? 'Course',
      }))
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        return (a.createdAt ?? 0) - (b.createdAt ?? 0)
      })

    return dated
  },
})

export const removeRow = mutation({
  args: { courseId: v.id('courses'), clientRowId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const course = await ctx.db.get(args.courseId)
    if (!course || course.userId !== identity.subject) {
      throw new Error('Course not found')
    }

    const row = await ctx.db
      .query('grades')
      .withIndex('by_user_course_row', (q) =>
        q
          .eq('userId', identity.subject)
          .eq('courseId', args.courseId)
          .eq('clientRowId', args.clientRowId)
      )
      .unique()

    if (!row) return false
    await ctx.db.delete(row._id)
    return true
  },
})

// Remove all grades for a specific course
export const removeByCourse = mutation({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const course = await ctx.db.get(args.courseId)
    if (!course || course.userId !== identity.subject) {
      throw new Error('Course not found')
    }
    const grades = await ctx.db
      .query('grades')
      .withIndex('by_user_course', (q) =>
        q.eq('userId', identity.subject).eq('courseId', args.courseId)
      )
      .collect()

    for (const grade of grades) {
      await ctx.db.delete(grade._id)
    }
  },
})
