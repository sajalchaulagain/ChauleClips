import { LayoutDashboard } from 'lucide-react'

import { PendingScreen } from '@/components/app/PendingScreen'
import { ButtonLink } from '@/components/ui/Button'

export function DashboardPage() {
  return (
    <PendingScreen
      title="Dashboard"
      description="Your workspace at a glance: projects, clips and what is currently processing."
      phase="Phase 2"
      icon={LayoutDashboard}
      action={
        <ButtonLink to="/settings" variant="secondary" size="sm">
          Check environment
        </ButtonLink>
      }
      deliverables={[
        'Welcome header with a prominent New Project action',
        'Four real counters — total projects, clips generated, processing, completed — read from MongoDB per signed-in user',
        'Recent projects grid with thumbnail, duration, status, clip count and date',
        'An empty state that explains the first step instead of showing blank cards',
      ]}
      alreadyWorking={[
        'App shell, navigation and breadcrumbs',
        'Live API/environment indicator in the top bar',
        'MongoDB connection with per-user indexes ready',
      ]}
    />
  )
}
