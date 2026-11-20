import { ListVideo } from 'lucide-react'

import { PendingScreen } from '@/components/app/PendingScreen'

export function QueuePage() {
  return (
    <PendingScreen
      title="Processing queue"
      description="Jobs in progress with their real pipeline stage — inspect, transcribe, analyse, render."
      phase="Phase 6"
      icon={ListVideo}
      deliverables={[
        'Per-job stage timeline driven by backend transitions, not a timer',
        'Honest indeterminate progress when a stage cannot report a percentage',
        'Failure state with the exact error and a retry action where safe',
        'Interrupted-job recovery after a restart or crash',
      ]}
      alreadyWorking={[
        'Processing stage names and order agreed and used consistently across the UI',
        'Background worker package scaffolded separately from the API',
        'Job status indexes for recovery queries',
      ]}
    />
  )
}
