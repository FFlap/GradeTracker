import { createFileRoute } from '@tanstack/react-router'
import { GPACalculator } from '@/components/calculator/GPACalculator'

export const Route = createFileRoute('/gpa-calculator')({
  component: GPACalculatorPage,
})

function GPACalculatorPage() {
  return (
    <div className="app-page">
      <section className="app-page-header">
        <div className="app-page-header-inner">
          <div className="app-page-title-row">
            <div>
              <h1 className="app-page-title">GPA Calculator</h1>
              <p className="app-page-subtitle">
                Calculate cumulative GPA from course grades and credit hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="app-page-body">
        <div className="app-page-body-narrow">
        <GPACalculator />
        </div>
      </main>
    </div>
  )
}
