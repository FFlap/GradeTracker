import { Card, CardContent } from '@/components/ui/card'
import type { CalculationResult } from './types'

interface ResultDisplayProps {
  result: CalculationResult | null
  targetGrade: number
  invalidMessage?: string | null
}

export function ResultDisplay({
  result,
  targetGrade,
  invalidMessage,
}: ResultDisplayProps) {
  if (!result) {
    return (
      <div
        className={
          invalidMessage
            ? 'rounded-lg border border-destructive/25 bg-destructive/5 px-5 py-4 text-destructive'
            : 'rounded-lg border border-border bg-card px-5 py-4 text-muted-foreground'
        }
      >
        <div className="text-center">
          {invalidMessage ??
            'Enter grades and weights above, then click Calculate to see your results.'}
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => num.toFixed(2)

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-primary'
    if (grade >= 80) return 'text-foreground'
    if (grade >= 70) return 'text-muted-foreground'
    if (grade >= 60) return 'text-muted-foreground'
    return 'text-destructive'
  }

  return (
    <Card className="bg-card border-border overflow-hidden py-0 gap-0 rounded-lg">
      <CardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Average
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`text-4xl font-semibold ${getGradeColor(
                  result.averageOnCompletedWork
                )}`}
              >
                {formatNumber(result.averageOnCompletedWork)}%
              </span>
              <span
                className={`text-xl font-medium ${getGradeColor(
                  result.averageOnCompletedWork
                )}`}
              >
                {result.averageOnCompletedWorkLetter}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Completed work only
            </div>
          </div>

          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Overall
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`text-3xl font-semibold ${getGradeColor(
                  result.overallCoursePercentSoFar
                )}`}
              >
                {formatNumber(result.overallCoursePercentSoFar)}%
              </span>
              <span
                className={`text-lg font-medium ${getGradeColor(
                  result.overallCoursePercentSoFar
                )}`}
              >
                {result.overallCoursePercentSoFarLetter}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Ungraded work treated as zero
            </div>
          </div>

          <div className="p-6">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Remaining
            </div>
            <div className="mt-2 text-3xl font-semibold text-foreground">
              {formatNumber(result.remainingWeight)}%
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Weight still available
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/15 px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Total weight calculated:{' '}
              <span className="font-medium text-foreground">{formatNumber(result.totalWeight)}%</span>
            </div>

            {result.neededGrade !== null && (
              <div className="text-right text-sm">
                <div className="text-muted-foreground">To reach {targetGrade}% overall</div>
                {result.neededGrade > 100 ? (
                  <div className="font-medium text-destructive">
                    Need {formatNumber(result.neededGrade)}% on the remaining weight
                  </div>
                ) : result.neededGrade < 0 ? (
                  <div className="font-medium text-primary">
                    You have already exceeded the target
                  </div>
                ) : (
                  <div className="font-medium text-foreground">
                    Need <span className="text-primary">{formatNumber(result.neededGrade)}%</span> on the remaining {formatNumber(result.remainingWeight)}%
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
