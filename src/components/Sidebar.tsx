import { Link, useLocation } from '@tanstack/react-router'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import {
  Calendar,
  CalendarDays,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
  GraduationCap,
  LogIn,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function AppLogo({
  className,
  imageClassName,
}: {
  className?: string
  imageClassName?: string
}) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center', className)}>
      <img
        src="/logo192.png"
        alt=""
        aria-hidden="true"
        className={cn('object-contain', imageClassName)}
      />
    </span>
  )
}

function useNavigationItems() {
  const location = useLocation()

  return [
    {
      to: '/grade-calculator',
      label: 'Grade Calculator',
      icon: Calculator,
      active:
        location.pathname === '/grade-calculator' ||
        location.pathname.startsWith('/grade-calculator/'),
      signedInOnly: false,
    },
    {
      to: '/gpa-calculator',
      label: 'GPA Calculator',
      icon: GraduationCap,
      active: location.pathname === '/gpa-calculator',
      signedInOnly: false,
    },
    {
      to: '/final-exam',
      label: 'Final Exam',
      icon: ClipboardPenLine,
      active: location.pathname === '/final-exam',
      signedInOnly: false,
    },
    {
      to: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      active: location.pathname === '/calendar',
      signedInOnly: true,
    },
    {
      to: '/semesters',
      label: 'Semesters',
      icon: CalendarDays,
      active: location.pathname === '/semesters',
      signedInOnly: true,
    },
  ] as const
}

function SectionLabel({
  label,
  collapsedLabel,
  collapsed,
  compact = false,
}: {
  label: string
  collapsedLabel: string
  collapsed: boolean
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'relative h-[2.375rem] overflow-hidden whitespace-nowrap pt-5 pb-2 text-[0.68rem] font-semibold uppercase leading-[0.875rem] tracking-[0.16em] text-muted-foreground',
        compact && 'h-[1.625rem] pt-2'
      )}
    >
      <span
        className={cn(
          'block px-3 transition-opacity duration-200 ease-out',
          collapsed ? 'opacity-0' : 'opacity-100 delay-100'
        )}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-2 left-0 w-10 text-center tracking-normal transition-opacity duration-200 ease-out',
          collapsed ? 'opacity-100 delay-100' : 'opacity-0'
        )}
      >
        {collapsedLabel}
      </span>
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const { isLoaded, user } = useUser()
  const navItems = useNavigationItems()

  const displayName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    'Account'

  const navLinkClass = (active: boolean) =>
    cn(
      'flex items-center gap-2 overflow-hidden rounded-sm px-3 py-2 text-sm font-medium transition-[background-color,color] duration-200 ease-out [&>svg]:shrink-0',
      active
        ? 'bg-primary text-primary-foreground [&>svg]:text-accent-on-ink'
        : 'text-muted-foreground [&>svg]:text-muted-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:[&>svg]:text-sidebar-foreground/80'
    )

  const collapsedTextClass = cn(
    'whitespace-nowrap transition-opacity duration-200 ease-out',
    collapsed ? 'opacity-0' : 'opacity-100 delay-100'
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 hidden bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-out md:block',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        className={cn(
          'absolute top-7 right-0 z-50 -translate-y-1/2 translate-x-1/2',
          'size-7 rounded-sm border border-border/80 bg-card shadow-[0_10px_22px_var(--shadow-tint-lift)]',
          'hover:bg-muted/70 text-sidebar-foreground/80 transition-colors'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5 mx-auto" />
        ) : (
          <ChevronLeft className="size-3.5 mx-auto" />
        )}
      </button>

      <nav className="flex h-full flex-col">
        <div className="px-3 pt-2 pb-1">
          <Link
            to="/grade-calculator"
            search={{ courseId: undefined }}
            className={cn(
              'flex h-12 min-w-0 items-center overflow-hidden rounded-sm font-semibold text-sidebar-foreground transition-colors duration-200 ease-out',
              !collapsed && 'hover:bg-sidebar-accent'
            )}
            title="Grade Tracker"
          >
            <AppLogo className="h-12 w-10" imageClassName="h-10 w-8" />
            <span
              className={cn(
                'text-[1.35rem] font-semibold leading-none tracking-tight',
                collapsedTextClass
              )}
            >
              Grade Tracker
            </span>
          </Link>
        </div>

        <div className="px-3">
          <SectionLabel label="Calculators" collapsedLabel="C" collapsed={collapsed} compact />
          {navItems
            .filter((item) => !item.signedInOnly)
            .map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={navLinkClass(item.active)}
                  title={item.label}
                >
                  <Icon className="size-4" />
                  <span className={collapsedTextClass}>{item.label}</span>
                </Link>
              )
            })}

          <SignedIn>
            <SectionLabel label="Planning" collapsedLabel="P" collapsed={collapsed} />
            {navItems
              .filter((item) => item.signedInOnly)
              .map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={navLinkClass(item.active)}
                    title={item.label}
                  >
                    <Icon className="size-4" />
                    <span className={collapsedTextClass}>{item.label}</span>
                  </Link>
                )
              })}
          </SignedIn>
        </div>

        <div
          className={cn(
            'mt-auto space-y-2 border-t p-3 transition-colors duration-300 ease-out',
            collapsed ? 'border-transparent' : 'border-sidebar-border'
          )}
        >
          <SignedIn>
            <div className="flex items-center gap-3 overflow-hidden px-1 py-2">
              <span className="flex size-8 shrink-0 items-center justify-center">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonTrigger: 'size-8 p-0 flex items-center justify-center',
                      avatarBox: 'size-8',
                    },
                  }}
                />
              </span>
              <div
                className={cn(
                  'min-w-0 flex-1 truncate text-sm font-semibold text-sidebar-foreground',
                  collapsedTextClass
                )}
                title={isLoaded ? displayName : undefined}
                aria-hidden={collapsed}
              >
                {isLoaded ? displayName : '...'}
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="overflow-hidden pb-1">
              <div
                className={cn(
                  'w-[13.5rem] overflow-hidden px-3 text-xs leading-5 text-muted-foreground transition-[max-height,opacity] duration-300 ease-out',
                  collapsed ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100'
                )}
                aria-hidden={collapsed}
              >
                Sign in to save courses, semesters, and grades.
              </div>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  variant="default"
                  className={cn(
                    'w-full justify-start gap-2 overflow-hidden px-3 has-[>svg]:px-3 transition-[margin,background-color] duration-300 ease-out',
                    collapsed ? 'mt-0' : 'mt-2'
                  )}
                  title="Sign In"
                >
                  <LogIn className="size-4" />
                  <span className={collapsedTextClass}>Sign In</span>
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </nav>
    </aside>
  )
}

