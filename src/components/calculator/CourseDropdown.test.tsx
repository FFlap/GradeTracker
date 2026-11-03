// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CourseDropdown } from './CourseDropdown'
import type { Course } from './types'

const courses: Course[] = [
  { _id: 'math' as Course['_id'], name: 'Math 101', userId: 'user', createdAt: 0 },
  { _id: 'biology' as Course['_id'], name: 'Biology 201', userId: 'user', createdAt: 0 },
  { _id: 'history' as Course['_id'], name: 'History 101', userId: 'user', createdAt: 0 },
]

describe('CourseDropdown', () => {
  let container: HTMLDivElement
  let root: Root
  const onSelectCourse = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    onSelectCourse.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  function render(disabled = false) {
    act(() => root.render(
      <CourseDropdown
        courses={courses}
        selectedCourseId={courses[1]._id}
        onSelectCourse={onSelectCourse}
        disabled={disabled}
        placeholder="Select a course"
      />
    ))
  }

  function open() {
    act(() => container.querySelector('button')!.click())
    return container.querySelector('input')!
  }

  function type(input: HTMLInputElement, value: string) {
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  function press(element: HTMLElement, key: string) {
    act(() => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })))
  }

  it('focuses search and filters by name without changing the selected course', () => {
    render()
    const input = open()
    expect(document.activeElement).toBe(input)
    type(input, '  mAtH  ')
    expect(container.querySelector('[role="listbox"]')!.textContent).toBe('No course selectedMath 101')
    expect(container.querySelector('button')!.textContent).toContain('Biology 201')
    expect(document.activeElement).toBe(input)
    expect(onSelectCourse).not.toHaveBeenCalled()
  })

  it('selects the first search result with Enter and restores trigger focus', () => {
    render()
    const input = open()
    type(input, 'math')
    press(input, 'Enter')
    expect(onSelectCourse).toHaveBeenCalledWith(courses[0]._id)
    expect(container.querySelector('input')).toBeNull()
    expect(document.activeElement).toBe(container.querySelector('button'))
  })

  it('navigates filtered results with arrow keys and can clear the selection', () => {
    render()
    const input = open()
    type(input, '101')
    press(input, 'ArrowDown')
    press(input, 'Enter')
    expect(onSelectCourse).toHaveBeenLastCalledWith(courses[2]._id)
    const reopened = open()
    type(reopened, '101')
    press(reopened, 'ArrowUp')
    press(reopened, 'Enter')
    expect(onSelectCourse).toHaveBeenLastCalledWith(null)
  })

  it('shows no matches and resets search when reopened after Escape', () => {
    render()
    const input = open()
    type(input, 'not a course')
    expect(container.querySelector('[role="status"]')!.textContent).toBe('No courses found.')
    press(input, 'Escape')
    expect(onSelectCourse).not.toHaveBeenCalled()
    expect(open().value).toBe('')
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(4)
  })

  it('supports clicking a filtered course and closing on an outside click', () => {
    render()
    type(open(), 'history')
    act(() => (container.querySelectorAll('[role="option"]')[1] as HTMLElement).click())
    expect(onSelectCourse).toHaveBeenCalledWith(courses[2]._id)
    open()
    act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(container.querySelector('input')).toBeNull()
  })

  it('does not open when disabled', () => {
    render(true)
    act(() => container.querySelector('button')!.click())
    expect(container.querySelector('input')).toBeNull()
  })
})
