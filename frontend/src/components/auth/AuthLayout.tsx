import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Brand } from '@/components/layout/Brand'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Split authentication layout: form on the left, product panel on the right.
 * The right panel is marketing only and disappears below `lg`, where screen
 * space belongs to the form.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1fr_46%]">
      {/* ------------------------------------------------------------ form */}
      <div className="flex flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Brand size={26} />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-[12px] text-fg-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-fg">{title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{subtitle}</p>

            <div className="mt-7">{children}</div>

            {footer ? <div className="mt-6 text-[13px] text-fg-muted">{footer}</div> : null}
          </div>
        </div>

        <p className="text-center text-[11px] text-fg-subtle lg:text-left">
          Developed by{' '}
          <a
            href="https://sajalchaulagain.com.np"
            target="_blank"
            rel="noreferrer noopener"
            className="text-fg-muted underline decoration-line-strong underline-offset-2 hover:text-fg"
          >
            Sajal Chaulagain
          </a>
        </p>
      </div>

      {/* ---------------------------------------------------------- brand side */}
      <aside className="relative hidden overflow-hidden border-l border-line bg-rail lg:flex lg:flex-col lg:justify-between">
        <div className="bg-hero-glow pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />

        <div className="relative px-10">
          <Badge tone="accent">
            <Sparkles className="size-3" aria-hidden="true" />
            Find the moment. Create the story.
          </Badge>
          <p className="mt-6 max-w-sm text-[22px] font-semibold leading-snug tracking-[-0.02em] text-fg">
            Long videos in. Shorts worth posting out.
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-fg-muted">
            Local transcription, AI moment selection and FFmpeg rendering — all in one workspace,
            without a subscription.
          </p>
        </div>

        <div className="relative flex-1 px-10 py-8">
          <ClipStack />
        </div>

        <div className="relative p-10">
          <ul className="space-y-3">
            {[
              'Your footage never leaves your machine',
              'Seven caption presets with word-level timing',
              'Three ranked, non-overlapping clip suggestions',
              'Free OpenRouter models — your own key, your own quota',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-fg-muted">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

/**
 * Three 9:16 frames with caption styles — a static visual, not a fake result
 * list. It shows what the product produces (vertical clips with burned-in
 * captions) without inventing titles, scores or timestamps.
 */
function ClipStack() {
  const frames = [
    { caption: 'Minimal', style: 'font-normal text-[8px]' },
    { caption: 'BOLD HIGHLIGHT', style: 'font-bold text-[7px] tracking-wide' },
    { caption: 'Karaoke', style: 'font-semibold text-[8px]' },
  ]

  return (
    <div className="flex h-full items-center justify-center gap-3" aria-hidden="true">
      {frames.map((frame, index) => (
        <div
          key={frame.caption}
          className={cn(
            'relative w-[92px] overflow-hidden rounded-card border border-line bg-surface shadow-panel',
            'aspect-[9/16]',
            index === 1 ? 'translate-y-0 z-10 ring-1 ring-accent/30' : 'opacity-70',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#232a38] via-[#1b202b] to-[#12161f]" />
          <div className="absolute inset-x-2 top-2 flex items-center justify-between">
            <span className="rounded bg-black/40 px-1 py-0.5 text-[7px] text-white/70">9:16</span>
            <span className="size-1.5 rounded-full bg-accent/70" />
          </div>
          <div className="absolute inset-x-2 bottom-3">
            <p
              className={cn(
                'rounded bg-black/55 px-1.5 py-1 text-center leading-tight text-white',
                frame.style,
              )}
            >
              {frame.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
