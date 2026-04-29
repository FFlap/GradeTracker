import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator, RotateCcw } from 'lucide-react'
import { sanitizeNumberInput } from './types'

interface FinalResult {
  neededGrade: number
  isPossible: boolean
}

export function FinalGradeCalculator() {
  const [currentGrade, setCurrentGrade] = useState('')
  const [finalWeight, setFinalWeight] = useState('')
  const [targetGrade, setTargetGrade] = useState('')
  const [result, setResult] = useState<FinalResult | null>(null)
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null)

  const handleCalculate = () => {
    const current = Number.parseFloat(currentGrade)
    const weight = parseFloat(finalWeight)
    const target = Number.parseFloat(targetGrade)

    if (!Number.isFinite(current) || isNaN(weight) || !Number.isFinite(target)) {
      setResult(null)
      setInvalidMessage('Enter a current grade, final exam weight, and target grade.')
      return
    }

    if (weight <= 0 || weight > 100) {
      setResult(null)
      setInvalidMessage('Final exam weight must be greater than 0 and no more than 100.')
      return
    }

    // Formula: target = current * (1 - weight/100) + needed * (weight/100)
    // needed = (target - current * (1 - weight/100)) / (weight/100)
    const currentWeight = 1 - weight / 100
    const needed = (target - current * currentWeight) / (weight / 100)

    setResult({
      neededGrade: needed,
      isPossible: needed <= 100 && needed >= 0,
    })
    setInvalidMessage(null)
  }

  const handleReset = () => {
    setCurrentGrade('')
    setFinalWeight('')
    setTargetGrade('')
    setResult(null)
    setInvalidMessage(null)
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[22.5rem_minmax(0,1fr)] xl:gap-8">
      <Card className="border-border/70 py-0 gap-0 overflow-hidden rounded-2xl">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
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
                  <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">
                      Required score
                    </div>
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-6xl font-semibold leading-none text-primary">
                        {result.neededGrade.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : result.neededGrade > 100 ? (
                <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-5 py-5">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-destructive">
                    Not achievable
                  </div>
                  <div className="mt-3 text-4xl font-semibold leading-none text-destructive">
                    {result.neededGrade.toFixed(1)}%
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This exceeds 100% on the final.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-5">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">
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

          <div className="flex gap-3 pt-1">
            <Button onClick={handleCalculate} className="h-11 flex-1 rounded-xl">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-11 flex-1 rounded-xl">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 py-0 gap-0 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="border-b border-border/70 px-6 py-5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Exam Inputs
            </h2>
          </div>

          <div className="px-6 py-4 text-sm text-muted-foreground">
            Enter percentages for your current course grade, final exam weight, and target grade.
          </div>

          <div className="overflow-x-auto px-2 pb-5">
            <div className="min-w-[34rem]">
              <div className="grid grid-cols-[minmax(12rem,1fr)_12rem_2.5rem] gap-3 border-b border-border/70 px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <span>Metric</span>
                <span className="text-center">Value</span>
                <span></span>
              </div>

              <div className="divide-y divide-border/70">
                <div className="group grid grid-cols-[minmax(12rem,1fr)_12rem_2.5rem] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/12">
                  <div>
                    <div className="font-medium text-foreground">Current grade</div>
                    <div className="text-sm text-muted-foreground">
                      Your grade before the final exam
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="current-grade"
                      type="text"
                      inputMode="decimal"
                      placeholder="88"
                      value={currentGrade}
                      onChange={(e) => {
                        setCurrentGrade(sanitizeNumberInput(e.target.value))
                        setResult(null)
                        setInvalidMessage(null)
                      }}
                      className="h-9 rounded-lg border-transparent bg-transparent pr-8 text-center shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <span />
                </div>

                <div className="group grid grid-cols-[minmax(12rem,1fr)_12rem_2.5rem] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/12">
                  <div>
                    <div className="font-medium text-foreground">Final exam weight</div>
                    <div className="text-sm text-muted-foreground">
                      How much the final counts
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="final-weight"
                      type="text"
                      inputMode="decimal"
                      placeholder="40"
                      value={finalWeight}
                      onChange={(e) => {
                        setFinalWeight(sanitizeNumberInput(e.target.value))
                        setResult(null)
                        setInvalidMessage(null)
                      }}
                      className="h-9 rounded-lg border-transparent bg-transparent pr-8 text-center shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <span />
                </div>

                <div className="group grid grid-cols-[minmax(12rem,1fr)_12rem_2.5rem] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/12">
                  <div>
                    <div className="font-medium text-foreground">Target grade</div>
                    <div className="text-sm text-muted-foreground">
                      The overall grade you want
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="target-grade"
                      type="text"
                      inputMode="decimal"
                      placeholder="90"
                      value={targetGrade}
                      onChange={(e) => {
                        setTargetGrade(sanitizeNumberInput(e.target.value))
                        setResult(null)
                        setInvalidMessage(null)
                      }}
                      className="h-9 rounded-lg border-transparent bg-transparent pr-8 text-center shadow-none hover:border-border/70 hover:bg-input/90 focus-visible:bg-input"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
