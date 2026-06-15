import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { GradeCalculator } from './GradeCalculator'
import type { Course, LetterGradeThreshold } from './types'
import { useCourseMutations } from '@/hooks/useCourseMutations'

interface GradeMonitoringPageProps {
  courseId?: string
}

export function GradeMonitoringPage({ courseId }: GradeMonitoringPageProps) {
  const { isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()
  const canSaveCourses = Boolean(isLoaded && isSignedIn)

  const coursesData = useQuery(api.courses.list, canSaveCourses ? {} : 'skip')
  const isInitialLoading = !isLoaded || (canSaveCourses && coursesData === undefined)
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

  const setSelectedCourseId = (id: Course['_id'] | null) => {
    navigate({
      to: '/grade-calculator',
      search: { courseId: id ?? undefined },
    })
  }

  const handleCreateCourse = async (name: string) => {
    const newCourseId = await addCourse({ name })
    setSelectedCourseId(newCourseId)
  }

  const handleRenameCourse = async (id: Course['_id'], name: string) => {
    await updateCourseName(id, name)
  }

  const handleUpdateThresholds = async (
    id: Course['_id'],
    thresholds: LetterGradeThreshold[]
  ) => {
    await updateLetterGradeThresholds(id, thresholds)
  }

  const handleDeleteCourse = async (id: Course['_id']) => {
    await removeCourse(id)
    if (selectedCourseId === id) {
      setSelectedCourseId(null)
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
          {isInitialLoading ? (
            null
          ) : (
            <GradeCalculator
              isSignedIn={canSaveCourses}
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
              onCreateCourse={handleCreateCourse}
              onRenameCourse={handleRenameCourse}
              onDeleteCourse={handleDeleteCourse}
              onUpdateLetterGradeThresholds={handleUpdateThresholds}
            />
          )}
        </div>
      </main>
    </div>
  )
}
