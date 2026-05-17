import { createFileRoute } from '@tanstack/react-router'
import { GradeMonitoringPage } from '@/components/calculator/GradeMonitoringPage'

export const Route = createFileRoute('/grade-calculator/')({
  validateSearch: (search: Record<string, unknown>) => ({
    courseId: typeof search.courseId === 'string' ? search.courseId : undefined,
  }),
  component: GradeCalculatorPage,
})

function GradeCalculatorPage() {
  const { courseId } = Route.useSearch()
  return <GradeMonitoringPage courseId={courseId} />
}
