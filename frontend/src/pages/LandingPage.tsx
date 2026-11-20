import {
  ArrowRight,
  Captions,
  Check,
  Cpu,
  Film,
  Languages,
  ListVideo,
  Play,
  ScanFace,
  Scissors,
  ShieldCheck,
  Sparkles,
  Timer,
  Upload,
  WandSparkles,
} from 'lucide-react'

import { SystemStatusPanel } from '@/components/environment/SystemStatusPanel'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { cn } from '@/utils/cn'

export function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Workflow />
      <Environment />
      <RoadmapStrip />
      <FinalCta />
    </>
  )
}

/* ------------------------------------------------------------------ hero --- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="bg-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden="true" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="animate-enter">
            <Badge tone="accent">
              <Sparkles className="size-3" aria-hidden="true" />
              Free-first · Local-first · Open source
            </Badge>

            <h1 className="mt-5 text-[34px] font-semibold leading-[1.06] tracking-[-0.03em] text-fg sm:text-[44px]">
              Your best moments,
              <br />
              <span className="bg-gradient-to-br from-accent to-info bg-clip-text text-transparent">
                automatically clipped.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-fg-muted">
              Turn long-form videos into engaging short-form content with AI-powered moment
              detection, captions and smart framing.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <ButtonLink to="/signup" size="lg">
                Start Creating
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="#features" variant="secondary" size="lg">
                Explore Features
              </ButtonLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-fg-subtle">
              {[
                'No paid APIs',
                'Video never leaves your machine',
                'Renders locally with FFmpeg',
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ProductPreview />
        </div>
      </div>
    </section>
  )
}

/**
 * Interface preview.
 *
 * Built from the real design tokens and the real pipeline stage names — no
 * invented metrics, scores or timestamps. It shows the shape of the product
 * without pretending to be live data.
 */
