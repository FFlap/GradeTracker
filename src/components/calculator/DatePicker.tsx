import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const POPOVER_WIDTH = 256
const POPOVER_GAP = 4

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const readableFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseISO(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

function addMonths(d: Date, months: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay))
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const start = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Pick date' }: DatePickerProps) {
  const selected = parseISO(value)
  const [isOpen, setIsOpen] = useState(false)
  const [focusDate, setFocusDate] = useState<Date>(() => selected ?? new Date())
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const todayISO = toISO(new Date())
  const focusISO = toISO(focusDate)
  const days = getMonthGrid(focusDate.getFullYear(), focusDate.getMonth())

  const open = () => {
    setFocusDate(selected ?? new Date())
    setIsOpen(true)
  }

  const close = (restoreFocus = true) => {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const select = (d: Date) => {
    onChange(toISO(d))
    close()
  }

  useLayoutEffect(() => {
    if (!isOpen) return
    const update = () => {
      const trigger = triggerRef.current
      const popover = popoverRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const height = popover?.offsetHeight ?? 300
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8))
      const below = rect.bottom + POPOVER_GAP
      const top =
        below + height > window.innerHeight - 8 && rect.top - POPOVER_GAP - height > 8
          ? rect.top - POPOVER_GAP - height
          : below
      setPosition({ top, left })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!popoverRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        close(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !position) return
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focusISO}"]`)
      ?.focus({ preventScroll: true })
  }, [isOpen, position, focusISO])

  const handleGridKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusDate, -1),
      ArrowRight: () => addDays(focusDate, 1),
      ArrowUp: () => addDays(focusDate, -7),
      ArrowDown: () => addDays(focusDate, 7),
      Home: () => addDays(focusDate, -focusDate.getDay()),
      End: () => addDays(focusDate, 6 - focusDate.getDay()),
      PageUp: () => addMonths(focusDate, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusDate, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      setFocusDate(move())
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !isOpen) {
            event.preventDefault()
            open()
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={selected ? `Date: ${readableFormatter.format(selected)}` : placeholder}
        className={`flex h-8 w-full items-center rounded-sm border bg-transparent pl-6 pr-1.5 text-left text-xs shadow-none transition-colors hover:border-border/70 hover:bg-input/90 focus-visible:border-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/70 lg:h-9 lg:pl-9 lg:pr-9 lg:text-sm ${
          isOpen ? 'border-foreground/70 bg-input' : 'border-transparent'
        }`}
      >
        <span className={selected ? 'truncate text-foreground' : 'truncate text-muted-foreground/70'}>
          {selected ? readableFormatter.format(selected) : placeholder}
        </span>
      </button>
      <CalendarDays className="pointer-events-none absolute left-1.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70 lg:left-3 lg:size-4" />
      {selected && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 size-6 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground lg:right-2 lg:size-7"
          aria-label="Clear date"
          title="Clear date"
        >
          <X className="mx-auto size-3.5 lg:size-4" />
        </button>
      )}

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Choose date"
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              width: POPOVER_WIDTH,
              visibility: position ? 'visible' : 'hidden',
            }}
            className="fixed z-50 rounded-sm border border-border/80 bg-popover p-2 text-popover-foreground shadow-lg"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                close()
              }
            }}
          >
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setFocusDate(addMonths(focusDate, -1))}
                aria-label="Previous month"
                className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span aria-live="polite" className="text-sm font-medium">
                {monthFormatter.format(focusDate)}
              </span>
              <button
                type="button"
                onClick={() => setFocusDate(addMonths(focusDate, 1))}
                aria-label="Next month"
                className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 pb-1">
              {WEEKDAYS.map((day) => (
                <span key={day} aria-hidden="true" className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground">
                  {day}
                </span>
              ))}
            </div>

            <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-y-0.5" onKeyDown={handleGridKeyDown}>
              {days.map((day) => {
                const iso = toISO(day)
                const isSelected = iso === value
                const isToday = iso === todayISO
                const inMonth = day.getMonth() === focusDate.getMonth()
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    data-date={iso}
                    tabIndex={iso === focusISO ? 0 : -1}
                    aria-selected={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={dayLabelFormatter.format(day)}
                    onClick={() => select(day)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        select(day)
                      }
                    }}
                    className={`mx-auto flex size-8 items-center justify-center rounded-sm text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground ${
                      isSelected
                        ? 'bg-primary font-medium text-primary-foreground'
                        : `hover:bg-accent hover:text-accent-foreground ${inMonth ? 'text-foreground' : 'text-muted-foreground/50'} ${
                            isToday ? 'font-semibold underline decoration-1 underline-offset-4' : ''
                          }`
                    }`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/70 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  close()
                }}
                className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => select(new Date())}
                className="rounded-sm px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
