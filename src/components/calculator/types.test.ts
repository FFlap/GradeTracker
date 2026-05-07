import { describe, expect, it } from 'vitest'
import {
  calculateGradeResult,
  calculateNeededGrade,
  calculateWeightedAverage,
  formatGradeInputForDisplay,
  getGradeInputError,
  parseGradeInput,
  percentageToLetter,
  sanitizeGradeInput,
  sanitizeNumberInput,
  type GradeRow,
} from './types'

function row(grade: string, weight: string): GradeRow {
  return {
    id: `${grade}-${weight}`,
    assignment: '',
    date: '',
    grade,
    weight,
  }
}

describe('grade input parsing', () => {
  it('returns null for blank or invalid grade inputs', () => {
    expect(parseGradeInput('')).toBeNull()
    expect(parseGradeInput('hello')).toBeNull()
    expect(parseGradeInput('10 / 0')).toBeNull()
    expect(parseGradeInput('10 / ')).toBeNull()
  })

  it('parses percentages, fractions, decimals, and letter grades', () => {
    expect(parseGradeInput('95')).toBe(95)
    expect(parseGradeInput('95%')).toBe(95)
    expect(parseGradeInput('.5')).toBe(0.5)
    expect(parseGradeInput('17/20')).toBe(85)
    expect(parseGradeInput('8.5 / 10')).toBe(85)
    expect(parseGradeInput('a-')).toBe(90)
    expect(parseGradeInput('F')).toBe(50)
  })

  it('allows extra-credit percentages and fractions above 100', () => {
    expect(parseGradeInput('105')).toBe(105)
    expect(parseGradeInput('22/20')).toBeCloseTo(110)
  })

  it('surfaces helpful grade input errors without marking blanks invalid', () => {
    expect(getGradeInputError('')).toBeNull()
    expect(getGradeInputError('10/')).toBe('Fractions need a number on both sides of /.')
    expect(getGradeInputError('bad')).toBe(
      'Enter a percentage, a points fraction, or a letter grade.'
    )
  })

  it('sanitizes grade and number inputs to supported formats', () => {
    expect(sanitizeGradeInput('a plus')).toBe('A')
    expect(sanitizeGradeInput('b- extra text')).toBe('B-')
    expect(sanitizeGradeInput('98.5%%abc')).toBe('98.5%')
    expect(sanitizeGradeInput('17.5/20.0')).toBe('17.5/20.0')
    expect(sanitizeNumberInput('10.5%abc')).toBe('10.5')
    expect(sanitizeNumberInput('1.2.3')).toBe('1.23')
  })

  it('formats saved grade inputs for display without changing fractions or letters', () => {
    expect(formatGradeInputForDisplay('')).toBe('')
    expect(formatGradeInputForDisplay('88')).toBe('88%')
    expect(formatGradeInputForDisplay('88%')).toBe('88%')
    expect(formatGradeInputForDisplay('17/20')).toBe('17/20')
    expect(formatGradeInputForDisplay('a-')).toBe('A-')
  })
})

describe('weighted average calculation', () => {
  it('returns null when no courses or valid grade rows are added', () => {
    expect(calculateWeightedAverage([])).toBeNull()
    expect(calculateWeightedAverage([row('', ''), row('95', ''), row('', '25')])).toBeNull()
    expect(calculateWeightedAverage([row('95', '0'), row('88', '-10')])).toBeNull()
  })

  it('calculates weighted average, total weight, and weighted sum for percentage rows', () => {
    expect(calculateWeightedAverage([row('90', '40'), row('80', '60')])).toEqual({
      average: 84,
      totalWeight: 100,
      weightedSum: 8400,
    })
  })

  it('accepts percent signs in weight inputs', () => {
    expect(calculateWeightedAverage([row('90', '40%'), row('80', '60%')])).toEqual({
      average: 84,
      totalWeight: 100,
      weightedSum: 8400,
    })
  })

  it('calculates correctly with fractions and letter grades', () => {
    const result = calculateWeightedAverage([row('18/20', '50'), row('A', '50')])
    expect(result?.average).toBe(91.5)
    expect(result?.totalWeight).toBe(100)
    expect(result?.weightedSum).toBe(9150)
  })

  it('ignores rows with invalid grade or weight while calculating valid rows', () => {
    expect(calculateWeightedAverage([row('95', '30'), row('bad', '70'), row('80', '')])).toEqual({
      average: 95,
      totalWeight: 30,
      weightedSum: 2850,
    })
  })

  it('supports total weight above 100 without normalizing it back to 100', () => {
    expect(calculateWeightedAverage([row('100', '80'), row('50', '40')])).toEqual({
      average: 83.33333333333333,
      totalWeight: 120,
      weightedSum: 10000,
    })
  })
})

describe('needed grade calculation', () => {
  it('returns null when total completed weight is at least 100', () => {
    expect(calculateNeededGrade(90, 100, 95)).toBeNull()
    expect(calculateNeededGrade(90, 120, 95)).toBeNull()
  })

  it('calculates required score on remaining weight', () => {
    expect(calculateNeededGrade(80, 50, 90)).toBe(100)
    expect(calculateNeededGrade(75, 80, 80)).toBe(100)
  })

  it('can return impossible or already-safe values rather than clamping', () => {
    expect(calculateNeededGrade(100, 90, 80)).toBe(-100)
    expect(calculateNeededGrade(70, 90, 95)).toBe(320)
  })
})

describe('grade calculator result', () => {
  it('returns null for no valid rows', () => {
    expect(calculateGradeResult([], 90)).toBeNull()
    expect(calculateGradeResult([row('', '10')], 90)).toBeNull()
  })

  it('calculates average, overall percent so far, remaining weight, and needed grade', () => {
    expect(calculateGradeResult([row('90', '40'), row('80', '20')], 85)).toEqual({
      averageOnCompletedWork: 86.66666666666667,
      averageOnCompletedWorkLetter: 'B',
      overallCoursePercentSoFar: 52,
      overallCoursePercentSoFarLetter: 'F',
      totalWeight: 60,
      remainingWeight: 40,
      neededGrade: 82.5,
    })
  })

  it('hides required-on-remaining by returning null needed grade when total weight is 100', () => {
    const result = calculateGradeResult([row('90', '40'), row('80', '60')], 85)
    expect(result).toMatchObject({
      totalWeight: 100,
      remainingWeight: 0,
      neededGrade: null,
    })
  })

  it('hides overall and required-on-remaining states when total weight is above 100', () => {
    const result = calculateGradeResult([row('100', '80'), row('50', '40')], 85)
    expect(result).toMatchObject({
      totalWeight: 120,
      remainingWeight: -20,
      neededGrade: null,
    })
    expect(result?.overallCoursePercentSoFar).toBe(100)
  })

  it('uses custom letter thresholds when supplied', () => {
    const result = calculateGradeResult([row('85', '100')], 90, [
      { min: 90, letter: 'Pass+' },
      { min: 80, letter: 'Pass' },
      { min: 0, letter: 'No Pass' },
    ])

    expect(result?.averageOnCompletedWorkLetter).toBe('Pass')
    expect(result?.overallCoursePercentSoFarLetter).toBe('Pass')
  })
})

describe('letter conversion', () => {
  it('maps boundary percentages to the expected default letters', () => {
    expect(percentageToLetter(97)).toBe('A+')
    expect(percentageToLetter(96.99)).toBe('A')
    expect(percentageToLetter(90)).toBe('A-')
    expect(percentageToLetter(59.99)).toBe('F')
  })
})
