import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  /** `compact` for inside a panel, default for a full page area. */
  size?: 'compact' | 'default'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/60 text-center',
        size === 'default' ? 'px-6 py-14' : 'px-4 py-8',
        className,
      )}
    >
      <span
        className={cn(
          'grid place-items-center rounded-card border border-line bg-raised text-accent',
          size === 'default' ? 'size-12' : 'size-10',
        )}
      >
        {icon}
      </span>
      <h3 className="mt-3.5 text-sm font-semibold text-fg">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
