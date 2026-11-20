import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
  /** Right-hand slot, e.g. a show/hide password toggle. */
  trailing?: ReactNode
}

/**
 * Text input with label, hint and error states wired through aria attributes, so
 * screen readers announce exactly what sighted users see.
 */
export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  className,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-[13px] font-medium text-fg-muted">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            {leadingIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-control border bg-inlay text-sm text-fg',
            'placeholder:text-fg-subtle transition-colors duration-150',
            'disabled:cursor-not-allowed disabled:opacity-55',
            leadingIcon ? 'pl-9' : 'pl-3',
            trailing ? 'pr-10' : 'pr-3',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-line hover:border-line-strong focus:border-accent/70 focus:ring-2 focus:ring-accent/20',
            className,
          )}
          {...rest}
        />

        {trailing ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