export function MobileTopNav() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { isLoaded, user } = useUser()
  const navItems = useNavigationItems()

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const displayName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    'Account'

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-sidebar-border bg-sidebar/95 backdrop-blur md:hidden">
      <div ref={menuRef}>
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to="/grade-calculator"
            search={{ courseId: undefined }}
            onClick={() => setIsOpen(false)}
            className="flex min-w-0 items-center gap-2.5 font-semibold text-sidebar-foreground"
          >
            <AppLogo className="size-12" imageClassName="h-12 w-9" />
            <span className="truncate text-lg font-semibold tracking-tight">
              Grade Tracker
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div className={cn('border-t border-sidebar-border bg-sidebar shadow-lg', !isOpen && 'hidden')}>
          <nav className="px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const content = (
                <>
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </>
              )

              if (item.signedInOnly) {
                return (
                  <SignedIn key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                        item.active
                          ? 'bg-primary text-primary-foreground [&>svg]:text-accent-on-ink'
                          : 'text-muted-foreground [&>svg]:text-muted-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      {content}
                    </Link>
                  </SignedIn>
                )
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-primary text-primary-foreground [&>svg]:text-accent-on-ink'
                      : 'text-muted-foreground [&>svg]:text-muted-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  {content}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <SignedIn>
              <div className="flex items-center gap-3 rounded-sm border border-sidebar-border/70 bg-sidebar-accent px-3 py-2">
                <div
                  className="min-w-0 flex-1 truncate text-sm text-sidebar-foreground/80"
                  title={isLoaded ? displayName : undefined}
                >
                  {isLoaded ? displayName : '...'}
                </div>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonTrigger: 'size-8 p-0',
                      avatarBox: 'size-8',
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button className="h-10 w-full" onClick={() => setIsOpen(false)}>
                  <LogIn className="size-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  )
}
