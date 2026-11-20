import { cn } from '@/utils/cn'

/**
 * Initials avatar. No image upload exists yet, so initials are the honest
 * representation of a workspace/user rather than a stock photo.
 */
export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-line bg-accent-soft font-semibold text-accent',
        size === 'sm' ? 'size-7 text-[11px]' : 'size-8 text-xs',
        className,
      )}
    >
      {initials || 'CC'}
    </span>
  )
}
