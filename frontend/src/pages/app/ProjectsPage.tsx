import { FolderOpen } from 'lucide-react'

import { PendingScreen } from '@/components/app/PendingScreen'

export function ProjectsPage() {
  return (
    <PendingScreen
      title="Projects"
      description="Upload an authorised video, configure the output, and start the clipping pipeline."
      phase="Phase 3"
      icon={FolderOpen}
      deliverables={[
        'Drag-and-drop upload for MP4, MOV, MKV and WEBM with real progress and cancellation',
        'FFprobe validation of duration, resolution, codecs and file integrity before processing',
        'Authorised-URL input limited to metadata and preview — no downloader',
        'Project library with search, filters, sorting and per-project actions',
      ]}
      alreadyWorking={[
        'Design-system controls the configuration screen will use (segmented selectors, sliders, switches)',
        'Storage folders created and writability checked by the API',
        'Typed, paginated error contract for upload failures',
      ]}
    />
  )
}
