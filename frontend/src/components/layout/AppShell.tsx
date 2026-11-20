import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Spinner } from '@/components/ui/Spinner'
import { fetchCurrentUser } from '@/services/api'

const COLLAPSE_KEY = 'cc.sidebar.collapsed'

/**
 * Shell for every signed-in-style screen: sidebar + topbar + content.
 *
 * The sidebar collapse preference is remembered in localStorage (UI state only —
 * no auth data is ever stored there).
 */
export function AppShell() {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true'
    } catch {
      return false // private mode / storage disabled
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let active = true
    fetchCurrentUser()
      .then(() => { if (active) setAuthState('authenticated') })
      .catch(() => { if (active) setAuthState('unauthenticated') })
    return () => { active = false }
  }, [])

  // Navigating on mobile should close the drawer, not leave it covering content.
  useEffect(() => setMobileOpen(false), [pathname])

  if (authState === 'checking') {
    return <div className="flex min-h-screen items-center justify-center gap-2 text-fg-subtle"><Spinner label="Checking your session" />Checking your session…</div>
  }
  if (authState === 'unauthenticated') return <Navigate to="/login" replace />

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next))
      } catch {
        /* preference is nice-to-have; ignore storage failures */
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMobile={() => setMobileOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
          <footer className="border-t border-line px-4 py-4 text-[11px] text-fg-subtle sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>ChauleClips · Find the moment. Create the story.</p>
              <p>
                Developed by{' '}
                <a
                  href="https://sajalchaulagain.com.np"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fg-muted underline decoration-line-strong underline-offset-2 hover:text-fg"
                >
                  Sajal Chaulagain
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
