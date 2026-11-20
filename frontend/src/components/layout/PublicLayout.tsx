import { Outlet } from 'react-router-dom'

import { PublicHeader } from '@/components/layout/PublicHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

/** Shell for public pages: marketing header + footer. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
