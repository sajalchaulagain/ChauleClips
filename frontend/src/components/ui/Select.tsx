import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  options: SelectOption[]
}

/** Native select (keyboard + mobile behaviour for free), themed to match Input. */
export function Select({ label, hint, options, className, id, ...rest }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="block text-[13px] font-medium text-fg-muted">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'h-10 w-full appearance-none rounded-control border border-line bg-inlay pl-3 pr-9',
            'text-sm text-fg transition-colors duration-150',
            'hover:border-line-strong focus:border-accent/70 focus:ring-2 focus:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-55',
            className,
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden="true"
        />
      </div>

      {hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  )
}
