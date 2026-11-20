import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'

import { IconButton } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PasswordInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  autoComplete?: string
  name?: string
  disabled?: boolean
}

/** Password field with an accessible show/hide toggle. */
export function PasswordInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete = 'current-password',
  name = 'password',
  disabled,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      label={label}
      name={name}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={error}
      hint={hint}
      autoComplete={autoComplete}
      disabled={disabled}
      leadingIcon={<Lock className="size-4" aria-hidden="true" />}
      trailing={
        <IconButton
          label={visible ? 'Hide password' : 'Show password'}
          size="sm"
          onClick={() => setVisible((current) => !current)}
          tabIndex={disabled ? -1 : 0}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </IconButton>
      }
    />
  )
}
