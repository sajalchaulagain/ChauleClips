import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

export interface TabItem<T extends string = string> {
  value: T
  label: string
  icon?: ReactNode
  badge?: ReactNode
}

interface TabsProps<T extends string = string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible group name, e.g. "Settings sections". */
  label: string
  variant?: 'underline' | 'pill'
  className?: string
}

/** Tab bar. Content panels are rendered by the page via role="tabpanel". */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  label,
  variant = 'underline',
  className,
}: TabsProps<T>) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.value === value)
    if (index === -1) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onChange(items[(index + 1) % items.length].value)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onChange(items[(index - 1 + items.length) % items.length].value)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        variant === 'underline'
          ? 'flex gap-1 overflow-x-auto border-b border-line'
          : 'inline-flex gap-1 rounded-control border border-line bg-surface p-1',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium transition-colors duration-150',
              variant === 'underline'
                ? cn(
                    '-mb-px border-b-2 px-3 py-2.5',
                    selected
                      ? 'border-accent text-fg'
                      : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg',
                  )
                : cn(
                    'rounded-[7px] px-3 py-1.5',
                    selected ? 'bg-raised text-fg shadow-card' : 'text-fg-muted hover:text-fg',
                  ),
            )}
          >
            {item.icon}
            {item.label}
            {item.badge}
          </button>
        )
      })}
    </div>
  )
}
