import {
  Cpu,
  ExternalLink,
  Info,
  KeyRound,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/app/PageHeader'
import { SystemStatusPanel } from '@/components/environment/SystemStatusPanel'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Panel, PanelBody, PanelHeader } from '@/components/ui/Panel'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { API_DOCS_URL } from '@/services/api'
import { cn } from '@/utils/cn'

type SettingsTab = 'environment' | 'ai' | 'preferences' | 'about'

const ICON = 'size-3.5'

const TABS = [
  { value: 'environment' as SettingsTab, label: 'Environment', icon: <Cpu className={ICON} aria-hidden="true" /> },
  { value: 'ai' as SettingsTab, label: 'AI configuration', icon: <KeyRound className={ICON} aria-hidden="true" /> },
  { value: 'preferences' as SettingsTab, label: 'Preferences', icon: <Settings2 className={ICON} aria-hidden="true" /> },
  { value: 'about' as SettingsTab, label: 'About', icon: <Info className={ICON} aria-hidden="true" /> },
]

/**
 * Settings.
 *
 * Everything on the Environment, AI and About tabs is read from the live API —
 * no invented values. Preferences lists what later phases add, because rendering
 * toggles that change nothing would be decoration.
 */
export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('environment')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Environment readiness, AI configuration and project information. Secrets are never displayed here — only whether they are set."
        actions={
          <ButtonLink to={API_DOCS_URL} variant="secondary" size="sm" external>
            API docs
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </ButtonLink>
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} label="Settings sections" />

      <div role="tabpanel" aria-label={tab} className="animate-enter pt-1">
        {tab === 'environment' ? <EnvironmentTab /> : null}
        {tab === 'ai' ? <AiTab /> : null}
        {tab === 'preferences' ? <PreferencesTab /> : null}
        {tab === 'about' ? <AboutTab /> : null}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- environment --- */

function EnvironmentTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <SystemStatusPanel />

      <Panel>
        <PanelHeader title="What each check means" />
        <PanelBody className="space-y-3">
          {[
            ['FFmpeg / FFprobe', 'Required for every upload validation, audio extraction and render.'],
            ['MongoDB', 'Stores users, projects, jobs, transcripts and clip metadata — never media.'],
            ['Media storage', 'Writable folder with enough free disk space for source video and outputs.'],
            ['OpenRouter AI', 'Optional. Only the moment-selection step needs it; local work continues without a key.'],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="text-[13px] font-medium text-fg">{title}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-fg-subtle">{body}</p>
            </div>
          ))}
          <Alert tone="info" title="Fix instructions live in the repo">
            <p>
              <span className="font-mono text-[11px]">docs/TROUBLESHOOTING.md</span> covers each
              failure mode, including PATH problems after installing FFmpeg.
            </p>
          </Alert>
        </PanelBody>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------- AI --- */

