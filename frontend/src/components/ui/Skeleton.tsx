import { cn } from '@/utils/cn'

/** Content placeholder used while real data loads (never a fake result). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-shimmer rounded-control', className)}
    />
  )
}
