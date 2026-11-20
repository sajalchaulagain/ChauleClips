import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BrandMark } from '@/components/layout/Brand'

const YEAR = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-rail">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <BrandMark size={26} />
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
                ChauleClips
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
              Find the moment. Create the story. Local-first AI clipping for the videos you own
              or are allowed to edit.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Free-first', 'Local-first', 'Open source'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] text-fg-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#workflow' },
              { label: 'System status', href: '#environment' },
              { label: 'Roadmap', href: '#roadmap' },
            ]}
          />

          <FooterColumn
            title="Account"
            internal
            links={[
              { label: 'Sign in', href: '/login' },
              { label: 'Create account', href: '/signup' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Settings', href: '/settings' },
            ]}
          />

          <FooterColumn
            title="Developer"
            links={[
              { label: 'Portfolio', href: 'https://sajalchaulagain.com.np', external: true },
              { label: 'OpenRouter keys', href: 'https://openrouter.ai/keys', external: true },
              { label: 'MongoDB Compass', href: 'https://www.mongodb.com/products/compass', external: true },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[11px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} ChauleClips · MIT licensed · Built in the open.</p>
          <p>
            Developed by{' '}
            <a
              href="https://sajalchaulagain.com.np"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-fg-muted underline decoration-line-strong underline-offset-2 hover:text-fg"
            >
              Sajal Chaulagain
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

function FooterColumn({
  title,
  links,
  internal = false,
}: {
  title: string
  links: FooterLink[]
  internal?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {internal ? (
              <Link
                to={link.href}
                className="inline-flex items-center gap-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer noopener' : undefined}
                className="inline-flex items-center gap-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
                {link.external ? (
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                ) : null}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
