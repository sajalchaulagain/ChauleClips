import { ArrowLeft, Compass, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ButtonLink } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start px-5 py-24">
      <span className="grid size-11 place-items-center rounded-card border border-line bg-raised text-accent">
        <Compass className="size-5" aria-hidden="true" />
      </span>

      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
        Error 404
      </p>
      <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-fg">
        That page does not exist
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
        The link may be outdated, or the screen has not been built yet. The landing page lists
        exactly which phases are complete.
      </p>

      <Panel className="mt-6 w-full p-4">
        <p className="text-[12px] leading-relaxed text-fg-subtle">
          If you followed a link inside ChauleClips, that is a bug worth reporting — include the URL
          and the request id shown in the browser console.
        </p>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <ButtonLink to="/" size="md">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back home
        </ButtonLink>
        <ButtonLink to="/dashboard" variant="secondary" size="md">
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Open workspace
        </ButtonLink>
        <Link
          to="/#roadmap"
          className="rounded-control px-2 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
        >
          View roadmap
        </Link>
      </div>
    </div>
  )
}
