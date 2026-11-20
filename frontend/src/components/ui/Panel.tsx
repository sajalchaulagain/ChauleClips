import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** `raised` lifts the surface (popovers, primary content); default is flat. */
  elevation?: 'flat' | 'raised' | 'inset'
  /** Adds padding for simple content. Use PanelHeader/Body for structured panels. */
  padded?: boolean
}

/** The single card surface of the app. Every grouped block uses it. */
export function Panel({
  children,
  className,
  elevation = 'flat',
  padded = false,
  ...rest
}: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line',
        elevation === 'raised' && 'bg-raised shadow-panel',
        elevation === 'flat' && 'bg-surface shadow-card',
        elevation === 'inset' && 'bg-inlay',
        padded && 'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-line px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? <span className="mt-0.5 text-fg-subtle">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-fg">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-fg-subtle">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrinkshrink-0 shrink-0">{action}</div> : null}
    </div>
  )
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>
}

export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 border-t border-line px-4 py-3', className)}>
      {children}
    </div>
  )
}
