import { Captions } from 'lucide-react'

import { PendingScreen } from '@/components/app/PendingScreen'

export function TemplatesPage() {
  return (
    <PendingScreen
      title="Templates"
      description="Reusable caption and framing presets so every clip in a series looks the same."
      phase="Phase 6"
      icon={Captions}
      deliverables={[
        'Seven caption presets — minimal, bold, karaoke, professional, podcast, gradient, centred',
        'Saved combinations of aspect ratio, framing and audio treatment',
        'Live caption preview rendered with the same font and timing as the exported video',
        'Presets stored per user and applied in one click when creating a project',
      ]}
      alreadyWorking={[
        'Design-system building blocks for the preset picker',
        'Caption settings schema agreed in docs/AI_PIPELINE.md',
        'FFmpeg drawtext/ASS rendering path planned and documented',
      ]}
    />
  )
}
