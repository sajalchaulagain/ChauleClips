import {
  Film,
  FolderOpen,
  LayoutDashboard,
  LayoutTemplate,
  ListVideo,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Phase that makes this screen functional — shown as an honest hint. */
  phase: string
}

/**
 * Single source of truth for sidebar + breadcrumb + mobile navigation.
 * Adding a screen means adding one line here.
 */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, phase: 'Phase 2' },
  { to: '/projects', label: 'Projects', icon: FolderOpen, phase: 'Phase 3' },
  { to: '/clips', label: 'Clips', icon: Film, phase: 'Phase 7' },
  { to: '/queue', label: 'Processing queue', icon: ListVideo, phase: 'Phase 6' },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate, phase: 'Phase 6' },
  { to: '/settings', label: 'Settings', icon: Settings, phase: 'Live' },
]

export function navItemFor(pathname: string): NavItem | undefined {
  return PRIMARY_NAV.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
}
