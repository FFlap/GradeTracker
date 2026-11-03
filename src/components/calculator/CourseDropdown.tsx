import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Course } from './types'

interface CourseDropdownProps {
  courses: Course[]
  selectedCourseId: Course['_id'] | null
  onSelectCourse: (courseId: Course['_id'] | null) => void
  disabled: boolean
  placeholder: string
}

export function CourseDropdown({
  courses,
  selectedCourseId,
  onSelectCourse,
  disabled,
  placeholder,
}: CourseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const selectedCourse = courses.find((course) => course._id === selectedCourseId)
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const options = [{ id: null, name: 'No course selected' }, ...filteredCourses.map(
    (course) => ({ id: course._id, name: course.name })
  )]
  const currentIndex = Math.min(activeIndex, options.length - 1)

  useEffect(() => {
    if (!isOpen) return
    searchRef.current?.focus()

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.getElementById(`${listId}-${currentIndex}`)?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [isOpen, listId, currentIndex])

  const openDropdown = () => {
    setQuery('')
    setActiveIndex(selectedCourseId ? courses.findIndex((course) => course._id === selectedCourseId) + 1 : 0)
    setIsOpen(true)
  }

  const selectCourse = (courseId: Course['_id'] | null) => {
    onSelectCourse(courseId)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 flex-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label="Select course"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            openDropdown()
          }
        }}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-sm border border-border/80 bg-input px-3 py-2 text-sm shadow-[0_1px_2px_var(--shadow-tint-soft)] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selectedCourse?.name ?? (disabled ? placeholder : 'No course selected')}</span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.25rem)] z-50 w-full min-w-[12rem] rounded-sm border border-border/80 bg-popover text-popover-foreground shadow-lg">
          <div className="relative border-b border-border/70 p-2">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              role="combobox"
              aria-label="Search courses"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={`${listId}-${currentIndex}`}
              placeholder="Search courses…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(1)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault()
                  const direction = event.key === 'ArrowDown' ? 1 : -1
                  setActiveIndex((currentIndex + direction + options.length) % options.length)
                } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  selectCourse(options[currentIndex].id)
                }
              }}
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div id={listId} role="listbox" aria-label="Courses" className="max-h-60 overflow-y-auto p-1">
            {options.map((option, index) => (
              <div
                key={option.id ?? 'none'}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selectedCourseId === option.id}
                onPointerMove={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCourse(option.id)}
                className={`relative cursor-pointer rounded-sm py-1.5 pl-2 pr-8 text-sm break-words ${currentIndex === index ? 'bg-accent text-accent-foreground' : ''}`}
              >
                {option.name}
                {selectedCourseId === option.id && <Check aria-hidden="true" className="absolute right-2 top-2 size-4" />}
              </div>
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <p role="status" className="px-3 py-2 text-sm text-muted-foreground">
              {query.trim() ? 'No courses found.' : 'No courses yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
