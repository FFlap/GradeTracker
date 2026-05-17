import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { GradeCalculator } from '@/components/calculator/GradeCalculator'
import type { Course, LetterGradeThreshold } from '@/components/calculator/types'
import { useCourseMutations } from '@/hooks/useCourseMutations'

export const Route = createFileRoute('/grade-calculator/')({
  validateSearch: (search: Record<string, unknown>) => ({
    courseId: typeof search.courseId === 'string' ? search.courseId : undefined,
  }),
  component: GradeCalculatorPage,
})

function GradeCalculatorPage() {
  const { isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()
  const { courseId } = Route.useSearch()

  const coursesData = useQuery(api.courses.list)
  const courses = (coursesData ?? []) as Course[]
  const selectedCourseId =
    courseId && (coursesData === undefined || courses.some((course) => course._id === courseId))
      ? (courseId as Course['_id'])
      : null

  const {
    addCourse,
    updateCourseName,
    updateLetterGradeThresholds,
    removeCourse,
  } = useCourseMutations()

  const handleCreateCourse = async (name: string) => {
    const newCourseId = await addCourse({ name })
    navigate({ to: '/grade-calculator', search: { courseId: newCourseId } })
  }

  const handleRenameCourse = async (courseId: Course['_id'], name: string) => {
    await updateCourseName(courseId, name)
  }

  const handleUpdateThresholds = async (
    courseId: Course['_id'],
    thresholds: LetterGradeThreshold[]
  ) => {
    await updateLetterGradeThresholds(courseId, thresholds)
  }

  const handleDeleteCourse = async (courseId: Course['_id']) => {
    await removeCourse(courseId)
    if (selectedCourseId === courseId) {
      navigate({ to: '/grade-calculator', search: { courseId: undefined } })
    }
  }

  return (
    <div className="app-page">
      <section className="app-page-header">
        <div className="app-page-header-inner">
          <div className="app-page-title-row">
            <div>
              <h1 className="app-page-title">Grade Monitoring</h1>
              <p className="app-page-subtitle">
                Track weighted course performance, saved assessments, and final exam targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="app-page-body">
        <div className="app-page-body-narrow">
          <GradeCalculator
            isSignedIn={Boolean(isLoaded && isSignedIn)}
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={(id) => {
              navigate({
                to: '/grade-calculator',
                search: { courseId: id ?? undefined },
              })
            }}
            onCreateCourse={handleCreateCourse}
            onRenameCourse={handleRenameCourse}
            onDeleteCourse={handleDeleteCourse}
            onUpdateLetterGradeThresholds={handleUpdateThresholds}
          />
        </div>
      </main>
    </div>
  )
}