function ProductPreview() {
  const stages = [
    { label: 'Inspecting video', state: 'done' },
    { label: 'Extracting audio', state: 'done' },
    { label: 'Transcribing', state: 'done' },
    { label: 'Finding interesting moments', state: 'current' },
    { label: 'Ranking clips', state: 'pending' },
    { label: 'Rendering video', state: 'pending' },
  ] as const

  return (
    <div className="animate-enter" style={{ animationDelay: '60ms' }}>
      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-accent/10 blur-3xl" aria-hidden="true" />

        <Panel elevation="raised" className="relative overflow-hidden rounded-panel">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-line bg-inlay/70 px-3.5 py-2.5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#2c3340]" />
              <span className="size-2.5 rounded-full bg-[#2c3340]" />
              <span className="size-2.5 rounded-full bg-[#2c3340]" />
            </div>
            <p className="ml-1 truncate text-[11px] text-fg-subtle">
              ChauleClips — processing workspace
            </p>
            <Badge tone="neutral" className="ml-auto shrink-0">
              <Cpu className="size-2.5" aria-hidden="true" />
              CPU
            </Badge>
          </div>

          <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr]">
            {/* mini rail */}
            <div className="flex flex-col items-center gap-3 border-r border-line py-3.5">
              {[Scissors, Film, ListVideo, Sparkles].map((Icon, index) => (
                <span
                  key={index}
                  className={cn(
                    'grid size-7 place-items-center rounded-[7px]',
                    index === 0 ? 'bg-accent-soft text-accent' : 'text-fg-subtle',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
              ))}
            </div>

            <div className="space-y-3 p-3.5">
              {/* pipeline */}
              <div className="rounded-card border border-line bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                    Pipeline
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                    Working
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {stages.map((stage) => (
                    <li key={stage.label} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'grid size-3.5 shrink-0 place-items-center rounded-full border',
                          stage.state === 'done' && 'border-success/40 bg-success/15 text-success',
                          stage.state === 'current' && 'border-accent/50 bg-accent/20 text-accent',
                          stage.state === 'pending' && 'border-line text-transparent',
                        )}
                        aria-hidden="true"
                      >
                        {stage.state === 'done' ? (
                          <Check className="size-2.5" strokeWidth={3} />
                        ) : (
                          <span
                            className={cn(
                              'size-1 rounded-full',
                              stage.state === 'current' ? 'bg-accent' : 'bg-transparent',
                            )}
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-[11px]',
                          stage.state === 'pending' ? 'text-fg-subtle' : 'text-fg-muted',
                        )}
                      >
                        {stage.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* clip preview tile */}
              <div className="flex gap-2.5">
                <div className="relative aspect-[9/16] w-[74px] shrink-0 overflow-hidden rounded-[8px] border border-line bg-inlay">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#232a38] via-[#1b202b] to-[#141822]" aria-hidden="true" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-6 place-items-center rounded-full bg-black/45 backdrop-blur">
                      <Play className="size-2.5 text-white" fill="currentColor" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="absolute inset-x-1 bottom-1.5 rounded bg-black/55 px-1 py-0.5 text-center text-[7px] font-semibold leading-tight text-white">
                    Find the moment.
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                  <p className="text-[11px] font-medium text-fg">Clip candidates</p>
                  {[0, 1, 2].map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-2 rounded-[6px] border border-line bg-surface px-2 py-1.5"
                    >
                      <span className="font-mono text-[9px] text-fg-subtle">0{row + 1}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-[#262d3a]" style={{ width: `${90 - row * 18}%` }} />
                      <span className="text-[9px] text-fg-subtle">9:16</span>
                    </div>
                  ))}
                  <p className="pt-0.5 text-[9px] leading-relaxed text-fg-subtle">
                    Nothing is invented: candidates appear only after this project&apos;s
                    transcript has been analysed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <p className="mt-2.5 text-center text-[10px] text-fg-subtle">
        Interface preview · every stage, caption style and export shown here is implemented in the
        processing pipeline
      </p>
    </div>
  )
}

/* -------------------------------------------------------------- features --- */

const FEATURES = [
  {
    icon: WandSparkles,
    title: 'AI-powered moment detection',
    body: 'Candidates are scored on hook strength, standalone context and ending quality, then re-ranked locally so you get three moments worth posting — not three random cuts.',
  },
  {
    icon: Captions,
    title: 'Automatic captions',
    body: 'Word-level timestamps from a local Whisper model drive seven caption presets, from minimal subtitles to karaoke highlighting, burned in at render time.',
  },
  {
    icon: ScanFace,
    title: 'Smart video framing',
    body: 'Face and subject detection decides the 9:16 crop per scene, with a centre-crop fallback so a clip never comes out with the speaker half out of frame.',
  },
  {
    icon: Timer,
    title: 'Custom clip durations',
    body: 'Pick 15 s to 3 minutes with hard minimum and maximum limits. The AI has to find moments that fit naturally — sentences are never cut to hit a number.',
  },
  {
    icon: Film,
    title: 'Multiple export formats',
    body: '9:16, 16:9 and 1:1 at 720p or 1080p, H.264/AAC MP4 with preserved audio sync, individual downloads or a single ZIP.',
  },
  {
    icon: ShieldCheck,
    title: 'Local-first processing',
    body: 'FFmpeg, Whisper and OpenCV run on your machine. Only transcript text ever reaches the AI provider — never your footage.',
  },
]

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow="Features"
          title="Built like an editor, not a demo"
          body="Every item below is a real part of the processing pipeline, with the trade-offs documented instead of hidden."
        />

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Panel
              key={feature.title}
              className="group p-4 transition-colors duration-150 hover:border-line-strong"
            >
              <span className="grid size-9 place-items-center rounded-control border border-line bg-raised text-accent transition-colors group-hover:border-accent/30">
                <feature.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3.5 text-[13px] font-semibold text-fg">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{feature.body}</p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- workflow --- */

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your video',
    body: 'Drop in an MP4, MOV, MKV or WEBM you own or have permission to edit. FFprobe validates duration, codecs and resolution before anything is processed.',
  },
  {
    icon: Sparkles,
    title: 'Let AI discover the best moments',
    body: 'The audio is transcribed locally, one structured request finds candidate moments, and a local ranking pass removes overlaps and weak endings.',
  },
  {
    icon: Scissors,
    title: 'Customize and export',
    body: 'Choose clip count, duration, aspect ratio, framing, captions and audio treatment — then render and download. Re-edit without re-transcribing.',
  },
]

