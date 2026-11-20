interface SpinnerProps {
  className?: string
  label?: string
}

/** Small, accessible loading indicator. Used instead of fake percentages. */
export function Spinner({ className = 'size-3.5', label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  )
}
