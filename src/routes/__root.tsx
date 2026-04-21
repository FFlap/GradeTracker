import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { AppLayout } from '../components/AppLayout'

import ConvexProvider from '../integrations/convex/provider'

const showDevtools =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  window.localStorage.getItem('gradeTrackerDevtools') === '1'

export const Route = createRootRoute({
  component: () => (
    <>
      <ConvexProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
        {showDevtools && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
      </ConvexProvider>
    </>
  ),
})
