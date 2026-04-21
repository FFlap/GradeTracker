import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GradeCalculator } from '@/components/calculator/GradeCalculator'
import { FinalGradeCalculator } from '@/components/calculator/FinalGradeCalculator'
import type { Course, LetterGradeThreshold } from '@/components/calculator/types'

export const Route = createFileRoute('/grade-calculator/')({
  component: GradeCalculatorPage,
})

function GradeCalculatorPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [selectedCourseId, setSelectedCourseId] = useState<Course['_id'] | null>(null)

  const coursesData = useQuery(api.courses.list)
  const courses = (coursesData ?? []) as Course[]
  const addCourse = useMutation(api.courses.add)
  const updateCourseName = useMutation(api.courses.updateName)
  const updateLetterGradeThresholds = useMutation(api.courses.updateLetterGradeThresholds)
  const removeCourse = useMutation(api.courses.remove)

  const handleCreateCourse = async (name: string) => {
    const courseId = await addCourse({ name })
    setSelectedCourseId(courseId)
  }

  const handleRenameCourse = async (courseId: Course['_id'], name: string) => {
    await updateCourseName({ id: courseId, name })
  }

  const handleUpdateThresholds = async (
    courseId: Course['_id'],
    thresholds: LetterGradeThreshold[]
  ) => {
    await updateLetterGradeThresholds({ id: courseId, thresholds })
  }

  const handleDeleteCourse = async (courseId: Course['_id']) => {
    await removeCourse({ id: courseId })
    setSelectedCourseId((prev) => (prev === courseId ? null : prev))
  }

  return (
    <Tabs defaultValue="grade" className="app-page">
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

          <TabsList variant="line" className="mt-8">
            <TabsTrigger value="grade">Grades</TabsTrigger>
            <TabsTrigger value="final">Final exam</TabsTrigger>
          </TabsList>
        </div>
      </section>

      <main className="app-page-body">
        <div className="app-page-body-narrow">
          <TabsContent value="grade">
            <GradeCalculator
              isSignedIn={Boolean(isLoaded && isSignedIn)}
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
              onCreateCourse={handleCreateCourse}
              onRenameCourse={handleRenameCourse}
              onDeleteCourse={handleDeleteCourse}
              onUpdateLetterGradeThresholds={handleUpdateThresholds}
            />
          </TabsContent>

          <TabsContent value="final">
            <FinalGradeCalculator />
          </TabsContent>
        </div>
      </main>
    </Tabs>
  )
}
