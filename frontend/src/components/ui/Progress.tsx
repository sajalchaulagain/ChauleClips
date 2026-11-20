import { cn } from '@/utils/cn'

interface ProgressProps {
  /** 0–100. Omit for an indeterminate bar (real "working" state, not a fake %). */
  value?: number
  label?: string
  showValue?: boolean
  tone?: 'accent' | 'success' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

const TONES = {
  accent: 'bg-accent',
  success: 'bg-success',
  danger: 'bg-danger',
}

/**
 * Determinate or indeterminate progress bar.
 *
 * Only pass `value` when the backend reports real progress; the indeterminate
 * variant exists precisely so the UI never has to invent a percentage.
 */
export function Progress({
  value,
  label,
  showValue = false,
  tone = 'accent',
  size = 'md',
  className,
}: ProgressProps) {
  const clamped = value === undefined ? undefined : Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-1.5', className)}>
      {label || (showValue && clamped !== undefined) ? (
        <div className="flex items-baseline justify-between gap-3">
          {label ? <span className="text-xs text-fg-muted">{label}</span> : null}
          {showValue && clamped !== undefined ? (
            <span className="font-mono text-[11px] tabular-nums text-fg-subtle">
              {Math.round(clamped)}%
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label={label ?? 'Progress'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={cn(
          'w-full overflow-hidden rounded-full bg-[#232a36]',
          size === 'sm' ? 'h-1' : 'h-1.5',
        )}
      >
        {clamped === undefined ? (
          <div className={cn('animate-progress-stripes h-full w-2/5 rounded-full', TONES[tone])} />
        ) : (
          <div
            className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONES[tone])}
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  )
}
