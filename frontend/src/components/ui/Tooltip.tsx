import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

/**
 * CSS-only tooltip: shows on hover AND keyboard focus, and the label is exposed
 * to assistive tech through aria-describedby, not just visually.
 */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const id = `tt-${label.replace(/\W+/g, '-').toLowerCase()}`

  return (
    <span className={cn('group/tt relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-[min(15rem,calc(100vw-2rem))] -translate-x-1/2 text-center',
          'rounded-md border border-line bg-raised px-2 py-1 text-[11px] font-medium text-fg',
          'opacity-0 shadow-pop transition-opacity duration-150',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]',
        )}
      >
        {label}
      </span>
    </span>
  )
}
