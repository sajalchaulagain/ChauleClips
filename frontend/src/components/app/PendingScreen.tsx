import { Check, Clock, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHeader } from '@/components/app/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'

interface PendingScreenProps {
  title: string
  description: string
  phase: string
  icon: LucideIcon
  /** What this screen will do once its phase lands — plain, checkable promises. */
  deliverables: string[]
  /** What already exists and is reused, so the gap is honest. */
  alreadyWorking?: string[]
  action?: ReactNode
}

/**
 * Consistent state for a screen whose backend does not exist yet.
 *
 * This is deliberately NOT a mockup of a dashboard: inventing project cards,
 * clip grids or progress bars here would misrepresent what the app can do. It
 * states the phase, what already works, and exactly what this screen will
 * contain when its API is real.
 */
export function PendingScreen({
  title,
  description,
  phase,
  icon: Icon,
  deliverables,
  alreadyWorking,
  action,
}: PendingScreenProps) {
  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        badge={
          <Badge tone="warning">
            <Clock className="size-3" aria-hidden="true" />
            {phase}
          </Badge>
        }
        actions={action}
      />

      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-control border border-line bg-raised text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[13px] font-semibold text-fg">Scheduled for {phase}</h2>
              <p className="text-[11px] text-fg-subtle">
                No placeholder data is shown on purpose
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {deliverables.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-fg-muted">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-fg-subtle" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-[13px] font-semibold text-fg">Already working today</h2>
          <ul className="mt-3 space-y-2.5">
            {(alreadyWorking ?? []).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-fg-muted">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-fg-subtle">
            The design system, layout shell and this state component are shared, so this screen
            becomes composition work once its API lands — no redesign required.
          </p>
        </Panel>
      </div>
    </div>
  )
}
