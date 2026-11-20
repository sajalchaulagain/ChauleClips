import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

/**
 * Brand mark.
 *
 * The glyph is a stylised "cut" frame (scissors-free so it reads at 24px): two
 * vertical cut lines and a play aperture. Inline SVG — no icon-font or image
 * request, and it stays crisp at every size.
 */
export function BrandMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-[9px] text-[#0b0d12] bg-accent-surface',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_6px_16px_-8px_rgba(139,124,255,0.9)]',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 4.5v15M9.5 4.5v15"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M14.5 8.2v7.6c0 1-1.1 1.6-1.9 1l-4-2.7V9.9l4-2.7c.8-.6 1.9 0 1.9 1Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="19.2" cy="8.6" r="1.9" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="19.2" cy="15.4" r="1.9" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    </span>
  )
}

export function Brand({
  to = '/',
  size = 28,
  showText = true,
  className,
}: {
  to?: string
  size?: number
  showText?: boolean
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 rounded-control', className)}
      aria-label="ChauleClips home"
    >
      <BrandMark size={size} />
      {showText ? (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">ChauleClips</span>
      ) : null}
    </Link>
  )
}
