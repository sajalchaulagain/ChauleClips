import { Film } from 'lucide-react'

import { PendingScreen } from '@/components/app/PendingScreen'

export function ClipsPage() {
  return (
    <PendingScreen
      title="Clips"
      description="Every rendered clip across your projects, ready to preview, edit or download."
      phase="Phase 7"
      icon={Film}
      deliverables={[
        'Grid of rendered clips with vertical preview, title, duration and AI score',
        'Editor for trimming, caption style, framing and audio with real re-export',
        'Individual download and a ZIP of the whole project',
        'Delete with file cleanup that never touches another user’s media',
      ]}
      alreadyWorking={[
        'Design tokens and card surfaces for the clip grid',
        'Video preview frame with correct aspect-ratio handling',
        'Clip and job indexes prepared in MongoDB',
      ]}
    />
  )
}
