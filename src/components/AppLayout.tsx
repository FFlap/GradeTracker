import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { MobileTopNav, Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { api } from '../../convex/_generated/api'
import type { Course } from './calculator/types'

interface AppLayoutProps {
  children: React.ReactNode
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('sidebarCollapsed') === '1'
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  return (
    <div className="flex min-h-screen bg-background">
      <MobileTopNav />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />
      <main
        className={cn(
          'min-w-0 flex-1 pt-16 transition-[margin] duration-300 ease-out md:pt-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        {children}
      </main>
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <AppDataPreloader />
      <ShellLayout>{children}</ShellLayout>
    </>
  )
}

function AppDataPreloader() {
  const { isLoaded, isSignedIn } = useUser()
  const canLoadAccountData = Boolean(isLoaded && isSignedIn)
  const courses = useQuery(
    api.courses.list,
    canLoadAccountData ? {} : 'skip'
  ) as Course[] | undefined
  const firstCourseId = courses?.[0]?._id

  useQuery(api.semesters.overview, canLoadAccountData ? {} : 'skip')
  useQuery(api.grades.listDated, canLoadAccountData ? {} : 'skip')
  useQuery(
    api.grades.listByCourse,
    firstCourseId ? { courseId: firstCourseId } : 'skip'
  )

  return null
}
