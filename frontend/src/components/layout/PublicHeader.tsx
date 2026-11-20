import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { Brand } from '@/components/layout/Brand'
import { ButtonLink, IconButton } from '@/components/ui/Button'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How it works' },
  { href: '#environment', label: 'System status' },
  { href: '#roadmap', label: 'Roadmap' },
]

/** Marketing header. Separate from the app shell on purpose. */
export function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Brand />

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-control px-3 py-2 text-[13px] text-fg-muted transition-colors hover:bg-raised hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink to="/signup" size="sm">
            Start creating
          </ButtonLink>
        </div>

        <span className="md:hidden">
          <IconButton
            label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </IconButton>
        </span>
      </div>

      {open ? (
        <div className="animate-enter border-t border-line bg-surface px-5 py-3 md:hidden">
          <nav className="flex flex-col" aria-label="Sections">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-2 py-2.5 text-[13px] text-fg-muted hover:bg-raised hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            <ButtonLink to="/login" variant="secondary" size="sm" fullWidth>
              Sign in
            </ButtonLink>
            <ButtonLink to="/signup" size="sm" fullWidth>
              Start creating
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  )
}