function AiTab() {
  const { status, isLoading, error } = useSystemStatus()
  const aiCheck = status?.checks.find((check) => check.id === 'openrouter')

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Provider', value: 'OpenRouter' },
    {
      label: 'Connection status',
      value: aiCheck ? (
        <Badge tone={aiCheck.status === 'ok' ? 'success' : 'warning'}>
          {aiCheck.status === 'ok' ? 'Configured' : 'Not configured'}
        </Badge>
      ) : (
        <Skeleton className="h-4 w-24" />
      ),
    },
    {
      label: 'API key',
      value: aiCheck?.status === 'ok' ? 'Stored in backend/.env (masked)' : 'Not set',
    },
    {
      label: 'Model selection',
      value: (
        <span className="font-mono text-[12px]">OPENROUTER_MODEL</span>
      ),
    },
    {
      label: 'Fallback models',
      value: <span className="font-mono text-[12px]">OPENROUTER_FALLBACK_MODELS</span>,
    },
  ]

  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <Panel>
        <PanelHeader
          title="AI configuration"
          description="Read from GET /api/v1/system/status — the key itself is never returned by the API"
        />
        <PanelBody className="space-y-0">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                'flex items-center justify-between gap-4 py-2.5',
                index !== rows.length - 1 && 'border-b border-line',
              )}
            >
              <span className="text-[13px] text-fg-muted">{row.label}</span>
              <span className="text-right text-[13px] text-fg">
                {isLoading && !status ? <Skeleton className="h-4 w-20" /> : row.value}
              </span>
            </div>
          ))}

          {error ? (
            <div className="pt-3">
              <Alert tone="danger" title="Could not read configuration">
                <p>{error.message}</p>
              </Alert>
            </div>
          ) : null}

          {aiCheck && aiCheck.status !== 'ok' ? (
            <div className="pt-3">
              <Alert tone="warning" title="AI analysis is disabled">
                <p>{aiCheck.hint}</p>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                >
                  Create a free key
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </Alert>
            </div>
          ) : null}
        </PanelBody>
      </Panel>

      <div className="space-y-3">
        <Panel>
          <PanelHeader title="Free quota usage" />
          <PanelBody>
            <p className="text-[13px] leading-relaxed text-fg-muted">
              No usage data exists yet. Every AI request will be logged to the{' '}
              <span className="font-mono text-[12px]">ai_usage</span> collection (model, status,
              latency, tokens) in Phase 5 — this panel will then show your own consumption instead
              of a guess.
            </p>
            <div className="mt-3 space-y-2">
              {['Requests this month', 'Rate-limit events', 'Cached responses'].map((label) => (
                <div key={label} className="flex items-center justify-between text-[12px]">
                  <span className="text-fg-muted">{label}</span>
                  <Badge tone="neutral">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Phase 5
                  </Badge>
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="How requests are kept cheap" />
          <PanelBody className="space-y-2">
            {[
              'One structured request per transcript chunk — never one per candidate',
              'Transcripts cached per project, so re-clipping costs zero transcription',
              'AI results cached by transcript + options hash',
              'Exponential backoff with a hard retry cap on 429/5xx',
            ].map((item) => (
              <p key={item} className="flex gap-2 text-[12px] leading-relaxed text-fg-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                {item}
              </p>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- preferences --- */

function PreferencesTab() {
  const groups = [
    {
      title: 'Profile & account',
      phase: 'Phase 2',
      items: ['Display name and email', 'Password change', 'Session list and sign-out everywhere'],
    },
    {
      title: 'Processing defaults',
      phase: 'Phase 6',
      items: [
        'Default clip count and duration window',
        'Default aspect ratio and resolution',
        'Default caption preset and position',
      ],
    },
    {
      title: 'Storage & retention',
      phase: 'Phase 7',
      items: [
        'Keep source uploads after rendering',
        'Auto-delete temporary files after N days',
        'Storage usage summary and cleanup',
      ],
    },
    {
      title: 'Appearance',
      phase: 'Planned',
      items: ['Dark is the only theme today', 'Density option for dense project lists'],
    },
  ]

  return (
    <div className="space-y-3">
      <Alert tone="info" title="Nothing here is rendered as a dead control">
        <p>
          These preferences need their backend settings to exist first. Showing switches that
          silently do nothing would be worse than showing the roadmap.
        </p>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <Panel key={group.title} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold text-fg">{group.title}</h3>
              <Badge tone="neutral">{group.phase}</Badge>
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="text-[12px] leading-relaxed text-fg-muted">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- about --- */

function AboutTab() {
  const { status, isLoading } = useSystemStatus()

  const stack = [
    ['Frontend', 'React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS 4'],
    ['Backend', 'FastAPI 0.165 · Pydantic 2 · PyMongo async driver'],
    ['Database', 'MongoDB Community 8 (local)'],
    ['Media', 'FFmpeg / FFprobe · faster-whisper · OpenCV'],
    ['AI', 'OpenRouter free models (structured JSON)'],
  ]

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr] lg:items-start">
      <Panel>
        <PanelHeader title="Application" />
        <PanelBody className="space-y-0">
          {[
            ['Name', status?.app.name ?? 'ChauleClips'],
            ['Version', status ? `v${status.app.version}` : '—'],
            ['Environment', status?.app.environment ?? '—'],
            ['Debug mode', status ? (status.app.debug ? 'on' : 'off') : '—'],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={cn(
                'flex items-center justify-between py-2.5',
                index !== 3 && 'border-b border-line',
              )}
            >
              <span className="text-[13px] text-fg-muted">{label}</span>
              <span className="text-[13px] text-fg">
                {isLoading && !status ? <Skeleton className="h-4 w-16" /> : value}
              </span>
            </div>
          ))}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Stack" />
        <PanelBody className="space-y-0">
          {stack.map(([label, value], index) => (
            <div
              key={label}
              className={cn(
                'py-2.5',
                index !== stack.length - 1 && 'border-b border-line',
              )}
            >
              <p className="text-[13px] text-fg">{label}</p>
              <p className="mt-0.5 text-[12px] text-fg-subtle">{value}</p>
            </div>
          ))}
        </PanelBody>
      </Panel>

      <Panel className="lg:col-span-2">
        <PanelBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-fg">ChauleClips</p>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              Find the moment. Create the story. · MIT licensed
            </p>
            <p className="mt-2 text-[12px] text-fg-subtle">
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
          <ButtonLink to="https://sajalchaulagain.com.np" external variant="secondary" size="sm">
            Portfolio
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </ButtonLink>
        </PanelBody>
      </Panel>
    </div>
  )
}
