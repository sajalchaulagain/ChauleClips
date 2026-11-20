import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

interface MenuProps {
  /** Rendered as the trigger; must be a focusable element. */
  trigger: (props: {
    open: boolean
    toggle: () => void
    menuId: string
  }) => ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

/**
 * Dropdown menu with the behaviours people expect: click to open, Escape or
 * outside click to close, focus returns to the trigger on close.
 */
export function Menu({ trigger, children, align = 'right', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value), menuId })}
      {open ? (
        <div
          id={menuId}
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            'animate-pop absolute z-50 mt-1.5 min-w-52 overflow-hidden rounded-control border border-line',
            'bg-raised p-1 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function MenuItem({
  children,
  icon,
  to,
  href,
  onClick,
  tone = 'default',
}: {
  children: ReactNode
  icon?: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  tone?: 'default' | 'danger'
}) {
  const classes = cn(
    'flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[13px] transition-colors',
    tone === 'danger'
      ? 'text-danger hover:bg-danger/10'
      : 'text-fg-muted hover:bg-[#222836] hover:text-fg',
    'disabled:opacity-50',
  )

  if (to) {
    return (
      <Link role="menuitem" to={to} className={classes}>
        {icon}
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a role="menuitem" href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {icon}
        {children}
      </a>
    )
  }

  return (
    <button role="menuitem" type="button" onClick={onClick} className={classes}>
      {icon}
      {children}
    </button>
  )
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
      {children}
    </p>
  )
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-line" role="separator" />
}
