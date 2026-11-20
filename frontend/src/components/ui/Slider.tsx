import { useId } from 'react'

import { cn } from '@/utils/cn'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  /** Formats the read-out, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string
  disabled?: boolean
  className?: string
}

/** Native range input styled by `.range-input`, with a visible numeric read-out. */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  formatValue,
  disabled = false,
  className,
}: SliderProps) {
  const id = useId()

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-fg-muted">
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-fg">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="range-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
