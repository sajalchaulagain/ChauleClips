import type { KeyboardEvent, ReactNode } from 'react'

import { cn } from '@/utils/cn'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: ReactNode
  /** Optional second line, e.g. "9:16 · Shorts". */
  hint?: string
  disabled?: boolean
}

interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible group name, e.g. "Aspect ratio". */
  label: string
  size?: 'sm' | 'md'
  className?: string
  disabled?: boolean
}

/**
 * Radio group rendered as a segmented control.
 *
 * A real radio group (role/aria-checked + arrow-key navigation) rather than
 * styled divs, so it is fully keyboard operable.
 */
export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
  disabled = false,
}: SegmentedProps<T>) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const available = options.filter((option) => !option.disabled && !disabled)
    const index = available.findIndex((option) => option.value === value)
    if (index === -1) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      onChange(available[(index + 1) % available.length].value)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      onChange(available[(index - 1 + available.length) % available.length].value)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        const isDisabled = disabled || option.disabled
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={isDisabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-control border transition-[background-color,border-color,color] duration-150',
              'disabled:pointer-events-none disabled:opacity-40',
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-[13px]',
              selected
                ? 'border-accent/45 bg-accent-soft text-fg shadow-[0_0_0_1px_rgba(139,124,255,0.18)_inset]'
                : 'border-line bg-raised text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            <span className="block font-medium leading-tight">{option.label}</span>
            {option.hint ? (
              <span className="mt-0.5 block text-[11px] leading-tight text-fg-subtle">
                {option.hint}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
