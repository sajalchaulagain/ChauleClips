import { BookOpen, ExternalLink, KeyRound, LogOut, Menu as MenuIcon, MoreHorizontal, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { navItemFor } from '@/components/layout/navigation'
import { IconButton } from '@/components/ui/Button'
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/Menu'
import { StatusDot } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { logoutAccount } from '@/services/api'
import { useToast } from '@/components/ui/Toast'

/**
 * Top bar for the app shell: mobile menu trigger, breadcrumbs, live API state
 * and the workspace menu.
 *
 * The status pill is real: it reflects the same `/system/status` call the
 * Settings page uses, so a broken backend is visible from every screen instead
 * of only when a request fails.
 */
export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { pathname } = useLocation()
  const current = navItemFor(pathname)
  const navigate = useNavigate()
  const { notify } = useToast()

  const { status, error, isLoading } = useSystemStatus()

  const apiState = isLoading
    ? { tone: 'neutral' as const, label: 'Checking API' }
    : error
      ? { tone: 'danger' as const, label: 'API offline' }
      : { tone: 'success' as const, label: 'API online' }

  async function signOut() {
    try {
      await logoutAccount()
      notify('You have signed out.', 'success')
      navigate('/login')
    } catch {
      notify('Could not sign out. Check that the backend is running.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-3 backdrop-blur sm:px-5">
      <span className="lg:hidden">
        <IconButton label="Open navigation" onClick={onOpenMobile}>
          <MenuIcon className="size-4.5" aria-hidden="true" />
        </IconButton>
      </span>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-[13px]">
          <li className="hidden sm:block">
            <Link to="/dashboard" className="text-fg-subtle transition-colors hover:text-fg-muted">
              Workspace
            </Link>
          </li>
          <li className="hidden text-fg-subtle sm:block" aria-hidden="true">
            /
          </li>
          <li className="min-w-0">
            <span className="block truncate font-medium text-fg">
              {current?.label ?? prettify(pathname)}
            </span>
          </li>
          {current && current.phase !== 'Live' ? (
            <li className="ml-1 hidden sm:block">
              <span className="rounded-full bg-[#1d222d] px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle ring-1 ring-inset ring-line">
                {current.phase}
              </span>
            </li>
          ) : null}
        </ol>
      </nav>

      {/* Live environment indicator */}
      <Tooltip
        label={
          error
            ? error.message
            : status
              ? `${status.app.name} v${status.app.version} · ${status.app.environment}`
              : 'Contacting the ChauleClips API'
        }
        side="bottom"
        className="hidden sm:inline-flex"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1">
          <StatusDot tone={apiState.tone} />
          <span className="text-[11px] font-medium text-fg-muted">{apiState.label}</span>
          {status ? (
            <span className="font-mono text-[10px] uppercase text-fg-subtle">
              {status.app.environment}
            </span>
          ) : null}
        </span>
      </Tooltip>

      <Menu
        trigger={({ toggle, open, menuId }) => (
          <IconButton
            label="Workspace menu"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={toggle}
          >
            <MoreHorizontal className="size-4.5" aria-hidden="true" />
          </IconButton>
        )}
      >
        <MenuLabel>Workspace</MenuLabel>
        <MenuItem to="/settings" icon={<User className="size-4" aria-hidden="true" />}>
          Profile & settings
        </MenuItem>
        <MenuItem to="/settings" icon={<KeyRound className="size-4" aria-hidden="true" />}>
          AI configuration
        </MenuItem>
        <MenuItem onClick={signOut} icon={<LogOut className="size-4" aria-hidden="true" />} tone="danger">
          Sign out
        </MenuItem>
        <MenuItem
          href="https://openrouter.ai/keys"
          icon={<ExternalLink className="size-4" aria-hidden="true" />}
        >
          OpenRouter keys
        </MenuItem>
        <MenuSeparator />
        <MenuLabel>Project</MenuLabel>
        <MenuItem
          href="https://sajalchaulagain.com.np"
          icon={<BookOpen className="size-4" aria-hidden="true" />}
        >
          Developer portfolio
        </MenuItem>
      </Menu>
    </header>
  )
}

/** "/processing-queue" -> "Processing queue" for paths without a nav entry. */
function prettify(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard'
  const words = segment.replace(/[-_]/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
