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
}: {
  label: string
  collapsedLabel: string
  collapsed: boolean
}) {
  return (
    <div
      className={cn(
        'px-3 pt-5 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55',
        collapsed && 'px-0 text-center'
      )}
    >
      {collapsed ? collapsedLabel : label}
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
      'flex items-center gap-2 rounded-md text-sm font-medium transition-[background-color,color,box-shadow,padding,gap] duration-300 ease-out',
      collapsed ? 'justify-center gap-0 px-0 py-2.5' : 'px-3 py-2',
      active
        ? 'bg-sidebar-accent text-primary shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
        : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground'
    )

  const collapsedTextClass = cn(
    'inline-block overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out',
    collapsed ? 'max-w-0 -translate-x-1 opacity-0' : 'max-w-40 translate-x-0 opacity-100'
  )

  const collapsedAccountTileClass =
    'mx-auto flex h-11 w-10 items-center justify-center p-0'

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
          'size-7 rounded-md border border-border/80 bg-card shadow-[0_10px_22px_rgba(15,23,42,0.08)]',
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
        <div className="p-3">
          <Link
            to="/grade-calculator"
            search={{ courseId: undefined }}
            className={cn(
              'flex min-w-0 items-center gap-2 rounded-md font-semibold text-sidebar-foreground transition-[background-color,color,padding,gap] duration-300 ease-out',
              collapsed
                ? 'h-10 w-10 justify-center gap-0 px-0 py-0'
                : 'px-3 py-2 hover:bg-sidebar-accent/50'
            )}
            title="Grade Tracker"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-foreground text-[0.68rem] font-bold text-background">
              G
            </span>
            <span className={cn('text-sm truncate', collapsedTextClass)}>
              Grade Tracker
            </span>
          </Link>
        </div>

        <div className="px-3">
          <SectionLabel label="Calculators" collapsedLabel="C" collapsed={collapsed} />
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

        <div className="mt-auto p-3 space-y-2">
          <SignedIn>
            <div
              className={cn(
                'flex items-center gap-2 rounded-md border border-sidebar-border/70 bg-sidebar-accent transition-[padding,gap] duration-300 ease-out',
                collapsed ? collapsedAccountTileClass : 'px-3 py-2'
              )}
            >
              {!collapsed && (
                <div
                  className="min-w-0 flex-1 truncate text-xs text-sidebar-foreground/80"
                  title={isLoaded ? displayName : undefined}
                >
                  {isLoaded ? displayName : '...'}
                </div>
              )}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonTrigger: collapsed
                      ? 'size-8 p-0 flex items-center justify-center'
                      : 'size-8 p-0',
                    avatarBox: 'size-8',
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div
              className={cn(
                'rounded-md border border-sidebar-border/70 bg-sidebar-accent transition-[height,padding,width] duration-300 ease-out',
                collapsed ? collapsedAccountTileClass : 'p-3'
              )}
            >
              <div className={cn('text-xs text-sidebar-foreground/80', collapsedTextClass)}>
                Sign in to save courses, semesters, and grades.
              </div>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  variant="default"
                  className={cn('mt-2 w-full', collapsed && 'm-0 size-8 rounded-full p-0')}
                >
                  <LogIn className={cn('size-4', !collapsed && 'mr-2')} />
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
            className="flex min-w-0 items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-foreground text-sm font-bold text-background">
              G
            </span>
            <span className="truncate text-base">Grade Tracker</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-md text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
                        'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        item.active
                          ? 'bg-sidebar-accent text-primary'
                          : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground'
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
                    'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground'
                  )}
                >
                  {content}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <SignedIn>
              <div className="flex items-center gap-3 rounded-md border border-sidebar-border/70 bg-sidebar-accent px-3 py-2">
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
                <Button className="h-11 w-full rounded-md" onClick={() => setIsOpen(false)}>
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
