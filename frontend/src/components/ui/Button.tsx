import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control ' +
  'font-medium transition-[background-color,border-color,color,filter,box-shadow] duration-150 ' +
  'disabled:pointer-events-none disabled:opacity-45'

const VARIANTS: Record<ButtonVariant, string> = {
  // The only place a gradient is allowed: the primary action, and only just.
  primary:
    'bg-accent-surface font-semibold text-[#0b0d12] shadow-[0_1px_0_0_rgba(255,255,255,0.28)_inset,0_8px_20px_-10px_rgba(139,124,255,0.9)] hover:brightness-[1.06] active:brightness-95',
  secondary:
    'border border-line bg-raised text-fg hover:border-line-strong hover:bg-[#222836] active:bg-[#1f2531]',
  ghost: 'text-fg-muted hover:bg-raised hover:text-fg active:bg-[#222836]',
  danger:
    'border border-danger/30 bg-danger/10 text-danger hover:border-danger/45 hover:bg-danger/15',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Shows a spinner and blocks interaction while keeping the width stable. */
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends CommonProps {
  to: string
  /** External links open in a new tab with a safe rel. */
  external?: boolean
  fullWidth?: boolean
}

/** Same visual language as Button, for navigation (never a fake <button>). */
export function ButtonLink({
  to,
  external = false,
  variant = 'primary',
  size = 'md',
  className,
  children,
  fullWidth = false,
}: ButtonLinkProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)

  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer noopener" className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required: an icon-only control must have an accessible name. */
  label: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

export function IconButton({
  label,
  children,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        BASE,
        VARIANTS[variant],
        size === 'sm' ? 'size-8' : 'size-9',
        'px-0',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
