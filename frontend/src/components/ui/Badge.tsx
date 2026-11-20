import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[#1d222d] text-fg-muted ring-line',
  accent: 'bg-accent/12 text-accent ring-accent/25',
  info: 'bg-info/12 text-info ring-info/25',
  success: 'bg-success/12 text-success ring-success/25',
  warning: 'bg-warning/12 text-warning ring-warning/25',
  danger: 'bg-danger/12 text-danger ring-danger/25',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        'ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const DOT_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-fg-subtle',
  accent: 'bg-accent',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/** Standalone status dot for dense rows (nav, table cells). */
export function StatusDot({ tone = 'neutral', pulse = false }: { tone?: BadgeTone; pulse?: boolean }) {
  return (
    <span className="relative inline-flex size-2 shrink-0">
      {pulse ? (
        <span
          className={cn('absolute inset-0 animate-ping rounded-full opacity-60', DOT_TONES[tone])}
        />
      ) : null}
      <span className={cn('relative inline-flex size-2 rounded-full', DOT_TONES[tone])} />
    </span>
  )
}
