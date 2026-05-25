import { useReducer } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator, RotateCcw } from 'lucide-react'
import { sanitizeNumberInput } from './types'

interface FinalResult {
  neededGrade: number
  isPossible: boolean
}

interface FinalGradeState {
  currentGrade: string
  finalWeight: string
  targetGrade: string
  result: FinalResult | null
  invalidMessage: string | null
}

type FinalGradeAction =
  | { type: 'set-current-grade'; value: string }
  | { type: 'set-final-weight'; value: string }
  | { type: 'set-target-grade'; value: string }
  | { type: 'calculation-success'; result: FinalResult }
  | { type: 'calculation-error'; message: string }
  | { type: 'reset' }

const initialFinalGradeState: FinalGradeState = {
  currentGrade: '',
  finalWeight: '',
  targetGrade: '',
  result: null,
  invalidMessage: null,
}

function finalGradeReducer(
  state: FinalGradeState,
  action: FinalGradeAction
): FinalGradeState {
  switch (action.type) {
    case 'set-current-grade':
      return {
        ...state,
        currentGrade: action.value,
        result: null,
        invalidMessage: null,
      }
    case 'set-final-weight':
      return {
        ...state,
        finalWeight: action.value,
        result: null,
        invalidMessage: null,
      }
    case 'set-target-grade':
      return {
        ...state,
        targetGrade: action.value,
        result: null,
        invalidMessage: null,
      }
    case 'calculation-success':
      return { ...state, result: action.result, invalidMessage: null }
    case 'calculation-error':
      return { ...state, result: null, invalidMessage: action.message }
    case 'reset':
      return initialFinalGradeState
  }
}

