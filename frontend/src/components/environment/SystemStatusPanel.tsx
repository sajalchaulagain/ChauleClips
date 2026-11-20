import { CheckCircle2, CircleAlert, ExternalLink, RefreshCw, XCircle } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Panel, PanelBody, PanelHeader } from '@/components/ui/Panel'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusDot } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import type { CheckState } from '@/types/api'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { cn } from '@/utils/cn'

const STATE_META: Record<
  CheckState,
  { label: string; tone: 'success' | 'warning' | 'danger'; icon: typeof CheckCircle2; text: string }
> = {
  ok: { label: 'Ready', tone: 'success', icon: CheckCircle2, text: 'text-success' },
  warning: { label: 'Needs setup', tone: 'warning', icon: CircleAlert, text: 'text-warning' },
  error: { label: 'Unavailable', tone: 'danger', icon: XCircle, text: 'text-danger' },
}

/**
 * Live readiness report from `GET /api/v1/system/status`.
 *
 * Unchanged data source and error handling (useSystemStatus + ApiError); only the
 * presentation is new. Every row is a real backend check — nothing here is
 * mocked, which is why the AI row honestly stays "Needs setup" without a key.
 */
export function SystemStatusPanel({ compact = false }: { compact?: boolean }) {
  const { status, error, isLoading, lastCheckedAt, refresh } = useSystemStatus()
  const { notify } = useToast()

  function handleRefresh() {
    refresh()
    notify('Re-checking the local environment…', 'info')
  }

  return (
    <Panel elevation="raised" className="overflow-hidden">
      <PanelHeader
        title="Local environment"
        description={
          isLoading
            ? 'Checking services…'
            : lastCheckedAt
              ? `Last checked ${lastCheckedAt.toLocaleTimeString()}`
              : 'Not checked yet'
        }
        action={
          <div className="flex items-center gap-2">
            {status ? (
              <Badge tone={STATE_META[status.overall].tone}>
                <StatusDot tone={STATE_META[status.overall].tone} />
                {status.overall === 'ok'
                  ? 'All ready'
                  : status.overall === 'warning'
                    ? 'Setup incomplete'
                    : 'Needs attention'}
              </Badge>
            ) : null}
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} aria-hidden="true" />
              Re-check
            </Button>
          </div>
        }
      />

      {/* Loading: skeletons in the exact shape of the real rows. */}
      {isLoading && !status ? (
        <div className="divide-y divide-line">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="ml-auto h-3.5 w-16" />
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <PanelBody>
          <Alert tone="danger" title="Backend unreachable">
            <p>{error.message}</p>
            {error.code === 'NETWORK_ERROR' ? (
              <p className="mt-1.5">
                Start it with{' '}
                <code className="rounded bg-inlay px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
                  uvicorn app.main:app --reload
                </code>{' '}
                inside <span className="font-mono text-[11px]">backend/</span>.
              </p>
            ) : null}
            {error.requestId ? (
              <p className="mt-1.5 font-mono text-[11px] text-fg-subtle">
                request id: {error.requestId}
              </p>
            ) : null}
          </Alert>
        </PanelBody>
      ) : null}

      {status ? (
        <ul className="divide-y divide-line">
          {status.checks.map((check) => {
            const meta = STATE_META[check.status]
            const Icon = meta.icon
            return (
              <li key={check.id} className="flex items-start gap-3 px-4 py-3">
                <Icon className={cn('mt-0.5 size-4 shrink-0', meta.text)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-fg">{check.label}</p>
                    <span className={cn('text-[11px] font-medium', meta.text)}>{meta.label}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-fg-subtle" title={check.detail}>
                    {check.detail}
                  </p>
                  {check.hint ? (
                    <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{check.hint}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {/* Setup notes are genuinely useful, but collapse on compact panels. */}
      {!compact && status && status.config_warnings.length > 0 ? (
        <div className="border-t border-line bg-inlay/60 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            Setup notes
          </p>
          <ul className="mt-2 space-y-1.5">
            {status.config_warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-[11px] leading-relaxed text-fg-muted">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-fg-subtle" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status && status.checks.some((check) => check.id === 'openrouter' && check.status !== 'ok') ? (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
          <p className="text-[11px] text-fg-subtle">
            AI analysis stays disabled until a free OpenRouter key is configured.
          </p>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-accent hover:underline"
          >
            Get a key <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </Panel>
  )
}
