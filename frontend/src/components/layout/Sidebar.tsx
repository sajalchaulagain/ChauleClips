import { ChevronRight, PanelLeftClose, PanelLeftOpen, Plus, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Brand, BrandMark } from '@/components/layout/Brand'
import { PRIMARY_NAV } from '@/components/layout/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { ButtonLink, IconButton } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

/**
 * Application sidebar.
 *
 * Three states: expanded (desktop), collapsed to icons (desktop preference,
 * persisted by the shell), and off-canvas drawer (below `lg`). All three share
 * one nav definition so nothing can drift.
 */
export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const width = collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]'

  return (
    <>
      {/* Mobile scrim */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-rail',
          'transition-[transform,width] duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          width,
        )}
        aria-label="Main navigation"
      >
        {/* ---------------------------------------------------------- brand */}
        <div
          className={cn(
            'flex h-14 items-center border-b border-line px-3',
            collapsed ? 'lg:justify-center' : 'justify-between',
          )}
        >
          <Brand className={cn(collapsed && 'lg:hidden')} size={26} />
          {collapsed ? (
            <span className="hidden lg:block">
              <Tooltip label="ChauleClips">
                <BrandMark size={28} />
              </Tooltip>
            </span>
          ) : null}

          <div className="flex items-center gap-1">
            <span className="hidden lg:block">
              <IconButton
                label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                size="sm"
                onClick={onToggleCollapsed}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="size-4" aria-hidden="true" />
                )}
              </IconButton>
            </span>
            <span className="lg:hidden">
              <IconButton label="Close navigation" size="sm" onClick={onCloseMobile}>
                <X className="size-4" aria-hidden="true" />
              </IconButton>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------ new project */}
        <div className={cn('px-3 pt-3', collapsed && 'lg:px-2.5')}>
          {collapsed ? (
            <span className="hidden lg:block">
              <Tooltip label="New project">
                <ButtonLink to="/projects" size="md" className="w-full px-0" aria-label="New project">
                  <Plus className="size-4" aria-hidden="true" />
                </ButtonLink>
              </Tooltip>
            </span>
          ) : null}
          <div className={cn(collapsed && 'lg:hidden')}>
            <ButtonLink to="/projects" size="md" fullWidth>
              <Plus className="size-4" aria-hidden="true" />
              New project
            </ButtonLink>
          </div>
        </div>

        {/* ------------------------------------------------------------- nav */}
        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-3">
          {!collapsed ? (
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              Workspace
            </p>
          ) : null}

          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13px] font-medium',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-accent-soft text-fg'
                      : 'text-fg-muted hover:bg-raised hover:text-fg',
                    collapsed && 'lg:justify-center lg:px-0',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-accent transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <Icon
                      className={cn('size-4 shrink-0', isActive ? 'text-accent' : 'text-current')}
                      aria-hidden="true"
                    />
                    <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                    {item.phase !== 'Live' ? (
                      <span
                        className={cn(
                          'ml-auto font-mono text-[10px] text-fg-subtle',
                          collapsed && 'lg:hidden',
                        )}
                      >
                        {item.phase.replace('Phase ', 'P')}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            )

            return collapsed ? (
              <span key={item.to} className="block">
                <span className="hidden lg:block">
                  <Tooltip label={`${item.label} · ${item.phase}`} side="bottom">
                    <span className="block w-full">{link}</span>
                  </Tooltip>
                </span>
                <span className="lg:hidden">{link}</span>
              </span>
            ) : (
              link
            )
          })}
        </nav>

        {/* ---------------------------------------------------------- footer */}
        <div className={cn('border-t border-line p-2.5', collapsed && 'lg:px-2')}>
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-control px-1.5 py-1.5',
              collapsed && 'lg:hidden',
            )}
          >
            <Avatar name="Local Workspace" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-fg">Local workspace</p>
              <p className="truncate text-[11px] text-fg-subtle">Account session enabled</p>
            </div>
            <ChevronRight className="size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
          </div>

          <div className={cn('hidden lg:block', collapsed && 'lg:grid lg:place-items-center')}>
            {collapsed ? (
              <Tooltip label="Developed by Sajal Chaulagain">
                <Avatar name="Sajal Chaulagain" size="sm" />
              </Tooltip>
            ) : (
              <p className="px-1.5 pt-1 text-[11px] leading-relaxed text-fg-subtle">
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
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
