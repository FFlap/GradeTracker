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
            <GradeCalculatorSkeleton />
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

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-sm bg-muted/70 ${className}`} />
}

function GradeCalculatorSkeleton() {
  return (
    <div className="grid items-start gap-4 sm:gap-7 xl:grid-cols-[22.5rem_minmax(0,1fr)] xl:gap-8">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(7,23,51,0.06)] sm:rounded-2xl sm:p-6">
        <SkeletonBlock className="h-8 w-48" />
        <div className="mt-6 space-y-5">
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-28 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_8px_24px_rgba(7,23,51,0.06)] sm:rounded-2xl">
        <div className="border-b border-border/70 px-4 py-4 sm:px-6 sm:py-5">
          <SkeletonBlock className="h-8 w-56" />
        </div>
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <SkeletonBlock className="h-5 w-full max-w-lg" />
        </div>
        <div className="border-y border-border/70 px-4 py-3 sm:px-6">
          <div className="grid grid-cols-[1fr_0.7fr_0.55fr_0.65fr] gap-4">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-4 py-3.5 sm:px-6">
              <div className="grid grid-cols-[1fr_0.7fr_0.55fr_0.65fr] gap-4">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
