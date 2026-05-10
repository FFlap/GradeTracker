import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Course, LetterGradeThreshold } from '@/components/calculator/types'

export function useCourseMutations() {
  const addCourse = useMutation(api.courses.add)
  const updateCourseName = useMutation(api.courses.updateName)
  const updateLetterGradeThresholds = useMutation(api.courses.updateLetterGradeThresholds)
  const removeCourse = useMutation(api.courses.remove)

  return {
    addCourse,
    updateCourseName: (id: Course['_id'], name: string) =>
      updateCourseName({ id, name }),
    updateLetterGradeThresholds: (
      id: Course['_id'],
      thresholds: LetterGradeThreshold[]
    ) => updateLetterGradeThresholds({ id, thresholds }),
    removeCourse: (id: Course['_id']) => removeCourse({ id }),
  }
}
