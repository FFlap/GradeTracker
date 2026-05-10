import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    return await ctx.db
      .query('semesters')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect()
  },
})

export const add = mutation({
  args: {
    name: v.string(),
    status: v.string(), // 'in_progress' | 'completed'
    makeCurrent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const allowedStatuses = new Set(['in_progress', 'completed'])
    if (!allowedStatuses.has(args.status)) {
      throw new Error('Invalid semester status')
    }

    const shouldBeCurrent =
      args.makeCurrent === true || args.status === 'in_progress'
    const status = shouldBeCurrent ? 'in_progress' : args.status

    if (shouldBeCurrent) {
      const existing = await ctx.db
        .query('semesters')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect()
      const patches = []
      for (const sem of existing) {
        if (sem.isCurrent || sem.status === 'in_progress') {
          patches.push(
            ctx.db.patch(sem._id, { isCurrent: false, status: 'completed' })
          )
        }
      }
      await Promise.all(patches)
    }

    return await ctx.db.insert('semesters', {
      userId: identity.subject,
      name: args.name,
      status,
      isCurrent: shouldBeCurrent,
      createdAt: Date.now(),
    })
  },
})

export const updateName = mutation({
  args: { id: v.id('semesters'), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const semester = await ctx.db.get(args.id)
    if (!semester || semester.userId !== identity.subject) {
      throw new Error('Semester not found')
    }
    await ctx.db.patch(args.id, { name: args.name })
  },
})

export const setCurrent = mutation({
  args: { id: v.id('semesters') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const [semester, existing] = await Promise.all([
      ctx.db.get(args.id),
      ctx.db
        .query('semesters')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect(),
    ])
    if (!semester || semester.userId !== identity.subject) {
      throw new Error('Semester not found')
    }

    const patches = []
    for (const sem of existing) {
      if (sem._id === args.id) continue
      if (sem.isCurrent || sem.status === 'in_progress') {
        patches.push(
          ctx.db.patch(sem._id, { isCurrent: false, status: 'completed' })
        )
      }
    }
    patches.push(ctx.db.patch(args.id, { isCurrent: true, status: 'in_progress' }))
    await Promise.all(patches)
  },
})

export const updateStatus = mutation({
  args: { id: v.id('semesters'), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const [semester, existing] = await Promise.all([
      ctx.db.get(args.id),
      ctx.db
        .query('semesters')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect(),
    ])
    if (!semester || semester.userId !== identity.subject) {
      throw new Error('Semester not found')
    }

    const allowedStatuses = new Set(['in_progress', 'completed'])
    if (!allowedStatuses.has(args.status)) {
      throw new Error('Invalid semester status')
    }

    if (args.status === 'in_progress') {
      const patches = []
      for (const sem of existing) {
        if (sem._id === args.id) continue
        if (sem.isCurrent || sem.status === 'in_progress') {
          patches.push(
            ctx.db.patch(sem._id, { isCurrent: false, status: 'completed' })
          )
        }
      }
      patches.push(ctx.db.patch(args.id, { status: 'in_progress', isCurrent: true }))
      await Promise.all(patches)
      return
    }

    await ctx.db.patch(args.id, { status: 'completed', isCurrent: false })
  },
})

export const remove = mutation({
  args: { id: v.id('semesters') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const [semester, courses] = await Promise.all([
      ctx.db.get(args.id),
      ctx.db
        .query('courses')
        .withIndex('by_semester', (q) => q.eq('semesterId', args.id))
        .collect(),
    ])
    if (!semester || semester.userId !== identity.subject) {
      throw new Error('Semester not found')
    }

    const courseDeletes = []
    for (const course of courses) {
      if (course.userId !== identity.subject) continue
      courseDeletes.push(
        (async () => {
          const grades = await ctx.db
            .query('grades')
            .withIndex('by_course', (q) => q.eq('courseId', course._id))
            .collect()
          const deletes = [ctx.db.delete(course._id)]
          for (const grade of grades) {
            if (grade.userId === identity.subject) {
              deletes.push(ctx.db.delete(grade._id))
            }
          }
          await Promise.all(deletes)
        })()
      )
    }
    await Promise.all(courseDeletes)

    if (semester.isCurrent) {
      const remaining = await ctx.db
        .query('semesters')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .collect()
      const next = remaining.find((s) => s._id !== args.id && s.status === 'in_progress')
      if (next) {
        await ctx.db.patch(next._id, { isCurrent: true })
      }
    }

    return await ctx.db.delete(args.id)
  },
})

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { semesters: [], courses: [], grades: [] }
    }

    const [semesters, courses, grades] = await Promise.all([
      ctx.db
        .query('semesters')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .collect(),
      ctx.db
        .query('courses')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .collect(),
      ctx.db
        .query('grades')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect(),
    ])

    return { semesters, courses, grades }
  },
})
