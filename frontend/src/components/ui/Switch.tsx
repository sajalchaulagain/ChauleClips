import { useId } from 'react'

import { cn } from '@/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

/** Accessible on/off control (role="switch") for audio and output toggles. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  const descriptionId = useId()

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg">{label}</p>
        {description ? (
          <p id={descriptionId} className="mt-0.5 text-xs leading-relaxed text-fg-subtle">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-45',
          checked ? 'border-accent/50 bg-accent' : 'border-line bg-[#242a36]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-3.5 rounded-full transition-transform duration-150',
            checked ? 'translate-x-[18px] bg-[#0b0d12]' : 'translate-x-0.5 bg-fg-muted',
          )}
        />
      </button>
    </div>
  )
}
