import { createFileRoute } from '@tanstack/react-router'
import { GradeMonitoringPage } from '@/components/calculator/GradeMonitoringPage'

export const Route = createFileRoute('/')({
  component: GradeMonitoringPage,
})