export function FinalGradeCalculator() {
  const [state, dispatch] = useReducer(finalGradeReducer, initialFinalGradeState)
  const { currentGrade, finalWeight, targetGrade, result, invalidMessage } = state

  const handleCalculate = () => {
    const current = Number.parseFloat(currentGrade)
    const weight = parseFloat(finalWeight)
    const target = Number.parseFloat(targetGrade)

    if (!Number.isFinite(current) || isNaN(weight) || !Number.isFinite(target)) {
      dispatch({
        type: 'calculation-error',
        message: 'Enter a current grade, final exam weight, and target grade.',
      })
      return
    }

    if (weight <= 0 || weight > 100) {
      dispatch({
        type: 'calculation-error',
        message: 'Final exam weight must be greater than 0 and no more than 100.',
      })
      return
    }

    // Formula: target = current * (1 - weight/100) + needed * (weight/100)
    // needed = (target - current * (1 - weight/100)) / (weight/100)
    const currentWeight = 1 - weight / 100
    const needed = (target - current * currentWeight) / (weight / 100)

    dispatch({
      type: 'calculation-success',
      result: {
        neededGrade: needed,
        isPossible: needed <= 100 && needed >= 0,
      },
    })
  }

  const handleReset = () => {
    dispatch({ type: 'reset' })
  }

  return (
    <div className="grid items-start gap-4 lg:gap-7 xl:grid-cols-[22.5rem_minmax(0,1fr)] xl:gap-8">
      <Card className="gap-0 overflow-hidden rounded-xl border-border/70 py-0 lg:rounded-2xl">
        <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
              Final Summary
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Calculate the score needed on the final exam to reach your target.
            </p>
          </div>

          {result && (
            <div className="border-t border-border/70 pt-6">
              {result.isPossible ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] lg:rounded-xl sm:p-5">
                    <div className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-primary lg:text-[0.72rem] sm:tracking-[0.14em]">
                      Required score
                    </div>
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-5xl font-semibold leading-none text-primary lg:text-6xl">
                        {result.neededGrade.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : result.neededGrade > 100 ? (
                <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 lg:rounded-xl sm:p-5">
                  <div className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-destructive lg:text-[0.72rem] sm:tracking-[0.14em]">
                    Not achievable
                  </div>
                  <div className="mt-2 text-3xl font-semibold leading-none text-destructive sm:mt-3 lg:text-4xl">
                    {result.neededGrade.toFixed(1)}%
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This exceeds 100% on the final.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 lg:rounded-xl sm:p-5">
                  <div className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-primary lg:text-[0.72rem] sm:tracking-[0.14em]">
                    Already reached
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Even with 0% on the final, you will exceed your target.
                  </p>
                </div>
              )}
            </div>
          )}

          {invalidMessage && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {invalidMessage}
            </div>
          )}

          <div className="flex gap-2 pt-1 lg:gap-3">
            <Button onClick={handleCalculate} className="h-10 flex-1 rounded-lg text-sm lg:h-11 lg:rounded-xl">
              <Calculator className="size-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-10 flex-1 rounded-lg text-sm lg:h-11 lg:rounded-xl">
              <RotateCcw className="size-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden rounded-xl border-border/70 py-0 lg:rounded-2xl">
        <CardContent className="p-0">
          <div className="border-b border-border/70 px-4 py-4 lg:px-6 lg:py-5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
              Exam Inputs
            </h2>
          </div>

          <div className="px-4 py-3 text-xs text-muted-foreground lg:px-6 lg:py-4 lg:text-sm">
            Enter percentages for your current course grade, final exam weight, and target grade.
          </div>

          <div className="px-1.5 pb-4 lg:px-2 lg:pb-5">
            <div className="w-full">
              <div className="grid grid-cols-[minmax(7rem,1.2fr)_minmax(4.5rem,1fr)_1rem] gap-1.5 border-b border-border/70 px-3 py-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground lg:px-5 2xl:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_2.5rem] 2xl:gap-3 2xl:py-3 2xl:text-[0.72rem] 2xl:tracking-[0.08em]">
                <span>Metric</span>
                <span className="text-center">Value</span>
                <span></span>
              </div>

              <div className="divide-y divide-border/70">
                <div className="group grid grid-cols-[minmax(7rem,1.2fr)_minmax(4.5rem,1fr)_1rem] items-center gap-1.5 px-3 py-2.5 transition-colors hover:bg-muted/12 lg:px-5 2xl:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_2.5rem] 2xl:gap-3 2xl:py-3.5">
                  <div>
                    <div className="text-sm font-medium text-foreground lg:text-base">Current grade</div>
                    <div className="text-[0.7rem] leading-snug text-muted-foreground lg:text-sm">
                      Your grade before the final exam
                    </div>
                  </div>
                  <div className="relative w-full max-w-[7.5rem] justify-self-center">
                    <Input
                      id="current-grade"
                      type="text"
                      inputMode="decimal"
                      placeholder="88"
                      value={currentGrade}
                      onChange={(e) => {
                        dispatch({
                          type: 'set-current-grade',
                          value: sanitizeNumberInput(e.target.value),
                        })
                      }}
                      className="h-8 rounded-md border-transparent bg-transparent pr-5 text-center text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:pr-8 lg:text-sm"
                    />
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground lg:right-3 lg:text-sm">
                      %
                    </span>
                  </div>
                  <span />
                </div>

                <div className="group grid grid-cols-[minmax(7rem,1.2fr)_minmax(4.5rem,1fr)_1rem] items-center gap-1.5 px-3 py-2.5 transition-colors hover:bg-muted/12 lg:px-5 2xl:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_2.5rem] 2xl:gap-3 2xl:py-3.5">
                  <div>
                    <div className="text-sm font-medium text-foreground lg:text-base">Final exam weight</div>
                    <div className="text-[0.7rem] leading-snug text-muted-foreground lg:text-sm">
                      How much the final counts
                    </div>
                  </div>
                  <div className="relative w-full max-w-[7.5rem] justify-self-center">
                    <Input
                      id="final-weight"
                      type="text"
                      inputMode="decimal"
                      placeholder="40"
                      value={finalWeight}
                      onChange={(e) => {
                        dispatch({
                          type: 'set-final-weight',
                          value: sanitizeNumberInput(e.target.value),
                        })
                      }}
                      className="h-8 rounded-md border-transparent bg-transparent pr-5 text-center text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:pr-8 lg:text-sm"
                    />
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground lg:right-3 lg:text-sm">
                      %
                    </span>
                  </div>
                  <span />
                </div>

                <div className="group grid grid-cols-[minmax(7rem,1.2fr)_minmax(4.5rem,1fr)_1rem] items-center gap-1.5 px-3 py-2.5 transition-colors hover:bg-muted/12 lg:px-5 2xl:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_2.5rem] 2xl:gap-3 2xl:py-3.5">
                  <div>
                    <div className="text-sm font-medium text-foreground lg:text-base">Target grade</div>
                    <div className="text-[0.7rem] leading-snug text-muted-foreground lg:text-sm">
                      The overall grade you want
                    </div>
                  </div>
                  <div className="relative w-full max-w-[7.5rem] justify-self-center">
                    <Input
                      id="target-grade"
                      type="text"
                      inputMode="decimal"
                      placeholder="90"
                      value={targetGrade}
                      onChange={(e) => {
                        dispatch({
                          type: 'set-target-grade',
                          value: sanitizeNumberInput(e.target.value),
                        })
                      }}
                      className="h-8 rounded-md border-transparent bg-transparent pr-5 text-center text-xs shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input lg:h-9 lg:rounded-lg lg:pr-8 lg:text-sm"
                    />
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground lg:right-3 lg:text-sm">
                      %
                    </span>
                  </div>
                  <span />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
