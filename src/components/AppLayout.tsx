import { useUser } from '@clerk/clerk-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MobileTopNav, Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useUser()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('sidebarCollapsed') === '1'
  )

  // Redirect signed-in users from / to /grade-calculator
  useEffect(() => {
    if (isLoaded && isSignedIn && routerLocation.pathname === '/') {
      navigate({ to: '/grade-calculator' })
    }
  }, [isLoaded, isSignedIn, routerLocation.pathname, navigate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  // Don't render content during redirect
  if (isLoaded && isSignedIn && routerLocation.pathname === '/') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MobileTopNav />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />
      <main
        className={cn(
          'flex-1 pt-16 transition-[margin] duration-300 ease-out md:pt-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        {children}
      </main>
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return <ShellLayout>{children}</ShellLayout>
}