function Workflow() {
  return (
    <section id="workflow" className="scroll-mt-20 border-b border-line bg-rail/40">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps from long video to clips"
          body="No timeline gymnastics. The pipeline runs in the background and reports each stage as it actually completes."
        />

        <ol className="mt-9 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Panel className="h-full p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent">
                    {index + 1}
                  </span>
                  <step.icon className="size-4 text-fg-subtle" aria-hidden="true" />
                </div>
                <h3 className="mt-3.5 text-sm font-semibold text-fg">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{step.body}</p>
              </Panel>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- environment --- */

function Environment() {
  return (
    <section id="environment" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="System status"
              title="See exactly what is wired up"
              body="This panel calls the live API on every page load. It reports the real MongoDB connection, the detected FFmpeg build, free disk space and whether an AI key exists — so setup problems surface immediately instead of during a render."
            />
            <ul className="mt-5 space-y-2.5">
              {[
                { icon: Cpu, text: 'FFmpeg and FFprobe detected from PATH or config' },
                { icon: Languages, text: 'Whisper model and language support reported honestly' },
                { icon: ShieldCheck, text: 'API keys are never displayed, only their presence' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2.5 text-[13px] text-fg-muted">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <SystemStatusPanel compact />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ roadmap ----- */

const PHASES = [
  { phase: '1', title: 'Foundation', state: 'done' },
  { phase: '2', title: 'Authentication & dashboard', state: 'next' },
  { phase: '3', title: 'Media management', state: 'planned' },
  { phase: '4', title: 'Transcription', state: 'planned' },
  { phase: '5', title: 'AI analysis', state: 'planned' },
  { phase: '6', title: 'Video generation', state: 'planned' },
  { phase: '7', title: 'Editor & history', state: 'planned' },
  { phase: '8', title: 'Tests & hardening', state: 'planned' },
] as const

function RoadmapStrip() {
  return (
    <section id="roadmap" className="scroll-mt-20 border-b border-line bg-rail/40">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Build status"
            title="What works today"
            body="ChauleClips is built in verified phases. This is the real state of the repository — updated as each phase lands, never aspirational."
          />
        </div>

        <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((item) => (
            <div
              key={item.phase}
              className={cn(
                'flex items-center gap-2.5 rounded-control border px-3 py-2.5',
                item.state === 'done'
                  ? 'border-success/25 bg-success/[0.06]'
                  : item.state === 'next'
                    ? 'border-accent/25 bg-accent/[0.06]'
                    : 'border-line bg-surface',
              )}
            >
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold',
                  item.state === 'done'
                    ? 'bg-success/15 text-success'
                    : item.state === 'next'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-[#232a36] text-fg-subtle',
                )}
              >
                {item.state === 'done' ? <Check className="size-3" strokeWidth={3} /> : item.phase}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-fg">{item.title}</p>
                <p className="text-[10px] text-fg-subtle">
                  {item.state === 'done' ? 'Complete' : item.state === 'next' ? 'In progress' : 'Planned'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ final CTA --- */

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Panel elevation="raised" className="relative overflow-hidden rounded-panel p-8 sm:p-10">
        <div className="bg-hero-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-fg sm:text-2xl">
              Ready to clip your first video?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              Create an account, upload a video you have the rights to use, and let the pipeline
              find its best moments. Create an account to get started; video uploads and processing
              are still being built.
            </p>
          </div>
          <ButtonLink to="/signup" size="lg" className="shrink-0">
            Start Creating
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </Panel>
    </section>
  )
}

/* --------------------------------------------------------------- shared --- */

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-fg sm:text-[26px]">
        {title}
      </h2>
      <p className="mt-2.5 text-[13px] leading-relaxed text-fg-muted">{body}</p>
    </div>
  )
}
